"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('CodeCoverageOptions Interface', function () {
    // Test for basic configurations
    describe('Basic Configuration', function () {
        it('should create valid coverage options with no fields', function () {
            var options = {};
            expect(options.path).toBeUndefined();
            expect(options.command).toBeUndefined();
            expect(options.tool).toBeUndefined();
            expect(options.reportPath).toBeUndefined();
            expect(options.reportFormat).toBeUndefined();
            expect(options.threshold).toBeUndefined();
        });
        it('should create a config with all available properties', function () {
            var options = {
                path: '/project/src',
                command: 'npm run coverage',
                tool: 'jest',
                reportPath: 'coverage/lcov.info',
                reportFormat: 'lcov',
                threshold: 80
            };
            expect(options.path).toBe('/project/src');
            expect(options.command).toBe('npm run coverage');
            expect(options.tool).toBe('jest');
            expect(options.reportPath).toBe('coverage/lcov.info');
            expect(options.reportFormat).toBe('lcov');
            expect(options.threshold).toBe(80);
        });
    });
    // Test for coverage tools
    describe('Coverage Tool Configuration', function () {
        it('should accept all supported coverage tools', function () {
            var tools = ['jest', 'nyc', 'istanbul', 'c8', 'custom'];
            tools.forEach(function (tool) {
                var options = {
                    tool: tool,
                    command: "run ".concat(tool)
                };
                expect(options.tool).toBe(tool);
            });
        });
        it('should work with Jest configuration', function () {
            var options = {
                tool: 'jest',
                reportFormat: 'json',
                threshold: 90
            };
            expect(options.tool).toBe('jest');
            expect(options.reportFormat).toBe('json');
            expect(options.threshold).toBe(90);
        });
        it('should work with NYC configuration', function () {
            var options = {
                tool: 'nyc',
                reportFormat: 'lcov',
                reportPath: '.nyc_output/coverage.lcov'
            };
            expect(options.tool).toBe('nyc');
            expect(options.reportFormat).toBe('lcov');
            expect(options.reportPath).toBe('.nyc_output/coverage.lcov');
        });
        it('should work with custom tool configuration', function () {
            var options = {
                tool: 'custom',
                command: './run-custom-coverage.sh',
                reportPath: 'custom-coverage/report.json',
                reportFormat: 'json'
            };
            expect(options.tool).toBe('custom');
            expect(options.command).toBe('./run-custom-coverage.sh');
            expect(options.reportPath).toBe('custom-coverage/report.json');
            expect(options.reportFormat).toBe('json');
        });
    });
    // Test for report formats
    describe('Report Format Configuration', function () {
        it('should accept all supported report formats', function () {
            var formats = ['lcov', 'json', 'html', 'text'];
            formats.forEach(function (format) {
                var options = {
                    reportFormat: format,
                    reportPath: "coverage/report.".concat(format)
                };
                expect(options.reportFormat).toBe(format);
            });
        });
        it('should work with different report paths based on format', function () {
            // LCOV format
            var lcovOptions = {
                reportFormat: 'lcov',
                reportPath: 'coverage/lcov.info'
            };
            expect(lcovOptions.reportFormat).toBe('lcov');
            expect(lcovOptions.reportPath).toBe('coverage/lcov.info');
            // HTML format
            var htmlOptions = {
                reportFormat: 'html',
                reportPath: 'coverage/html'
            };
            expect(htmlOptions.reportFormat).toBe('html');
            expect(htmlOptions.reportPath).toBe('coverage/html');
            // JSON format
            var jsonOptions = {
                reportFormat: 'json',
                reportPath: 'coverage/coverage.json'
            };
            expect(jsonOptions.reportFormat).toBe('json');
            expect(jsonOptions.reportPath).toBe('coverage/coverage.json');
        });
    });
    // Test for threshold configurations
    describe('Coverage Threshold Configuration', function () {
        it('should handle different threshold values', function () {
            var thresholds = [0, 50, 80, 90, 100];
            thresholds.forEach(function (threshold) {
                var options = {
                    threshold: threshold
                };
                expect(options.threshold).toBe(threshold);
            });
        });
        it('should work with tool-specific thresholds', function () {
            // Jest with high threshold
            var jestOptions = {
                tool: 'jest',
                threshold: 95
            };
            expect(jestOptions.tool).toBe('jest');
            expect(jestOptions.threshold).toBe(95);
            // NYC with medium threshold
            var nycOptions = {
                tool: 'nyc',
                threshold: 75
            };
            expect(nycOptions.tool).toBe('nyc');
            expect(nycOptions.threshold).toBe(75);
        });
    });
    // Test for path configurations
    describe('Path Configuration', function () {
        it('should handle different path formats', function () {
            // Unix-style paths
            var unixOptions = {
                path: '/project/src',
                reportPath: '/project/coverage/lcov.info'
            };
            expect(unixOptions.path).toBe('/project/src');
            expect(unixOptions.reportPath).toBe('/project/coverage/lcov.info');
            // Windows-style paths
            var windowsOptions = {
                path: 'C:\\project\\src',
                reportPath: 'C:\\project\\coverage\\lcov.info'
            };
            expect(windowsOptions.path).toBe('C:\\project\\src');
            expect(windowsOptions.reportPath).toBe('C:\\project\\coverage\\lcov.info');
            // Relative paths
            var relativeOptions = {
                path: './src',
                reportPath: './coverage/lcov.info'
            };
            expect(relativeOptions.path).toBe('./src');
            expect(relativeOptions.reportPath).toBe('./coverage/lcov.info');
        });
    });
});
