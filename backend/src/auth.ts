import { Session } from "./models/Session";
import { Player } from "./models/Player";

export interface PlayerValidationResult {
    isValid: boolean;
    player?: typeof Player.prototype;
    playerRole?: "player_a" | "player_b";
    errorStatus?: number;
    errorMessage?: string;
}

export async function validatePlayerInSession(
    player_token: string,
    session: typeof Session.prototype
): Promise<PlayerValidationResult> {
    // Check if player exists
    const requestingPlayer = await Player.findOne({ token: player_token });
    console.log("Validating player with token:", player_token, "in session:", session._id);
    if (!requestingPlayer) {
        return {
            isValid: false,
            errorStatus: 404,
            errorMessage: "Player not found"
        };
    }

    // Check if player is part of the session
    const playerAToken = session.player_a?.token;
    const playerBToken = session.player_b?.token;
    
    let requestingPlayerRole: "player_a" | "player_b" | undefined;
    
    if (playerAToken === player_token) {
        requestingPlayerRole = "player_a";
    } else if (playerBToken === player_token) {
        requestingPlayerRole = "player_b";
    } else {
        return {
            isValid: false,
            errorStatus: 403,
            errorMessage: "Player not part of this session"
        };
    }

    return {
        isValid: true,
        player: requestingPlayer,
        playerRole: requestingPlayerRole
    };
}

