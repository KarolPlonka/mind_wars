import { Schema, model } from "mongoose";


export const fieldSchema = new Schema({
    baseCost: { type: Number, required: true, default: 1 },
    cost: { type: Number, required: true, default: 1 },
    income: { type: Number, required: true, default: 1 },
    ownerPoints: { type: Number, required: true, default: 0 },
    owner: { 
        type: String, 
        enum: ["player_a", "player_b", null],
        default: null 
    },
    blockUntilRound: { type: Number, default: null },
    takeoverHistory: { 
        type: [{
            round: { type: Number, required: true },
            player: { 
                type: String, 
                enum: ["player_a", "player_b"],
            }
        }],
        default: [] 
    }
});

export const Field = model("Field", fieldSchema);
