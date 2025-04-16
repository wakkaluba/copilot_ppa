"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
suite('TestRunnerOptions Interface Tests', () => {
    test('validates basic options', () => {
        const options = {
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
        const options = {
            configureE2E: true,
            browser: 'chrome',
            headless: true
        };
        assert.strictEqual(options.configureE2E, true);
        assert.strictEqual(options.browser, 'chrome');
        assert.strictEqual(options.headless, true);
    });
    test('validates performance test options', () => {
        const options = {
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
        const minimalOptions = {};
        assert.strictEqual(Object.keys(minimalOptions).length, 0);
        const partialOptions = {
            path: '/test/path',
            timeout: 5000
        };
        assert.strictEqual(partialOptions.path, '/test/path');
        assert.strictEqual(partialOptions.timeout, 5000);
        assert.strictEqual(partialOptions.command, undefined);
        assert.strictEqual(partialOptions.configureE2E, undefined);
    });
    test('combines multiple option types', () => {
        const options = {
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
//# sourceMappingURL=TestRunnerOptions.test.js.map