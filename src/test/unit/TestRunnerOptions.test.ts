import * as assert from 'assert';
import { TestRunnerOptions } from '../../services/testRunner/testRunnerTypes';

suite('TestRunnerOptions Interface Tests', () => {
    test('validates basic options', () => {
        const options: TestRunnerOptions = {
            path: '/test/path',
            command: 'npm test',
            include: ['**/*.test.ts'],
            exclude: ['**/node_modules/**'],
            env: { NODE_ENV: 'test' },
            timeout: 5000
        };

        assert.strictEqual(options.path, '/test/path');
        assert.strictEqual(options.command, 'npm test');
        assert.deepStrictEqual(options.include, ['**/*.test.ts']);
        assert.deepStrictEqual(options.exclude, ['**/node_modules/**']);
        assert.deepStrictEqual(options.env, { NODE_ENV: 'test' });
        assert.strictEqual(options.timeout, 5000);
    });

    test('validates E2E specific options', () => {
        const options: TestRunnerOptions = {
            configureE2E: true,
            browser: 'chrome',
            headless: true
        };

        assert.strictEqual(options.configureE2E, true);
        assert.strictEqual(options.browser, 'chrome');
        assert.strictEqual(options.headless, true);
    });

    test('validates performance test options', () => {
        const options: TestRunnerOptions = {
            performance: {
                iterations: 100,
                warmup: 10,
                duration: 30
            },
            askForCustomCommand: true
        };

        assert.strictEqual(options.performance?.iterations, 100);
        assert.strictEqual(options.performance?.warmup, 10);
        assert.strictEqual(options.performance?.duration, 30);
        assert.strictEqual(options.askForCustomCommand, true);
    });

    test('accepts partial options', () => {
        // Test that all properties are optional
        const minimalOptions: TestRunnerOptions = {};
        assert.strictEqual(Object.keys(minimalOptions).length, 0);

        const partialOptions: TestRunnerOptions = {
            path: '/test/path',
            timeout: 5000
        };
        assert.strictEqual(partialOptions.path, '/test/path');
        assert.strictEqual(partialOptions.timeout, 5000);
        assert.strictEqual(partialOptions.command, undefined);
        assert.strictEqual(partialOptions.configureE2E, undefined);
    });

    test('combines multiple option types', () => {
        const options: TestRunnerOptions = {
            // Basic options
            path: '/test/path',
            command: 'npm run e2e',
            timeout: 10000,
            // E2E options
            configureE2E: true,
            browser: 'firefox',
            headless: true,
            // Performance options
            performance: {
                iterations: 50,
                duration: 60
            },
            // Environment variables
            env: {
                NODE_ENV: 'test',
                DEBUG: 'true'
            }
        };

        // Verify basic options
        assert.strictEqual(options.path, '/test/path');
        assert.strictEqual(options.command, 'npm run e2e');
        assert.strictEqual(options.timeout, 10000);

        // Verify E2E options
        assert.strictEqual(options.configureE2E, true);
        assert.strictEqual(options.browser, 'firefox');
        assert.strictEqual(options.headless, true);

        // Verify performance options
        assert.strictEqual(options.performance?.iterations, 50);
        assert.strictEqual(options.performance?.duration, 60);

        // Verify environment variables
        assert.deepStrictEqual(options.env, {
            NODE_ENV: 'test',
            DEBUG: 'true'
        });
    });
});