// filepath: d:\___coding\tools\copilot_ppa\src\__tests__\StaticAnalysisOptions.test.ts
import { StaticAnalysisOptions, StaticAnalysisTool } from '../services/testRunner/staticAnalysisService';

describe('StaticAnalysisOptions Interface', () => {
  // Test for basic configurations
  describe('Basic Configuration', () => {
    it('should create a valid static analysis options with no fields', () => {
      const options: StaticAnalysisOptions = {};

      expect(options.path).toBeUndefined();
      expect(options.tool).toBeUndefined();
      expect(options.command).toBeUndefined();
      expect(options.autoFix).toBeUndefined();
      expect(options.exclude).toBeUndefined();
      expect(options.include).toBeUndefined();
      expect(options.configPath).toBeUndefined();
    });

    it('should create a config with all available properties', () => {
      const options: StaticAnalysisOptions = {
        path: '/project/src',
        tool: 'eslint',
        command: 'npx eslint --fix',
        autoFix: true,
        exclude: ['node_modules/**', 'dist/**'],
        include: ['src/**/*.ts'],
        configPath: '.eslintrc.json'
      };

      expect(options.path).toBe('/project/src');
      expect(options.tool).toBe('eslint');
      expect(options.command).toBe('npx eslint --fix');
      expect(options.autoFix).toBe(true);
      expect(options.exclude).toEqual(['node_modules/**', 'dist/**']);
      expect(options.include).toEqual(['src/**/*.ts']);
      expect(options.configPath).toBe('.eslintrc.json');
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
          command: `run ${tool}`
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
        include: ['src/**/*.ts', 'test/**/*.ts'],
        exclude: ['**/*.d.ts', '**/node_modules/**']
      };

      expect(options.path).toBe('/project/src');
      expect(options.include).toHaveLength(2);
      expect(options.include).toContain('src/**/*.ts');
      expect(options.exclude).toHaveLength(2);
      expect(options.exclude).toContain('**/*.d.ts');
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
        autoFix: true,
        exclude: ['node_modules/**'],
        include: ['src/**/*.{js,ts}']
      };
      
      expect(options.tool).toBe('eslint');
      expect(options.configPath).toBe('.eslintrc.json');
      expect(options.autoFix).toBe(true);
    });

    it('should work with Prettier configuration', () => {
      const options: StaticAnalysisOptions = {
        tool: 'prettier',
        configPath: '.prettierrc',
        autoFix: true,
        include: ['**/*.{js,ts,css,md}']
      };
      
      expect(options.tool).toBe('prettier');
      expect(options.configPath).toBe('.prettierrc');
      expect(options.autoFix).toBe(true);
    });

    it('should work with Stylelint configuration', () => {
      const options: StaticAnalysisOptions = {
        tool: 'stylelint',
        configPath: '.stylelintrc.json',
        include: ['**/*.{css,scss}'],
        exclude: ['dist/**']
      };
      
      expect(options.tool).toBe('stylelint');
      expect(options.configPath).toBe('.stylelintrc.json');
      expect(options.include?.[0]).toBe('**/*.{css,scss}');
    });

    it('should work with custom tool configuration', () => {
      const options: StaticAnalysisOptions = {
        tool: 'custom',
        command: './run-custom-analysis.sh',
        configPath: 'custom-analysis.config.json',
        include: ['src/**/*']
      };
      
      expect(options.tool).toBe('custom');
      expect(options.command).toBe('./run-custom-analysis.sh');
      expect(options.configPath).toBe('custom-analysis.config.json');
    });
  });

  // Test for auto-fix configurations
  describe('Auto-Fix Configuration', () => {
    it('should handle auto-fix option with different tools', () => {
      const lintOptions: StaticAnalysisOptions = {
        tool: 'eslint',
        autoFix: true
      };
      expect(lintOptions.autoFix).toBe(true);

      const formatOptions: StaticAnalysisOptions = {
        tool: 'prettier',
        autoFix: true
      };
      expect(formatOptions.autoFix).toBe(true);

      const noFixOptions: StaticAnalysisOptions = {
        tool: 'sonarqube',
        autoFix: false
      };
      expect(noFixOptions.autoFix).toBe(false);
    });

    it('should work with auto-fix and specific paths', () => {
      const options: StaticAnalysisOptions = {
        tool: 'eslint',
        autoFix: true,
        include: ['src/**/*.ts'],
        exclude: ['**/*.spec.ts']
      };

      expect(options.autoFix).toBe(true);
      expect(options.include).toContain('src/**/*.ts');
      expect(options.exclude).toContain('**/*.spec.ts');
    });
  });
});