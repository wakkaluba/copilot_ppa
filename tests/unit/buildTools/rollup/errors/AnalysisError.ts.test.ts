import * as assert from 'assert';
import { AnalysisError } from '../../../../../src/buildTools/rollup/errors/AnalysisError';

suite('Rollup AnalysisError TypeScript Tests', () => {
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

    test('should have correct TypeScript type interfaces', () => {
        // Testing TypeScript interfaces through type checking
        const error: AnalysisError = new AnalysisError('Type checking');
        assert.strictEqual(typeof error.message, 'string');

        const errorWithCode: AnalysisError = new AnalysisError('Type checking', 'ERROR_CODE');
        assert.strictEqual(typeof errorWithCode.code, 'string');

        // Data property should be correctly typed
        const errorWithData: AnalysisError = new AnalysisError(
            'Type checking',
            'ERROR_CODE',
            { someData: 'value' }
        );
        assert.strictEqual(typeof errorWithData.data.someData, 'string');
    });
});
