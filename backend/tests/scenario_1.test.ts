
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app"; // adjust the path to your Express app
import { ACTION_POINTS_PER_ROUND } from "../src/game_logic/constants";

beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/test_db");
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("Session API", () => {
    it("should create a session", async () => {
        const createPlayerAResponse = await request(app).post("/api/v1/players").send({ name: "Alice" });
        expect(createPlayerAResponse.status).toBe(200);
        const playerAToken = createPlayerAResponse.body.token;

        const createPlayerBResponse = await request(app).post("/api/v1/players").send({ name: "Bob" });
        expect(createPlayerBResponse.status).toBe(200);
        const playerBToken = createPlayerBResponse.body.token;

        const createSessionResponse = await request(app).post("/api/v1/sessions").send({ name: "Test Session" });
        expect(createSessionResponse.status).toBe(200);
        const sessionId = createSessionResponse.body._id;

        const joinPlayerAResponse = await request(app)
            .post(`/api/v1/sessions/${sessionId}/join`)
            .send({ playerToken: playerAToken });
        expect(joinPlayerAResponse.status).toBe(200);

        const joinPlayerBResponse = await request(app)
            .post(`/api/v1/sessions/${sessionId}/join`)
            .send({ playerToken: playerBToken });
        expect(joinPlayerBResponse.status).toBe(200);

        const getSessionResponse = await request(app).get(`/api/v1/sessions/${sessionId}`);
        expect(getSessionResponse.status).toBe(200);
        expect(getSessionResponse.body.player_a.token).toBe(playerAToken);
        expect(getSessionResponse.body.player_b.token).toBe(playerBToken);
        expect(getSessionResponse.body.status).toBe("active");
        expect(getSessionResponse.body.playerTurn).toBe("player_a");

        const makeMove1Response = await request(app)
            .post("/api/v1/play/make_move")
            .send({ sessionId, playerToken: playerAToken, fieldX: 0, fieldY: 0 });
        expect(makeMove1Response.status).toBe(200);
        expect(makeMove1Response.body.playerTurn).toBe("player_a");
        expect(makeMove1Response.body.currentRound).toBe(2);
        expect(makeMove1Response.body.action_points_a).toBe(ACTION_POINTS_PER_ROUND - 1);

        const makeMove2Response = await request(app)
            .post("/api/v1/play/make_move")
            .send({ sessionId, playerToken: playerAToken, fieldX: 0, fieldY: 1 });
        expect(makeMove2Response.status).toBe(200);

        const makeMove3Response = await request(app)
            .post("/api/v1/play/make_move")
            .send({ sessionId, playerToken: playerAToken, fieldX: 0, fieldY: 2 });
        expect(makeMove3Response.status).toBe(200);
        expect(makeMove3Response.body.playerTurn).toBe("player_b");
    });
});


