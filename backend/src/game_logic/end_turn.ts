import { Session } from "../models/Session";
import { Player } from "../models/Player";
import { nextTurn } from "./session";
import { getPlayerRole } from "./player";

export function endTurn(
    session: InstanceType<typeof Session>,
    player: InstanceType<typeof Player>
)  : Promise<InstanceType<typeof Session>> {
    const playerRole = getPlayerRole(session, player);

    if (session.playerTurn !== playerRole) {
        throw new Error("Not your turn");
    }

    nextTurn(session, playerRole);

    return session.save();
}
