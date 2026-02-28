export class RateLimitError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RateLimitError';
        this.statusCode = 429;
    }
}
