import * as assert from 'assert';
import { ConfigDetectionError } from '../../../../../src/buildTools/rollup/errors/ConfigDetectionError';

suite('Rollup ConfigDetectionError TypeScript Tests', () => {
    test('should create error with default properties', () => {
        const error = new ConfigDetectionError('Test error message');

        assert.strictEqual(error.message, 'Test error message');
        assert.strictEqual(error.name, 'ConfigDetectionError');
        assert.ok(error instanceof Error);
    });

    test('should create error with custom code', () => {
        const error = new ConfigDetectionError('Test error message', 'CONFIG_NOT_FOUND');

        assert.strictEqual(error.message, 'Test error message');
        assert.strictEqual(error.code, 'CONFIG_NOT_FOUND');
        assert.strictEqual(error.name, 'ConfigDetectionError');
    });

    test('should include file path information', () => {
        const error = new ConfigDetectionError('Config file not found', 'CONFIG_NOT_FOUND', '/path/to/rollup.config.js');

        assert.strictEqual(error.message, 'Config file not found');
        assert.strictEqual(error.code, 'CONFIG_NOT_FOUND');
        assert.strictEqual(error.filePath, '/path/to/rollup.config.js');
    });

    test('should preserve stack trace', () => {
        const error = new ConfigDetectionError('Test error message');

        assert.ok(error.stack);
        assert.ok(error.stack.includes('ConfigDetectionError: Test error message'));
    });

    test('should be throwable and catchable', () => {
        assert.throws(() => {
            throw new ConfigDetectionError('Test throwable error');
        }, (err) => {
            return err instanceof ConfigDetectionError &&
                  err.message === 'Test throwable error';
        });
    });

    test('should handle missing parameters gracefully', () => {
        const error = new ConfigDetectionError();

        assert.strictEqual(error.message, '');
        assert.strictEqual(error.name, 'ConfigDetectionError');
        assert.ok(error instanceof Error);
    });

    test('should include additional metadata', () => {
        const metadata = { searchedLocations: ['/path1', '/path2'] };
        const error = new ConfigDetectionError('Config file not found', 'CONFIG_NOT_FOUND', null, metadata);

        assert.strictEqual(error.message, 'Config file not found');
        assert.deepStrictEqual(error.metadata, metadata);
    });

    test('should be properly typed with TypeScript', () => {
        // Type checking for constructor parameters
        const error1: ConfigDetectionError = new ConfigDetectionError('Message');
        const error2: ConfigDetectionError = new ConfigDetectionError('Message', 'ERROR_CODE');
        const error3: ConfigDetectionError = new ConfigDetectionError('Message', 'ERROR_CODE', '/path/to/file');
        const error4: ConfigDetectionError = new ConfigDetectionError('Message', 'ERROR_CODE', '/path/to/file', { detail: 'info' });

        // Type checking for properties
        const message: string = error1.message;
        const name: string = error1.name;
        const code: string | undefined = error2.code;
        const filePath: string | undefined = error3.filePath;
        const metadata: Record<string, any> | undefined = error4.metadata;

        assert.ok(error1);
        assert.ok(error2);
        assert.ok(error3);
        assert.ok(error4);
    });
});
