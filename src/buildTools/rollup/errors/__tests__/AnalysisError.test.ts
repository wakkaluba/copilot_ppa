import { AnalysisError } from '../AnalysisError';

describe('AnalysisError', () => {
    it('should create an error with message only', () => {
        const error = new AnalysisError('Test error');
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('AnalysisError');
        expect(error.code).toBeUndefined();
        expect(error.data).toBeUndefined();
    });

    it('should create an error with message and code', () => {
        const error = new AnalysisError('Test error', 'ERR_001');
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('ERR_001');
        expect(error.data).toBeUndefined();
    });

    it('should create an error with message, code and data', () => {
        const data = { file: 'test.js', line: 10 };
        const error = new AnalysisError('Test error', 'ERR_001', data);
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('ERR_001');
        expect(error.data).toEqual(data);
    });

    it('should maintain proper prototype chain', () => {
        const error = new AnalysisError('Test error');
        expect(error instanceof Error).toBe(true);
        expect(error instanceof AnalysisError).toBe(true);
    });

    it('should allow error to be caught as Error type', () => {
        try {
            throw new AnalysisError('Test error');
        } catch (e) {
            expect(e instanceof Error).toBe(true);
            expect(e instanceof AnalysisError).toBe(true);
        }
    });

    it('should store arbitrary data in data property', () => {
        const complexData = {
            file: 'test.js',
            position: { line: 10, column: 5 },
            context: {
                scope: 'module',
                dependencies: ['dep1', 'dep2']
            }
        };
        const error = new AnalysisError('Test error', 'ERR_001', complexData);
        expect(error.data).toEqual(complexData);
    });

    it('should preserve stack trace', () => {
        const error = new AnalysisError('Test error');
        expect(error.stack).toBeDefined();
        expect(typeof error.stack).toBe('string');
        expect(error.stack).toContain('AnalysisError: Test error');
    });

    it('should create an error with default message', () => {
        const error = new AnalysisError('Test error');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AnalysisError);
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('AnalysisError');
    });

    it('should create an error with custom message and cause', () => {
        const cause = new Error('Original error');
        const error = new AnalysisError('Test error with cause', { cause });

        expect(error.message).toBe('Test error with cause');
        expect(error.cause).toBe(cause);
    });

    it('should include file path in the error when provided', () => {
        const filePath = '/path/to/rollup.config.js';
        const error = new AnalysisError('Config analysis failed', { filePath });

        expect(error.message).toBe('Config analysis failed');
        expect(error.filePath).toBe(filePath);
    });

    it('should include specific error code when provided', () => {
        const code = 'INVALID_CONFIG_FORMAT';
        const error = new AnalysisError('Invalid format', { code });

        expect(error.code).toBe(code);
    });

    it('should combine multiple options in error object', () => {
        const cause = new Error('Original error');
        const filePath = '/path/to/rollup.config.js';
        const code = 'INVALID_PLUGIN';

        const error = new AnalysisError('Multiple options error', {
            cause,
            filePath,
            code
        });

        expect(error.message).toBe('Multiple options error');
        expect(error.cause).toBe(cause);
        expect(error.filePath).toBe(filePath);
        expect(error.code).toBe(code);
    });

    it('should generate a descriptive toString representation', () => {
        const error = new AnalysisError('Test toString', {
            code: 'TEST_CODE',
            filePath: '/path/to/file.js'
        });

        const stringRepresentation = error.toString();
        expect(stringRepresentation).toContain('AnalysisError');
        expect(stringRepresentation).toContain('Test toString');
        expect(stringRepresentation).toContain('TEST_CODE');
        expect(stringRepresentation).toContain('/path/to/file.js');
    });
});
