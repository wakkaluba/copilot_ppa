import { AnalysisError } from '../errors/AnalysisError';

describe('AnalysisError', () => {
    it('should create error with message only', () => {
        const error = new AnalysisError('test message');
        expect(error.message).toBe('test message');
        expect(error.name).toBe('AnalysisError');
        expect(error.code).toBeUndefined();
        expect(error.data).toBeUndefined();
    });

    it('should create error with message and code', () => {
        const error = new AnalysisError('test message', 'TEST_CODE');
        expect(error.message).toBe('test message');
        expect(error.code).toBe('TEST_CODE');
        expect(error.data).toBeUndefined();
    });

    it('should create error with message, code and data', () => {
        const data = { foo: 'bar' };
        const error = new AnalysisError('test message', 'TEST_CODE', data);
        expect(error.message).toBe('test message');
        expect(error.code).toBe('TEST_CODE');
        expect(error.data).toEqual(data);
    });

    it('should properly extend Error class', () => {
        const error = new AnalysisError('test message');
        expect(error instanceof Error).toBe(true);
        expect(error instanceof AnalysisError).toBe(true);
    });

    it('should preserve stack trace', () => {
        const error = new AnalysisError('test message');
        expect(error.stack).toBeDefined();
    });

    it('should work with instanceof checks after serialization', () => {
        const error = new AnalysisError('test message');
        const serialized = JSON.stringify(error);
        const deserialized = JSON.parse(serialized);
        const reconstructed = new AnalysisError(deserialized.message, deserialized.code, deserialized.data);
        expect(reconstructed instanceof AnalysisError).toBe(true);
    });

    it('should maintain data references', () => {
        const nestedData = { nested: { value: 42 } };
        const error = new AnalysisError('test message', 'TEST_CODE', nestedData);
        expect(error.data).toBe(nestedData); // Same reference
        expect(error.data?.nested.value).toBe(42);
    });
});
