import * as assert from 'assert';
import { AnalysisError } from '../../../../../src/buildTools/rollup/errors/AnalysisError';

suite('Rollup AnalysisError Tests', () => {
    test('should create error with default properties', () => {
        const error = new AnalysisError('Test error message');

        assert.strictEqual(error.message, 'Test error message');
        assert.strictEqual(error.name, 'AnalysisError');
        assert.ok(error instanceof Error);
    });

    test('should create error with custom code', () => {
        const error = new AnalysisError('Test error message', 'ERR_CONFIG');

        assert.strictEqual(error.message, 'Test error message');
        assert.strictEqual(error.code, 'ERR_CONFIG');
        assert.strictEqual(error.name, 'AnalysisError');
    });

    test('should include additional data', () => {
        const additionalData = { configPath: 'rollup.config.js', line: 10 };
        const error = new AnalysisError('Test error message', 'ERR_CONFIG', additionalData);

        assert.strictEqual(error.message, 'Test error message');
        assert.strictEqual(error.code, 'ERR_CONFIG');
        assert.deepStrictEqual(error.data, additionalData);
    });

    test('should preserve stack trace', () => {
        const error = new AnalysisError('Test error message');

        assert.ok(error.stack);
        assert.ok(error.stack.includes('AnalysisError: Test error message'));
    });

    test('should be throwable and catchable', () => {
        assert.throws(() => {
            throw new AnalysisError('Test throwable error');
        }, (err) => {
            return err instanceof AnalysisError &&
                  err.message === 'Test throwable error';
        });
    });
});
