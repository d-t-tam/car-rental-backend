export class NotFoundError extends Error {
    constructor(entity: string, id?: number) {
        const message = id !== undefined 
            ? `${entity} with id ${id} not found`
            : `${entity} not found`;
        super(message);
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class DatabaseError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'DatabaseError';
        this.cause = cause;
    }
}

export class ConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConflictError';
    }
}
