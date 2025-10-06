import { Schema, model } from "mongoose";
import { fieldSchema } from "./Field";
import { ACTION_POINTS_PER_ROUND } from "../game_logic/constants";

const createEmptyBoard = () => {
    const board = Array(9).fill(null).map((_, row) => 
        Array(9).fill(null).map((_, col) => {
            let income = 1;
            let cost = 1;
            
            // Middle field (4,4) = 3 points
            if (row === 4 && col === 4) {
                cost = 6;
                income = 3;
            } else if ((row === 8 && col === 0) || (row === 0 && col === 8)) {
                cost = 2;
                income = 2;
            }

            let owner = null;
            if (row === 0 && col === 0) {
                owner = "player_a";
            } else if (row === 8 && col === 8) {
                owner = "player_b";
            }
            
            return { 
                baseCost: cost,
                cost: cost,
                income: income,
                ownerPoints: owner ? 1 : 0,
                owner: owner,
                blockUntilRound: null,
                takeoverHistory: []
            };
        })
    );
    return board;
};

const sessionSchema = new Schema({
    name: { type: String, required: true },
    player_a: { type: Schema.Types.ObjectId, ref: 'Player', default: null },
    player_b: { type: Schema.Types.ObjectId, ref: 'Player', default: null },
    action_points_a: { type: Number, default: ACTION_POINTS_PER_ROUND },
    action_points_b: { type: Number, default: ACTION_POINTS_PER_ROUND },
    points_a: { type: Number, default: 0 },
    points_b: { type: Number, default: 0 },
    board: { type: [[fieldSchema]], default: createEmptyBoard },
    playerTurn: { type: String, enum: ["player_a", "player_b"], default: "player_a" },
    currentRound: { type: Number, default: 1 },
    status: { type: String, enum: ["waiting", "active", "completed"], default: "waiting" },
    winner: { type: String, enum: ["player_a", "player_b", "draw", null], default: null }
});

export const Session = model("Session", sessionSchema);

