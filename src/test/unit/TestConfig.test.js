"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
describe('TestConfig Interface Tests', function () {
    it('validates basic configuration', function () {
        var config = {
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
    it('validates framework configuration', function () {
        var config = {
            testType: 'unit',
            testDir: './tests',
            framework: 'jest',
            command: 'jest --runInBand'
        };
        assert.strictEqual(config.framework, 'jest');
        assert.strictEqual(config.command, 'jest --runInBand');
    });
    it('validates filter options', function () {
        var config = {
            testType: 'integration',
            testDir: './tests/integration',
            include: ['**/*.test.ts'],
            exclude: ['**/helpers/**', '**/fixtures/**']
        };
        assert.deepStrictEqual(config.include, ['**/*.test.ts']);
        assert.deepStrictEqual(config.exclude, ['**/helpers/**', '**/fixtures/**']);
    });
    it('validates E2E configuration', function () {
        var config = {
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
    it('validates performance test configuration', function () {
        var _a, _b, _c, _d, _e;
        var config = {
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
        assert.strictEqual((_a = config.performance) === null || _a === void 0 ? void 0 : _a.iterations, 100);
        assert.strictEqual((_b = config.performance) === null || _b === void 0 ? void 0 : _b.warmup, 10);
        assert.strictEqual((_c = config.performance) === null || _c === void 0 ? void 0 : _c.duration, 60);
        assert.strictEqual((_d = config.performance) === null || _d === void 0 ? void 0 : _d.targetUrl, 'http://localhost:3000');
        assert.deepStrictEqual((_e = config.performance) === null || _e === void 0 ? void 0 : _e.metrics, ['cpu', 'memory', 'network']);
    });
    it('validates coverage configuration', function () {
        var _a, _b, _c, _d;
        var config = {
            testType: 'unit',
            testDir: './tests/unit',
            coverage: {
                enabled: true,
                threshold: 80,
                reportDir: './coverage',
                exclude: ['**/node_modules/**', '**/*.test.ts']
            }
        };
        assert.strictEqual((_a = config.coverage) === null || _a === void 0 ? void 0 : _a.enabled, true);
        assert.strictEqual((_b = config.coverage) === null || _b === void 0 ? void 0 : _b.threshold, 80);
        assert.strictEqual((_c = config.coverage) === null || _c === void 0 ? void 0 : _c.reportDir, './coverage');
        assert.deepStrictEqual((_d = config.coverage) === null || _d === void 0 ? void 0 : _d.exclude, ['**/node_modules/**', '**/*.test.ts']);
    });
    it('validates combined configuration', function () {
        var _a, _b, _c;
        var config = {
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
        assert.strictEqual((_a = config.coverage) === null || _a === void 0 ? void 0 : _a.enabled, true);
        assert.strictEqual((_b = config.coverage) === null || _b === void 0 ? void 0 : _b.threshold, 70);
        assert.strictEqual((_c = config.coverage) === null || _c === void 0 ? void 0 : _c.reportDir, './coverage/e2e');
    });
});
