import { Router } from "express";

import { validatePlayerInSession } from "../auth";
import { Session } from "../models/Session";
import { makeMove } from "../game_logic/make_move";
import { endTurn } from "../game_logic/end_turn";
import { InvalidMoveError } from "../game_logic/invalid_move_error";
import { sessionEmitter } from "./sessions";

interface MakeMoveRequest {
    sessionId: string;
    playerToken: string;
    fieldX: number;
    fieldY: number;
}

const router = Router();

router.post("/make_move", async (req, res) => {
    const { sessionId, playerToken, fieldX, fieldY } = req.body as MakeMoveRequest;
    
    // Populate players when fetching
    const session = await Session.findById(sessionId)
        .populate('player_a')
        .populate('player_b');
    
    if (!session) {
        return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "active") {
        return res.status(400).json({ message: "Session is not active" });
    }

    const validationResult = await validatePlayerInSession(playerToken, session);
    if (!validationResult.isValid) {
        return res.status(validationResult.errorStatus!).json({ 
            message: validationResult.errorMessage 
        });
    }

    const { player: requestingPlayer, playerRole: requestingPlayerRole } = validationResult;

    if (session.playerTurn !== requestingPlayerRole) {
        return res.status(400).json({ message: "Not your turn" });
    }

    if (fieldX < 0 || fieldX >= 9 || fieldY < 0 || fieldY >= 9) {
        return res.status(400).json({ message: "Invalid field coordinates" });
    }

    try {
        const updatedSession = await makeMove(session, requestingPlayer!, fieldX, fieldY);
        
        sessionEmitter.emit('session_updated', updatedSession._id.toString());
        
        const populatedSession = await Session.findById(updatedSession._id)
            .populate('player_a')
            .populate('player_b');
        
        res.json(populatedSession);
    } catch (error) {
        if (error instanceof InvalidMoveError) {
            return res.status(400).json({ message: error.message });
        } else {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
});

router.post("/end_turn", async (req, res) => {
    const { sessionId, playerToken } = req.body as { sessionId: string; playerToken: string };
    
    // Populate players when fetching
    const session = await Session.findById(sessionId)
        .populate('player_a')
        .populate('player_b');
    
    if (!session) {
        console.log("Session not found for ID:", sessionId);
        return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "active") {
        return res.status(400).json({ message: "Session is not active" });
    }

    const validationResult = await validatePlayerInSession(playerToken, session);
    if (!validationResult.isValid) {
        console.log("Validation failed:", validationResult.errorMessage);
        return res.status(validationResult.errorStatus!).json({ 
            message: validationResult.errorMessage 
        });
    }

    const { player: requestingPlayer, playerRole: requestingPlayerRole } = validationResult;

    if (session.playerTurn !== requestingPlayerRole) {
        return res.status(400).json({ message: "Not your turn" });
    }

    try {
        const updatedSession = await endTurn(session, requestingPlayer!);
        sessionEmitter.emit('session_updated', updatedSession._id.toString());
        
        const populatedSession = await Session.findById(updatedSession._id)
            .populate('player_a')
            .populate('player_b');
        
        res.json(populatedSession);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
