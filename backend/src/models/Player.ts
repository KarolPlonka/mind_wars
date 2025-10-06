import { Schema, model } from "mongoose";
import { randomBytes } from "crypto";

export const playerSchema = new Schema({
    name: { type: String },
    token: {
        type: String,
        required: true,
        unique: true,
        default: () => randomBytes(32).toString('hex')
    },
});

export const Player = model("Player", playerSchema);
