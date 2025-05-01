import { ConfigDetectionError } from '../ConfigDetectionError';

describe('ConfigDetectionError', () => {
    it('should create an error with message only', () => {
        const error = new ConfigDetectionError('Test error');
        expect(error.message).toBe('Test error');
        expect(error.name).toBe('ConfigDetectionError');
        expect(error.code).toBeUndefined();
        expect(error.configPath).toBeUndefined();
    });

    it('should create an error with message and code', () => {
        const error = new ConfigDetectionError('Test error', 'CONFIG_NOT_FOUND');
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('CONFIG_NOT_FOUND');
        expect(error.configPath).toBeUndefined();
    });

    it('should create an error with message, code and configPath', () => {
        const configPath = '/path/to/rollup.config.js';
        const error = new ConfigDetectionError('Test error', 'CONFIG_NOT_FOUND', configPath);
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('CONFIG_NOT_FOUND');
        expect(error.configPath).toBe(configPath);
    });

    it('should maintain proper prototype chain', () => {
        const error = new ConfigDetectionError('Test error');
        expect(error instanceof Error).toBe(true);
        expect(error instanceof ConfigDetectionError).toBe(true);
    });

    it('should allow error to be caught as Error type', () => {
        try {
            throw new ConfigDetectionError('Test error');
        } catch (e) {
            expect(e instanceof Error).toBe(true);
            expect(e instanceof ConfigDetectionError).toBe(true);
        }
    });

    it('should include a default message if none provided', () => {
        const error = new ConfigDetectionError();
        expect(error.message).toBe('Configuration detection error');
        expect(error.name).toBe('ConfigDetectionError');
    });

    it('should include metadata in error details', () => {
        const metadata = {
            workspace: '/path/to/workspace',
            searchPatterns: ['rollup.config.js', 'rollup.config.ts'],
            attemptedPaths: ['/path/to/workspace/rollup.config.js']
        };
        const error = new ConfigDetectionError('Config file not found', 'CONFIG_NOT_FOUND', '/path/to/workspace/rollup.config.js', metadata);

        expect(error.message).toBe('Config file not found');
        expect(error.code).toBe('CONFIG_NOT_FOUND');
        expect(error.configPath).toBe('/path/to/workspace/rollup.config.js');
        expect(error.metadata).toEqual(metadata);
    });

    it('should preserve stack trace', () => {
        const error = new ConfigDetectionError('Test error');
        expect(error.stack).toBeDefined();
        expect(typeof error.stack).toBe('string');
        expect(error.stack).toContain('ConfigDetectionError: Test error');
    });

    it('should handle different error codes', () => {
        const invalidFormatError = new ConfigDetectionError('Invalid format', 'INVALID_CONFIG_FORMAT');
        expect(invalidFormatError.code).toBe('INVALID_CONFIG_FORMAT');

        const parseError = new ConfigDetectionError('Parse error', 'CONFIG_PARSE_ERROR');
        expect(parseError.code).toBe('CONFIG_PARSE_ERROR');
    });

    it('should generate a descriptive toString representation', () => {
        const error = new ConfigDetectionError('Test error', 'CONFIG_NOT_FOUND', '/path/to/config.js');
        const stringRepresentation = error.toString();

        expect(stringRepresentation).toContain('ConfigDetectionError');
        expect(stringRepresentation).toContain('Test error');
        expect(stringRepresentation).toContain('CONFIG_NOT_FOUND');
        expect(stringRepresentation).toContain('/path/to/config.js');
    });
});
