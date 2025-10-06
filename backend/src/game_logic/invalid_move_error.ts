export class InvalidMoveError extends Error {
    constructor(message = "Invalid move") {
        super(message);
        this.name = "InvalidMoveError";
    }
}

export class FieldAlreadyOwnedError extends InvalidMoveError {
    constructor(message = "This player already owns this field") {
        super(message);
        this.name = "FieldAlreadyOwnedError";
    }
}


export class FieldBlockedError extends InvalidMoveError {
    constructor(message = "This field is currently blocked") {
        super(message);
        this.name = "FieldBlockedError";
    }
}

export class InsufficientPointsError extends InvalidMoveError {
    constructor(message = "Not enough points to takeover this field") {
        super(message);
        this.name = "InsufficientPointsError";
    }
}

export class OutOfRangeError extends InvalidMoveError {
    constructor(message = "Field coordinates are out of range") {
        super(message);
        this.name = "OutOfRangeError";
    }
}
