import { ICodeCoverageOptions } from '../types';

describe('CodeCoverageOptionsInterface', () => {
    describe('BasicConfiguration', () => {
        test('shouldCreateEmptyOptionsWithNoFields', () => {
            const options: ICodeCoverageOptions = {};
            expect(options.path).toBeUndefined();
            expect(options.command).toBeUndefined();
            expect(options.tool).toBeUndefined();
            expect(options.reportPath).toBeUndefined();
            expect(options.reportFormat).toBeUndefined();
            expect(options.threshold).toBeUndefined();
        });

        test('shouldCreateConfigWithAllProperties', () => {
            const options: ICodeCoverageOptions = {
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

    describe('CoverageToolConfiguration', () => {
        test('shouldAcceptAllSupportedTools', () => {
            const tools = ['jest', 'nyc', 'istanbul', 'c8', 'custom'] as const;
            tools.forEach(tool => {
                const options: ICodeCoverageOptions = {
                    tool,
                    command: `run ${tool}`
                };
                expect(options.tool).toBe(tool);
            });
        });

        test('shouldConfigureJestCorrectly', () => {
            const options: ICodeCoverageOptions = {
                tool: 'jest',
                reportFormat: 'json',
                threshold: 90
            };
            expect(options.tool).toBe('jest');
            expect(options.reportFormat).toBe('json');
            expect(options.threshold).toBe(90);
        });

        test('shouldConfigureNycCorrectly', () => {
            const options: ICodeCoverageOptions = {
                tool: 'nyc',
                reportFormat: 'lcov',
                reportPath: '.nyc_output/coverage.lcov'
            };
            expect(options.tool).toBe('nyc');
            expect(options.reportFormat).toBe('lcov');
            expect(options.reportPath).toBe('.nyc_output/coverage.lcov');
        });

        test('shouldConfigureCustomToolCorrectly', () => {
            const options: ICodeCoverageOptions = {
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

    describe('ReportFormatConfiguration', () => {
        test('shouldAcceptAllSupportedFormats', () => {
            const formats = ['lcov', 'json', 'html', 'text'] as const;
            formats.forEach(format => {
                const options: ICodeCoverageOptions = {
                    reportFormat: format,
                    reportPath: `coverage/report.${format}`
                };
                expect(options.reportFormat).toBe(format);
            });
        });

        test('shouldHandleDifferentReportPaths', () => {
            const lcovOptions: ICodeCoverageOptions = {
                reportFormat: 'lcov',
                reportPath: 'coverage/lcov.info'
            };
            expect(lcovOptions.reportFormat).toBe('lcov');
            expect(lcovOptions.reportPath).toBe('coverage/lcov.info');

            const htmlOptions: ICodeCoverageOptions = {
                reportFormat: 'html',
                reportPath: 'coverage/html'
            };
            expect(htmlOptions.reportFormat).toBe('html');
            expect(htmlOptions.reportPath).toBe('coverage/html');

            const jsonOptions: ICodeCoverageOptions = {
                reportFormat: 'json',
                reportPath: 'coverage/coverage.json'
            };
            expect(jsonOptions.reportFormat).toBe('json');
            expect(jsonOptions.reportPath).toBe('coverage/coverage.json');
        });
    });

    describe('ThresholdConfiguration', () => {
        test('shouldHandleValidThresholdValues', () => {
            const thresholds = [0, 50, 80, 90, 100];
            thresholds.forEach(threshold => {
                const options: ICodeCoverageOptions = { threshold };
                expect(options.threshold).toBe(threshold);
            });
        });

        test('shouldConfigureToolSpecificThresholds', () => {
            const jestOptions: ICodeCoverageOptions = {
                tool: 'jest',
                threshold: 95
            };
            expect(jestOptions.tool).toBe('jest');
            expect(jestOptions.threshold).toBe(95);

            const nycOptions: ICodeCoverageOptions = {
                tool: 'nyc',
                threshold: 75
            };
            expect(nycOptions.tool).toBe('nyc');
            expect(nycOptions.threshold).toBe(75);
        });
    });

    describe('PathConfiguration', () => {
        test('shouldHandleMultiplePathFormats', () => {
            const unixOptions: ICodeCoverageOptions = {
                path: '/project/src',
                reportPath: '/project/coverage/lcov.info'
            };
            expect(unixOptions.path).toBe('/project/src');
            expect(unixOptions.reportPath).toBe('/project/coverage/lcov.info');

            const windowsOptions: ICodeCoverageOptions = {
                path: 'C:\\project\\src',
                reportPath: 'C:\\project\\coverage\\lcov.info'
            };
            expect(windowsOptions.path).toBe('C:\\project\\src');
            expect(windowsOptions.reportPath).toBe('C:\\project\\coverage\\lcov.info');

            const relativeOptions: ICodeCoverageOptions = {
                path: './src',
                reportPath: './coverage/lcov.info'
            };
            expect(relativeOptions.path).toBe('./src');
            expect(relativeOptions.reportPath).toBe('./coverage/lcov.info');
        });
    });
});
