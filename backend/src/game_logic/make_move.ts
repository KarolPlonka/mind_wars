import { Session } from "../models/Session";
import { Player } from "../models/Player";
import { Field } from "../models/Field";
import { takeoverField } from "./field";
import { OutOfRangeError } from "./invalid_move_error";
import { nextTurn } from "./session";
import { getPlayerRole } from "./player";

function is_move_in_range(
    board: InstanceType<typeof Field>[][],
    playerRole: "player_a" | "player_b",
    x: number,
    y: number
): boolean {
    const directions = [
        [0, 1],  // right
        [1, 0],  // down
        [0, -1], // left
        [-1, 0], // up
        [1, 1],  // down-right
        [1, -1], // down-left
        [-1, 1], // up-right
        [-1, -1] // up-left
    ];

    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < board.length && ny >= 0 && ny < board[0].length) {
            if (board[nx][ny].owner === playerRole) {
                return true;
            }
        }
    }

    return false;
}


export function makeMove(
    session: InstanceType<typeof Session>,
    player: InstanceType<typeof Player>,
    fieldX: number,
    fieldY: number
): Promise<InstanceType<typeof Session>> {
    const playerRole = getPlayerRole(session, player);

    if (session.playerTurn !== playerRole) {
        throw new Error("Not your turn");
    }

    if (fieldX < 0 || fieldX > 9 || fieldY < 0 || fieldY > 9) {
        throw new Error("Invalid field coordinates");
    }

    const board = session.board.toObject();

    if (!is_move_in_range(board, playerRole, fieldX, fieldY)) {
        throw new OutOfRangeError("Field is out of range");
    }

    const field = board[fieldX][fieldY];

    takeoverField(field, session, playerRole, session.currentRound);

    const actionPoints = playerRole === "player_a" ? session.action_points_a : session.action_points_b;

    if (actionPoints <= 0) {
        nextTurn(session, playerRole);
    }

    return session.save();
}
