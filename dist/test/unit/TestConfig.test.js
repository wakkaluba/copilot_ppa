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
suite('TestConfig Interface Tests', () => {
    test('validates basic configuration', () => {
        const config = {
            testType: 'unit',
            testDir: './tests/unit',
            configFile: 'jest.config.js',
            env: { NODE_ENV: 'test' },
            timeout: 5000
        };
        assert.strictEqual(config.testType, 'unit');
        assert.strictEqual(config.testDir, './tests/unit');
        assert.strictEqual(config.configFile, 'jest.config.js');
        assert.deepStrictEqual(config.env, { NODE_ENV: 'test' });
        assert.strictEqual(config.timeout, 5000);
    });
    test('validates framework configuration', () => {
        const config = {
            testType: 'unit',
            testDir: './tests',
            framework: 'jest',
            command: 'jest --runInBand'
        };
        assert.strictEqual(config.framework, 'jest');
        assert.strictEqual(config.command, 'jest --runInBand');
    });
    test('validates filter options', () => {
        const config = {
            testType: 'integration',
            testDir: './tests/integration',
            include: ['**/*.test.ts'],
            exclude: ['**/helpers/**', '**/fixtures/**']
        };
        assert.deepStrictEqual(config.include, ['**/*.test.ts']);
        assert.deepStrictEqual(config.exclude, ['**/helpers/**', '**/fixtures/**']);
    });
    test('validates E2E configuration', () => {
        const config = {
            testType: 'e2e',
            testDir: './tests/e2e',
            framework: 'playwright',
            browser: 'chromium',
            headless: true,
            baseUrl: 'http://localhost:3000'
        };
        assert.strictEqual(config.browser, 'chromium');
        assert.strictEqual(config.headless, true);
        assert.strictEqual(config.baseUrl, 'http://localhost:3000');
    });
    test('validates performance test configuration', () => {
        const config = {
            testType: 'performance',
            testDir: './tests/performance',
            performance: {
                iterations: 100,
                warmup: 10,
                duration: 60,
                targetUrl: 'http://localhost:3000',
                metrics: ['cpu', 'memory', 'network']
            }
        };
        assert.strictEqual(config.performance?.iterations, 100);
        assert.strictEqual(config.performance?.warmup, 10);
        assert.strictEqual(config.performance?.duration, 60);
        assert.strictEqual(config.performance?.targetUrl, 'http://localhost:3000');
        assert.deepStrictEqual(config.performance?.metrics, ['cpu', 'memory', 'network']);
    });
    test('validates coverage configuration', () => {
        const config = {
            testType: 'unit',
            testDir: './tests/unit',
            coverage: {
                enabled: true,
                threshold: 80,
                reportDir: './coverage',
                exclude: ['**/node_modules/**', '**/*.test.ts']
            }
        };
        assert.strictEqual(config.coverage?.enabled, true);
        assert.strictEqual(config.coverage?.threshold, 80);
        assert.strictEqual(config.coverage?.reportDir, './coverage');
        assert.deepStrictEqual(config.coverage?.exclude, ['**/node_modules/**', '**/*.test.ts']);
    });
    test('validates combined configuration', () => {
        const config = {
            testType: 'e2e',
            testDir: './tests/e2e',
            framework: 'cypress',
            command: 'cypress run',
            env: {
                NODE_ENV: 'test',
                CI: 'true'
            },
            timeout: 30000,
            browser: 'chrome',
            headless: true,
            baseUrl: 'http://localhost:3000',
            include: ['**/*.spec.ts'],
            exclude: ['**/fixtures/**'],
            coverage: {
                enabled: true,
                threshold: 70,
                reportDir: './coverage/e2e'
            }
        };
        // Test type and location
        assert.strictEqual(config.testType, 'e2e');
        assert.strictEqual(config.testDir, './tests/e2e');
        // Framework config
        assert.strictEqual(config.framework, 'cypress');
        assert.strictEqual(config.command, 'cypress run');
        // Environment and timing
        assert.deepStrictEqual(config.env, { NODE_ENV: 'test', CI: 'true' });
        assert.strictEqual(config.timeout, 30000);
        // E2E specific
        assert.strictEqual(config.browser, 'chrome');
        assert.strictEqual(config.headless, true);
        assert.strictEqual(config.baseUrl, 'http://localhost:3000');
        // Filters
        assert.deepStrictEqual(config.include, ['**/*.spec.ts']);
        assert.deepStrictEqual(config.exclude, ['**/fixtures/**']);
        // Coverage
        assert.strictEqual(config.coverage?.enabled, true);
        assert.strictEqual(config.coverage?.threshold, 70);
        assert.strictEqual(config.coverage?.reportDir, './coverage/e2e');
    });
});
//# sourceMappingURL=TestConfig.test.js.map