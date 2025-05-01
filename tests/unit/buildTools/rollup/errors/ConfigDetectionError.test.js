import * as assert from 'assert';
import { ConfigDetectionError } from '../../../../../src/buildTools/rollup/errors/ConfigDetectionError';

suite('Rollup ConfigDetectionError Tests', () => {
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
});
