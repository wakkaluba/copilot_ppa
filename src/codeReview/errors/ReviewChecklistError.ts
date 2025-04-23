export class ReviewChecklistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ReviewChecklistError';
    }
}
