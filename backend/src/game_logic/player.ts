import { Player } from '../models/Player';
import { Session } from '../models/Session';
import { Field, fieldSchema } from '../models/Field';

// // TODO: add proper points calculation
// export function getPoints(
//     session: InstanceType<typeof Session>,
//     playerRole: "player_a" | "player_b"
// ): number {
//     let points = 0;
//     const board = session.board.toObject();
//     for (let row of board) {
//         for (let field of row) {
//             if (field.owner === playerRole) {
//                 points += field.basePoints;
//             }
//         }
//     }
//     return points;
// }

export function getPlayerRole(
    session: InstanceType<typeof Session>,
    player: InstanceType<typeof Player>
): "player_a" | "player_b" {
    if (session.player_a?._id.toString() === player._id.toString()) {
        return "player_a";
    } else if (session.player_b?._id.toString() === player._id.toString()) {
        return "player_b";
    }
    throw new Error("Player not in session");
}


export function getPoints(
    board: InstanceType<typeof Field>[][],
    playerRole: "player_a" | "player_b"
): number {
    let points = 0;
    for (let row of board) {
        for (let field of row) {
            if (field.owner === playerRole) {
                points += field.ownerPoints;;
            }
        }
    }
    return points;
}
