import { StaticAnalysisOptions, StaticAnalysisTool } from '../services/testRunner/staticAnalysisService';

describe('StaticAnalysisOptions Interface', () => {
  // Test for basic configurations
  describe('Basic Configuration', () => {
    it('should create a valid static analysis options with no fields', () => {
      const options: StaticAnalysisOptions = {};

      expect(options.path).toBeUndefined();
      expect(options.tool).toBeUndefined();
      expect(options.files).toBeUndefined();
      expect(options.fix).toBeUndefined();
      expect(options.ignorePatterns).toBeUndefined();
      expect(options.config).toBeUndefined();
      expect(options.configPath).toBeUndefined();
    });

    it('should create a config with all available properties', () => {
      const options: StaticAnalysisOptions = {
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
  describe('Static Analysis Tool Types', () => {
    it('should accept all supported static analysis tools', () => {
      // Define all supported static analysis tools
      const tools: StaticAnalysisTool[] = [
        'eslint',
        'tslint',
        'prettier',
        'stylelint',
        'sonarqube',
        'custom'
      ];
      
      // Test each tool
      tools.forEach(tool => {
        const options: StaticAnalysisOptions = {
          tool,
          config: { enabled: true }
        };
        
        expect(options.tool).toBe(tool);
      });
    });
  });

  // Test for file path configurations
  describe('File Path Configuration', () => {
    it('should handle various path configurations', () => {
      const options: StaticAnalysisOptions = {
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

    it('should work with Windows-style paths', () => {
      const options: StaticAnalysisOptions = {
        path: 'C:\\project\\src',
        configPath: 'C:\\project\\.eslintrc.js'
      };

      expect(options.path).toBe('C:\\project\\src');
      expect(options.configPath).toBe('C:\\project\\.eslintrc.js');
    });
  });

  // Test for tool-specific configurations
  describe('Tool-Specific Configurations', () => {
    it('should work with ESLint configuration', () => {
      const options: StaticAnalysisOptions = {
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

    it('should work with Prettier configuration', () => {
      const options: StaticAnalysisOptions = {
        tool: 'prettier',
        configPath: '.prettierrc',
        fix: true,
        files: ['**/*.{js,ts,css,md}']
      };
      
      expect(options.tool).toBe('prettier');
      expect(options.configPath).toBe('.prettierrc');
      expect(options.fix).toBe(true);
    });

    it('should work with Stylelint configuration', () => {
      const options: StaticAnalysisOptions = {
        tool: 'stylelint',
        configPath: '.stylelintrc.json',
        files: ['**/*.{css,scss}'],
        ignorePatterns: ['dist/**']
      };
      
      expect(options.tool).toBe('stylelint');
      expect(options.configPath).toBe('.stylelintrc.json');
      expect(options.files?.[0]).toBe('**/*.{css,scss}');
    });

    it('should work with custom tool configuration', () => {
      const options: StaticAnalysisOptions = {
        tool: 'custom',
        configPath: 'custom-analysis.config.json',
        files: ['src/**/*'],
        config: {
          command: './run-custom-analysis.sh'
        }
      };
      
      expect(options.tool).toBe('custom');
      expect(options.configPath).toBe('custom-analysis.config.json');
      expect(options.config?.command).toBe('./run-custom-analysis.sh');
    });
  });

  // Test for auto-fix configurations
  describe('Auto-Fix Configuration', () => {
    it('should handle auto-fix option with different tools', () => {
      const lintOptions: StaticAnalysisOptions = {
        tool: 'eslint',
        fix: true
      };
      expect(lintOptions.fix).toBe(true);

      const formatOptions: StaticAnalysisOptions = {
        tool: 'prettier',
        fix: true
      };
      expect(formatOptions.fix).toBe(true);

      const noFixOptions: StaticAnalysisOptions = {
        tool: 'sonarqube',
        fix: false
      };
      expect(noFixOptions.fix).toBe(false);
    });

    it('should work with auto-fix and specific paths', () => {
      const options: StaticAnalysisOptions = {
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