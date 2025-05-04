import { ReviewChecklistError } from '../../errors/ReviewChecklistError';

describe('ReviewChecklistError', () => {
    it('should be an instance of Error', () => {
        const error = new ReviewChecklistError('Test error message');

        expect(error).toBeInstanceOf(Error);
    });

    it('should set the correct error name', () => {
        const error = new ReviewChecklistError('Test error message');

        expect(error.name).toBe('ReviewChecklistError');
    });

    it('should set the correct error message', () => {
        const errorMessage = 'Test error message';
        const error = new ReviewChecklistError(errorMessage);

        expect(error.message).toBe(errorMessage);
    });

    it('should maintain the prototype chain', () => {
        const error = new ReviewChecklistError('Test error message');

        expect(Object.getPrototypeOf(error)).toBe(ReviewChecklistError.prototype);
        expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(Error.prototype);
    });

    it('should have a stack trace', () => {
        const error = new ReviewChecklistError('Test error message');

        expect(error.stack).toBeDefined();
        expect(typeof error.stack).toBe('string');
    });

    it('should work with try/catch blocks', () => {
        let caughtError = null;

        try {
            throw new ReviewChecklistError('Test error in try/catch');
        } catch (error) {
            caughtError = error;
        }

        expect(caughtError).toBeInstanceOf(ReviewChecklistError);
        expect(caughtError.message).toBe('Test error in try/catch');
    });

    it('should be identifiable with instanceof', () => {
        const error = new ReviewChecklistError('Test error message');

        expect(error instanceof ReviewChecklistError).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});
