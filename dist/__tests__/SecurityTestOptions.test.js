"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('SecurityTestOptions Interface', function () {
    // Test for basic configurations
    describe('Basic Configuration', function () {
        it('should create a valid security test options with no fields', function () {
            var options = {};
            expect(options.path).toBeUndefined();
            expect(options.tool).toBeUndefined();
            expect(options.command).toBeUndefined();
            expect(options.severityThreshold).toBeUndefined();
            expect(options.failOnVulnerabilities).toBeUndefined();
            expect(options.threshold).toBeUndefined();
        });
        it('should create a config with all available properties', function () {
            var options = {
                path: '/project/src',
                tool: 'npm-audit',
                command: 'npm audit --json',
                severityThreshold: 'medium',
                failOnVulnerabilities: true,
                threshold: 5
            };
            expect(options.path).toBe('/project/src');
            expect(options.tool).toBe('npm-audit');
            expect(options.command).toBe('npm audit --json');
            expect(options.severityThreshold).toBe('medium');
            expect(options.failOnVulnerabilities).toBe(true);
            expect(options.threshold).toBe(5);
        });
    });
    // Test for supported security tools
    describe('Security Tool Types', function () {
        it('should accept all supported security tools', function () {
            // Define all supported security tools
            var tools = [
                'snyk',
                'npm-audit',
                'owasp-dependency-check',
                'sonarqube',
                'trivy',
                'custom'
            ];
            // Test each tool
            tools.forEach(function (tool) {
                var options = {
                    tool: tool,
                    command: "run ".concat(tool)
                };
                expect(options.tool).toBe(tool);
            });
        });
    });
    // Test for severity thresholds
    describe('Severity Threshold Configuration', function () {
        it('should accept valid severity threshold levels', function () {
            var severityLevels = ['info', 'low', 'medium', 'high', 'critical'];
            severityLevels.forEach(function (level) {
                var options = {
                    severityThreshold: level
                };
                expect(options.severityThreshold).toBe(level);
            });
        });
        it('should work with different combinations of thresholds and failure conditions', function () {
            // Test with threshold but no fail condition
            var optionsWithThreshold = {
                threshold: 10,
                failOnVulnerabilities: false
            };
            expect(optionsWithThreshold.threshold).toBe(10);
            expect(optionsWithThreshold.failOnVulnerabilities).toBe(false);
            // Test with fail condition but no threshold
            var optionsWithFailure = {
                failOnVulnerabilities: true
            };
            expect(optionsWithFailure.failOnVulnerabilities).toBe(true);
            expect(optionsWithFailure.threshold).toBeUndefined();
            // Test with severity threshold and threshold count
            var optionsWithBoth = {
                severityThreshold: 'high',
                threshold: 3
            };
            expect(optionsWithBoth.severityThreshold).toBe('high');
            expect(optionsWithBoth.threshold).toBe(3);
        });
    });
    // Test for tool-specific configurations
    describe('Tool-Specific Configurations', function () {
        it('should work with npm-audit configuration', function () {
            var options = {
                tool: 'npm-audit',
                command: 'npm audit --json',
                severityThreshold: 'medium', // NPM internally uses 'moderate', but our interface uses 'medium'
                failOnVulnerabilities: true
            };
            expect(options.tool).toBe('npm-audit');
            expect(options.command).toBe('npm audit --json');
            expect(options.severityThreshold).toBe('medium');
        });
        it('should work with snyk configuration', function () {
            var options = {
                tool: 'snyk',
                command: 'snyk test --json',
                severityThreshold: 'high',
                failOnVulnerabilities: true
            };
            expect(options.tool).toBe('snyk');
            expect(options.command).toBe('snyk test --json');
            expect(options.severityThreshold).toBe('high');
        });
        it('should work with OWASP dependency-check configuration', function () {
            var options = {
                tool: 'owasp-dependency-check',
                command: 'dependency-check --project "Test" --out . --scan .',
                failOnVulnerabilities: true,
                threshold: 0 // Zero tolerance for vulnerabilities
            };
            expect(options.tool).toBe('owasp-dependency-check');
            expect(options.command).toContain('dependency-check');
            expect(options.threshold).toBe(0);
        });
        it('should work with custom tool configuration', function () {
            var options = {
                tool: 'custom',
                command: './run-custom-security-scan.sh',
                severityThreshold: 'medium',
                failOnVulnerabilities: false,
                threshold: 15
            };
            expect(options.tool).toBe('custom');
            expect(options.command).toBe('./run-custom-security-scan.sh');
            expect(options.severityThreshold).toBe('medium');
            expect(options.failOnVulnerabilities).toBe(false);
            expect(options.threshold).toBe(15);
        });
    });
    // Test for path configurations
    describe('Path Configuration', function () {
        it('should handle different path formats', function () {
            // Absolute paths
            var absPathOptions = {
                path: '/home/user/project'
            };
            expect(absPathOptions.path).toBe('/home/user/project');
            // Relative paths
            var relPathOptions = {
                path: './src'
            };
            expect(relPathOptions.path).toBe('./src');
            // Windows-style paths
            var winPathOptions = {
                path: 'C:\\project\\src'
            };
            expect(winPathOptions.path).toBe('C:\\project\\src');
        });
    });
});
//# sourceMappingURL=SecurityTestOptions.test.js.map