import { Field } from '../models/Field';
import { Session } from '../models/Session';
import {
    BLOCK_TIME,
    TAKEOVERS_TO_BLOCK,
    TAKEOVERS_TO_BLOCK_TIME_RANGE
} from './constants';
import {
    FieldBlockedError,
    FieldAlreadyOwnedError,
    InsufficientPointsError
} from './invalid_move_error';


export function takeoverField(
    field: InstanceType<typeof Field>,
    session: InstanceType<typeof Session>,
    playerRole: "player_a" | "player_b",
    currentRound: number
) {
    if (field.owner?.toString() === playerRole) {
        throw new FieldAlreadyOwnedError("This player already owns this field");
    }

    if (field.blockUntilRound && field.blockUntilRound > currentRound) {
        throw new FieldBlockedError("This field is currently blocked");
    }

    const actionPoints = playerRole === "player_a" ? session.action_points_a : session.action_points_b;

    if (actionPoints < field.cost) {
        throw new InsufficientPointsError("Not enough points to takeover this field");
    }

    field.owner = playerRole;
    field.ownerPoints = 1;

    if (shouldBlockField(field, currentRound)) {
        field.blockUntilRound = currentRound + BLOCK_TIME;
    }

    field.takeoverHistory.push({
        round: currentRound,
        player: playerRole
    });

    if (playerRole === "player_a") {
        session.action_points_a -= field.cost;
    } else {
        session.action_points_b -= field.cost;
    }
    
    field.cost = field.baseCost * field.income + 1;
}

export function scaleOwnerPoints(field: InstanceType<typeof Field>) {
    if (!field.owner) {
        throw new Error("Field has no owner to scale points for");
    }
    if (field.ownerPoints === 0) {
        console.log(field); 
        throw new Error("Field owner points is zero, cannot scale");
    }

    field.ownerPoints += field.income;
}

function shouldBlockField(
    field: InstanceType<typeof Field>,
    currentRound: number
): boolean {
    if (!field.takeoverHistory || field.takeoverHistory.length < TAKEOVERS_TO_BLOCK) {
        return false;
    }

    const recentTakeovers = field.takeoverHistory
        .filter(entry => entry.round >= currentRound - TAKEOVERS_TO_BLOCK_TIME_RANGE);

    return recentTakeovers.length >= TAKEOVERS_TO_BLOCK;
}

