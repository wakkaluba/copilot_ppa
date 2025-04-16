import * as assert from 'assert';
import { TestType } from '../../services/testRunner/testRunnerTypes';

interface TestConfig {
    // Common configuration for all test types
    testType: TestType;
    testDir: string;
    configFile?: string;
    env?: Record<string, string>;
    timeout?: number;
    
    // Framework-specific configuration
    framework?: string;
    command?: string;
    
    // Filter options
    include?: string[];
    exclude?: string[];
    
    // E2E specific options
    browser?: string;
    headless?: boolean;
    baseUrl?: string;
    
    // Performance test options
    performance?: {
        iterations?: number;
        warmup?: number;
        duration?: number;
        targetUrl?: string;
        metrics?: string[];
    };
    
    // Coverage options
    coverage?: {
        enabled: boolean;
        threshold?: number;
        reportDir?: string;
        exclude?: string[];
    };
}

suite('TestConfig Interface Tests', () => {
    test('validates basic configuration', () => {
        const config: TestConfig = {
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
        const config: TestConfig = {
            testType: 'unit',
            testDir: './tests',
            framework: 'jest',
            command: 'jest --runInBand'
        };

        assert.strictEqual(config.framework, 'jest');
        assert.strictEqual(config.command, 'jest --runInBand');
    });

    test('validates filter options', () => {
        const config: TestConfig = {
            testType: 'integration',
            testDir: './tests/integration',
            include: ['**/*.test.ts'],
            exclude: ['**/helpers/**', '**/fixtures/**']
        };

        assert.deepStrictEqual(config.include, ['**/*.test.ts']);
        assert.deepStrictEqual(config.exclude, ['**/helpers/**', '**/fixtures/**']);
    });

    test('validates E2E configuration', () => {
        const config: TestConfig = {
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
        const config: TestConfig = {
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
        const config: TestConfig = {
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
        const config: TestConfig = {
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