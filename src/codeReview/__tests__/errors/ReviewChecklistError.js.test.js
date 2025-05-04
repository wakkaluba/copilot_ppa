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

    // Additional JS-specific tests
    it('should serialize to string properly', () => {
        const error = new ReviewChecklistError('Test error message');

        expect(String(error)).toBe('ReviewChecklistError: Test error message');
        expect(error.toString()).toBe('ReviewChecklistError: Test error message');
    });

    it('should be compatible with Error.captureStackTrace if available', () => {
        // This test is more relevant in Node.js environments
        if (typeof Error.captureStackTrace === 'function') {
            const error = new ReviewChecklistError('Test error message');
            expect(error.stack).toContain('ReviewChecklistError: Test error message');
        } else {
            // Skip this test in environments where captureStackTrace is not available
            expect(true).toBe(true);
        }
    });

    it('should work with JSON.stringify', () => {
        const error = new ReviewChecklistError('Test error message');
        const serialized = JSON.stringify(error);

        // The exact serialization may vary by environment, but should at least contain the message
        expect(serialized).toContain('Test error message');
    });
});
