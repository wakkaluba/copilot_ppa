"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('PerformanceTestConfig Interface', function () {
    // Test for basic configurations
    describe('Basic Configuration', function () {
        it('should create a valid performance test config with required fields', function () {
            var config = {
                framework: 'lighthouse',
                command: 'npx lighthouse --output json'
            };
            expect(config.framework).toBe('lighthouse');
            expect(config.command).toBe('npx lighthouse --output json');
            expect(config.iterations).toBeUndefined();
            expect(config.duration).toBeUndefined();
            expect(config.targetUrl).toBeUndefined();
            expect(config.customMetrics).toBeUndefined();
        });
        it('should create a config with all available properties', function () {
            var config = {
                framework: 'k6',
                command: 'k6 run --duration 30s performance/load-test.js',
                iterations: 100,
                duration: 30,
                targetUrl: 'http://localhost:3000',
                customMetrics: ['responseTime', 'throughput', 'errorRate']
            };
            expect(config.framework).toBe('k6');
            expect(config.command).toBe('k6 run --duration 30s performance/load-test.js');
            expect(config.iterations).toBe(100);
            expect(config.duration).toBe(30);
            expect(config.targetUrl).toBe('http://localhost:3000');
            expect(config.customMetrics).toEqual(['responseTime', 'throughput', 'errorRate']);
        });
    });
    // Test for supported frameworks
    describe('Performance Framework Types', function () {
        it('should accept all supported performance frameworks', function () {
            // Define all supported frameworks
            var frameworks = [
                'lighthouse',
                'k6',
                'autocannon',
                'benchmark.js',
                'jmeter',
                'custom'
            ];
            // Test each framework
            frameworks.forEach(function (framework) {
                var config = {
                    framework: framework,
                    command: "run ".concat(framework)
                };
                expect(config.framework).toBe(framework);
            });
        });
    });
    // Test for duration and iterations configurations
    describe('Duration and Iterations', function () {
        it('should support iterations configuration', function () {
            var config = {
                framework: 'autocannon',
                command: 'npx autocannon -c 10 -p 10 -n 500 http://localhost:3000',
                iterations: 500
            };
            expect(config.iterations).toBe(500);
            expect(config.duration).toBeUndefined();
        });
        it('should support duration configuration', function () {
            var config = {
                framework: 'k6',
                command: 'k6 run --duration 45s performance/load-test.js',
                duration: 45
            };
            expect(config.duration).toBe(45);
            expect(config.iterations).toBeUndefined();
        });
        it('should support both iterations and duration if needed', function () {
            var config = {
                framework: 'jmeter',
                command: 'jmeter -n -t performance/test-plan.jmx -l results.jtl',
                iterations: 1000,
                duration: 60
            };
            expect(config.iterations).toBe(1000);
            expect(config.duration).toBe(60);
        });
    });
    // Test for framework-specific configurations
    describe('Framework-Specific Configurations', function () {
        it('should work with Lighthouse configuration', function () {
            var config = {
                framework: 'lighthouse',
                command: 'npx lighthouse https://example.com --output json',
                targetUrl: 'https://example.com'
            };
            expect(config.framework).toBe('lighthouse');
            expect(config.command).toContain('lighthouse');
            expect(config.command).toContain('https://example.com');
            expect(config.targetUrl).toBe('https://example.com');
        });
        it('should work with k6 configuration', function () {
            var config = {
                framework: 'k6',
                command: 'k6 run --duration 30s performance/load-test.js',
                duration: 30,
                customMetrics: ['http_req_duration', 'http_reqs']
            };
            expect(config.framework).toBe('k6');
            expect(config.command).toContain('k6 run');
            expect(config.command).toContain('--duration 30s');
            expect(config.duration).toBe(30);
            expect(config.customMetrics).toContain('http_req_duration');
            expect(config.customMetrics).toContain('http_reqs');
        });
        it('should work with autocannon configuration', function () {
            var config = {
                framework: 'autocannon',
                command: 'npx autocannon -c 10 -p 10 -d 20 http://localhost:3000',
                duration: 20,
                targetUrl: 'http://localhost:3000'
            };
            expect(config.framework).toBe('autocannon');
            expect(config.command).toContain('autocannon');
            expect(config.command).toContain('-d 20');
            expect(config.targetUrl).toBe('http://localhost:3000');
            expect(config.duration).toBe(20);
        });
        it('should work with benchmark.js configuration', function () {
            var config = {
                framework: 'benchmark.js',
                command: 'node performance/benchmark.js',
                customMetrics: ['ops/sec', 'margin']
            };
            expect(config.framework).toBe('benchmark.js');
            expect(config.command).toBe('node performance/benchmark.js');
            expect(config.customMetrics).toContain('ops/sec');
        });
        it('should work with custom configuration', function () {
            var config = {
                framework: 'custom',
                command: 'npm run test:performance',
                customMetrics: ['customMetric1', 'customMetric2']
            };
            expect(config.framework).toBe('custom');
            expect(config.command).toBe('npm run test:performance');
            expect(config.customMetrics).toHaveLength(2);
        });
    });
});
