import { EventEmitter } from "events";

import { Router } from "express";
import { Session } from "../models/Session";
import { Player } from "../models/Player";

const router = Router();

export const sessionEmitter = new EventEmitter();

router.get("/", async (_req, res) => {
    const sessions = await Session.find()
        .populate('player_a')
        .populate('player_b');
    res.json(sessions);
});

router.get("/:id", async (req, res) => {
    const session = await Session.findById(req.params.id)
        .populate('player_a')
        .populate('player_b');
    
    if (session) {
        res.json(session);
    } else {
        res.status(404).json({ message: "Session not found" });
    }
});

router.post("/", async (req, res) => {
    const session = new Session({ name: req.body.name });
    await session.save();
    res.json(session);
});

router.post("/:id/join", async (req, res) => {
    const session = await Session.findById(req.params.id);
    if (!session) {
        return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "waiting") {
        return res.status(400).json({ message: "Session is not available to join" });
    }

    if (session.player_a && session.player_b) {
        return res.status(400).json({ message: "Session is already full" });
    }

    const { playerToken } = req.body;
    if (!playerToken) {
        return res.status(400).json({ message: "playerToken is required" });
    }

    const player = await Player.findOne({ token: playerToken });
    if (!player) {
        console.log("Player not found for token:", playerToken);
        return res.status(404).json({ message: "Player not found" });
    }

    if (
        (session.player_a && session.player_a.toString() === player._id.toString()) ||
        (session.player_b && session.player_b.toString() === player._id.toString())
    ) {
        return res.status(400).json({ message: "Player already in session" });
    }

    if (!session.player_a) {
        session.player_a = player._id;
    } else if (!session.player_b) {
        session.player_b = player._id;
    }

    if (session.player_a && session.player_b) {
        session.status = "active";
        session.playerTurn = "player_a"; // Player A starts
    }

    await session.save();

    sessionEmitter.emit('session_updated', session._id.toString());

    const populatedSession = await Session.findById(session._id)
        .populate('player_a')
        .populate('player_b');

    res.json(populatedSession);
});

router.get("/:id/stream", async (req, res) => {
    const sessionId = req.params.id;
    
    const session = await Session.findById(sessionId);
    if (!session) {
        return res.status(404).json({ message: "Session not found" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(`data: ${JSON.stringify({ type: 'connected', sessionId })}\n\n`);

    const currentSession = await Session.findById(sessionId)
        .populate('player_a')
        .populate('player_b');
    
    res.write(`data: ${JSON.stringify({ type: 'session_update', session: currentSession })}\n\n`);

    const updateHandler = async (updatedSessionId: string) => {
        if (updatedSessionId === sessionId) {
            const updatedSession = await Session.findById(sessionId)
                .populate('player_a')
                .populate('player_b');
            
            if (updatedSession) {
                res.write(`data: ${JSON.stringify({ type: 'session_update', session: updatedSession })}\n\n`);
            }
        }
    };

    sessionEmitter.on('session_updated', updateHandler);

    // TODO: Change interval to 30 after testing
    const heartbeatInterval = setInterval(() => {
        res.write(`:heartbeat\n\n`);
    }, 1000);

    req.on('close', () => {
        clearInterval(heartbeatInterval);
        sessionEmitter.removeListener('session_updated', updateHandler);
        res.end();
    });
});

export default router;
