import { Session } from "../models/Session";
import { ACTION_POINTS_PER_ROUND } from "./constants";
import { scaleOwnerPoints } from "./field";
import { getPoints } from "./player";
import { ROUNDS } from "./constants";

export function nextTurn(
    session: InstanceType<typeof Session>,
    playerRole: "player_a" | "player_b"
) {
    if (playerRole === "player_a") {
        session.action_points_a += ACTION_POINTS_PER_ROUND;
    } else {
        session.action_points_b += ACTION_POINTS_PER_ROUND;
    }

    const board = session.board.toObject();

    session.points_a = getPoints(board, "player_a");
    session.points_b = getPoints(board, "player_b");

    if (session.currentRound > ROUNDS) {
        session.status = "completed";
        session.winner = session.points_a > session.points_b ? "player_a" : session.points_b > session.points_a ? "player_b" : "draw";
        return;
    }

    session.playerTurn = session.playerTurn === "player_a" ? "player_b" : "player_a";
    session.currentRound += 1;

    for (let row of board) {
        for (let field of row) {
            if (field.owner) {
                scaleOwnerPoints(field);
            }
        }
    }
}
