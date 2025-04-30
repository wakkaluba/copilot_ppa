"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
describe('TestRunnerOptions Interface Tests', function () {
    it('validates basic options', function () {
        var options = {
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
    it('validates E2E specific options', function () {
        var options = {
            configureE2E: true,
            browser: 'chrome',
            headless: true
        };
        assert.strictEqual(options.configureE2E, true);
        assert.strictEqual(options.browser, 'chrome');
        assert.strictEqual(options.headless, true);
    });
    it('validates performance test options', function () {
        var _a, _b, _c;
        var options = {
            performance: {
                iterations: 100,
                warmup: 10,
                duration: 30
            },
            askForCustomCommand: true
        };
        assert.strictEqual((_a = options.performance) === null || _a === void 0 ? void 0 : _a.iterations, 100);
        assert.strictEqual((_b = options.performance) === null || _b === void 0 ? void 0 : _b.warmup, 10);
        assert.strictEqual((_c = options.performance) === null || _c === void 0 ? void 0 : _c.duration, 30);
        assert.strictEqual(options.askForCustomCommand, true);
    });
    it('accepts partial options', function () {
        // Test that all properties are optional
        var minimalOptions = {};
        assert.strictEqual(Object.keys(minimalOptions).length, 0);
        var partialOptions = {
            path: '/test/path',
            timeout: 5000
        };
        assert.strictEqual(partialOptions.path, '/test/path');
        assert.strictEqual(partialOptions.timeout, 5000);
        assert.strictEqual(partialOptions.command, undefined);
        assert.strictEqual(partialOptions.configureE2E, undefined);
    });
    it('combines multiple option types', function () {
        var _a, _b;
        var options = {
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
        assert.strictEqual((_a = options.performance) === null || _a === void 0 ? void 0 : _a.iterations, 50);
        assert.strictEqual((_b = options.performance) === null || _b === void 0 ? void 0 : _b.duration, 60);
        // Verify environment variables
        assert.deepStrictEqual(options.env, {
            NODE_ENV: 'test',
            DEBUG: 'true'
        });
    });
});
//# sourceMappingURL=TestRunnerOptions.test.js.map