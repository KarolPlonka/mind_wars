import request from "supertest";
import mongoose from "mongoose";
import http from "http";
import app from "../src/app";
import { env } from "../src/env";
import { ACTION_POINTS_PER_ROUND } from "../src/game_logic/constants";

let server: http.Server;

beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/test_db");
    // Start the server
    server = app.listen(env.PORT);
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for server to start
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    // Close the server
    await new Promise<void>((resolve) => {
        server.close(() => resolve());
    });
});

function createSSEListener(sessionId: string) {
    const receivedUpdates: any[] = [];
    let isConnected = false;

    const req = http.request({
        hostname: 'localhost',
        port: env.PORT,
        path: `/api/v1/sessions/${sessionId}/stream`,
        method: 'GET',
        headers: {
            'Accept': 'text/event-stream',
        }
    }, (res) => {
        let buffer = '';

        res.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.substring(6));
                    if (data.type === 'connected') {
                        isConnected = true;
                    } else if (data.type === 'session_update') {
                        receivedUpdates.push(data.session);
                    }
                }
            }
        });
    });

    req.end();

    return {
        getUpdates: () => receivedUpdates,
        isConnected: () => isConnected,
        close: () => req.destroy()
    };
}

// Rest of your test remains the same
describe("Session SSE", () => {
    it("should receive session updates via SSE after moves", async () => {
        // Create players
        const playerAResponse = await request(app).post("/api/v1/players").send({ name: "Alice" });
        const playerAToken = playerAResponse.body.token;
        
        const playerBResponse = await request(app).post("/api/v1/players").send({ name: "Bob" });
        const playerBToken = playerBResponse.body.token;

        // Create and join session
        const sessionResponse = await request(app).post("/api/v1/sessions").send({ name: "SSE Test" });
        const sessionId = sessionResponse.body._id;

        await request(app).post(`/api/v1/sessions/${sessionId}/join`).send({ playerToken: playerAToken });
        await request(app).post(`/api/v1/sessions/${sessionId}/join`).send({ playerToken: playerBToken });

        // Start listening to SSE
        const sseListener = createSSEListener(sessionId);

        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 200));
        expect(sseListener.isConnected()).toBe(true);

        // Get initial number of updates
        const initialUpdateCount = sseListener.getUpdates().length;
        expect(initialUpdateCount).toBeGreaterThanOrEqual(1); // Should have initial state

        // Make first move
        await request(app)
            .post("/api/v1/play/make_move")
            .send({ sessionId, playerToken: playerAToken, fieldX: 0, fieldY: 0 });

        // Wait for SSE update
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check if new update was received
        let updates = sseListener.getUpdates();
        expect(updates.length).toBe(initialUpdateCount + 1);
        expect(updates[updates.length - 1].action_points_a).toBe(ACTION_POINTS_PER_ROUND - 1);
        expect(updates[updates.length - 1].currentRound).toBe(2);

        // Make second move
        await request(app)
            .post("/api/v1/play/make_move")
            .send({ sessionId, playerToken: playerAToken, fieldX: 0, fieldY: 1 });

        // Wait for SSE update
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check if another update was received
        updates = sseListener.getUpdates();
        expect(updates.length).toBe(initialUpdateCount + 2);
        expect(updates[updates.length - 1].action_points_a).toBe(ACTION_POINTS_PER_ROUND - 2);
        expect(updates[updates.length - 1].currentRound).toBe(3);
        expect(updates[updates.length - 1].playerTurn).toBe("player_a");

        // Make third move (should trigger turn change)
        await request(app)
            .post("/api/v1/play/make_move")
            .send({ sessionId, playerToken: playerAToken, fieldX: 0, fieldY: 2 });

        // Wait for SSE update
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check turn changed
        updates = sseListener.getUpdates();
        expect(updates.length).toBe(initialUpdateCount + 3);
        expect(updates[updates.length - 1].playerTurn).toBe("player_b");

        // Close SSE connection
        sseListener.close();
    });
});
