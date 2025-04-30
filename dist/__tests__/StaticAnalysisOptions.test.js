"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('StaticAnalysisOptions Interface', function () {
    // Test for basic configurations
    describe('Basic Configuration', function () {
        it('should create a valid static analysis options with no fields', function () {
            var options = {};
            expect(options.path).toBeUndefined();
            expect(options.tool).toBeUndefined();
            expect(options.files).toBeUndefined();
            expect(options.fix).toBeUndefined();
            expect(options.ignorePatterns).toBeUndefined();
            expect(options.config).toBeUndefined();
            expect(options.configPath).toBeUndefined();
        });
        it('should create a config with all available properties', function () {
            var options = {
                path: '/project/src',
                tool: 'eslint',
                files: ['src/**/*.ts'],
                fix: true,
                ignorePatterns: ['node_modules/**', 'dist/**'],
                configPath: '.eslintrc.json',
                config: { rules: { 'no-console': 'error' } }
            };
            expect(options.path).toBe('/project/src');
            expect(options.tool).toBe('eslint');
            expect(options.files).toEqual(['src/**/*.ts']);
            expect(options.fix).toBe(true);
            expect(options.ignorePatterns).toEqual(['node_modules/**', 'dist/**']);
            expect(options.configPath).toBe('.eslintrc.json');
            expect(options.config).toEqual({ rules: { 'no-console': 'error' } });
        });
    });
    // Test for supported static analysis tools
    describe('Static Analysis Tool Types', function () {
        it('should accept all supported static analysis tools', function () {
            // Define all supported static analysis tools
            var tools = [
                'eslint',
                'tslint',
                'prettier',
                'stylelint',
                'sonarqube',
                'custom'
            ];
            // Test each tool
            tools.forEach(function (tool) {
                var options = {
                    tool: tool,
                    config: { enabled: true }
                };
                expect(options.tool).toBe(tool);
            });
        });
    });
    // Test for file path configurations
    describe('File Path Configuration', function () {
        it('should handle various path configurations', function () {
            var options = {
                path: '/project/src',
                files: ['src/**/*.ts', 'test/**/*.ts'],
                ignorePatterns: ['**/*.d.ts', '**/node_modules/**']
            };
            expect(options.path).toBe('/project/src');
            expect(options.files).toHaveLength(2);
            expect(options.files).toContain('src/**/*.ts');
            expect(options.ignorePatterns).toHaveLength(2);
            expect(options.ignorePatterns).toContain('**/*.d.ts');
        });
        it('should work with Windows-style paths', function () {
            var options = {
                path: 'C:\\project\\src',
                configPath: 'C:\\project\\.eslintrc.js'
            };
            expect(options.path).toBe('C:\\project\\src');
            expect(options.configPath).toBe('C:\\project\\.eslintrc.js');
        });
    });
    // Test for tool-specific configurations
    describe('Tool-Specific Configurations', function () {
        it('should work with ESLint configuration', function () {
            var options = {
                tool: 'eslint',
                configPath: '.eslintrc.json',
                fix: true,
                ignorePatterns: ['node_modules/**'],
                files: ['src/**/*.{js,ts}']
            };
            expect(options.tool).toBe('eslint');
            expect(options.configPath).toBe('.eslintrc.json');
            expect(options.fix).toBe(true);
        });
        it('should work with Prettier configuration', function () {
            var options = {
                tool: 'prettier',
                configPath: '.prettierrc',
                fix: true,
                files: ['**/*.{js,ts,css,md}']
            };
            expect(options.tool).toBe('prettier');
            expect(options.configPath).toBe('.prettierrc');
            expect(options.fix).toBe(true);
        });
        it('should work with Stylelint configuration', function () {
            var _a;
            var options = {
                tool: 'stylelint',
                configPath: '.stylelintrc.json',
                files: ['**/*.{css,scss}'],
                ignorePatterns: ['dist/**']
            };
            expect(options.tool).toBe('stylelint');
            expect(options.configPath).toBe('.stylelintrc.json');
            expect((_a = options.files) === null || _a === void 0 ? void 0 : _a[0]).toBe('**/*.{css,scss}');
        });
        it('should work with custom tool configuration', function () {
            var _a;
            var options = {
                tool: 'custom',
                configPath: 'custom-analysis.config.json',
                files: ['src/**/*'],
                config: {
                    command: './run-custom-analysis.sh'
                }
            };
            expect(options.tool).toBe('custom');
            expect(options.configPath).toBe('custom-analysis.config.json');
            expect((_a = options.config) === null || _a === void 0 ? void 0 : _a.command).toBe('./run-custom-analysis.sh');
        });
    });
    // Test for auto-fix configurations
    describe('Auto-Fix Configuration', function () {
        it('should handle auto-fix option with different tools', function () {
            var lintOptions = {
                tool: 'eslint',
                fix: true
            };
            expect(lintOptions.fix).toBe(true);
            var formatOptions = {
                tool: 'prettier',
                fix: true
            };
            expect(formatOptions.fix).toBe(true);
            var noFixOptions = {
                tool: 'sonarqube',
                fix: false
            };
            expect(noFixOptions.fix).toBe(false);
        });
        it('should work with auto-fix and specific paths', function () {
            var options = {
                tool: 'eslint',
                fix: true,
                files: ['src/**/*.ts'],
                ignorePatterns: ['**/*.spec.ts']
            };
            expect(options.fix).toBe(true);
            expect(options.files).toContain('src/**/*.ts');
            expect(options.ignorePatterns).toContain('**/*.spec.ts');
        });
    });
});
//# sourceMappingURL=StaticAnalysisOptions.test.js.map