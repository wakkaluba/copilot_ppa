// filepath: d:\___coding\tools\copilot_ppa\src\__tests__\SecurityTestOptions.test.ts
import { SecurityTestOptions, SecurityTool } from '../services/testRunner/securityTestingService';

describe('SecurityTestOptions Interface', () => {
  // Test for basic configurations
  describe('Basic Configuration', () => {
    it('should create a valid security test options with no fields', () => {
      const options: SecurityTestOptions = {};

      expect(options.path).toBeUndefined();
      expect(options.tool).toBeUndefined();
      expect(options.command).toBeUndefined();
      expect(options.severityThreshold).toBeUndefined();
      expect(options.failOnVulnerabilities).toBeUndefined();
      expect(options.threshold).toBeUndefined();
    });

    it('should create a config with all available properties', () => {
      const options: SecurityTestOptions = {
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
  describe('Security Tool Types', () => {
    it('should accept all supported security tools', () => {
      // Define all supported security tools
      const tools: SecurityTool[] = [
        'snyk', 
        'npm-audit', 
        'owasp-dependency-check', 
        'sonarqube', 
        'trivy', 
        'custom'
      ];
      
      // Test each tool
      tools.forEach(tool => {
        const options: SecurityTestOptions = {
          tool,
          command: `run ${tool}`
        };
        
        expect(options.tool).toBe(tool);
      });
    });
  });

  // Test for severity thresholds
  describe('Severity Threshold Configuration', () => {
    it('should accept valid severity threshold levels', () => {
      const severityLevels = ['info', 'low', 'medium', 'high', 'critical'] as const;
      
      severityLevels.forEach(level => {
        const options: SecurityTestOptions = {
          severityThreshold: level
        };
        
        expect(options.severityThreshold).toBe(level);
      });
    });

    it('should work with different combinations of thresholds and failure conditions', () => {
      // Test with threshold but no fail condition
      const optionsWithThreshold: SecurityTestOptions = {
        threshold: 10,
        failOnVulnerabilities: false
      };
      
      expect(optionsWithThreshold.threshold).toBe(10);
      expect(optionsWithThreshold.failOnVulnerabilities).toBe(false);
      
      // Test with fail condition but no threshold
      const optionsWithFailure: SecurityTestOptions = {
        failOnVulnerabilities: true
      };
      
      expect(optionsWithFailure.failOnVulnerabilities).toBe(true);
      expect(optionsWithFailure.threshold).toBeUndefined();
      
      // Test with severity threshold and threshold count
      const optionsWithBoth: SecurityTestOptions = {
        severityThreshold: 'high',
        threshold: 3
      };
      
      expect(optionsWithBoth.severityThreshold).toBe('high');
      expect(optionsWithBoth.threshold).toBe(3);
    });
  });

  // Test for tool-specific configurations
  describe('Tool-Specific Configurations', () => {
    it('should work with npm-audit configuration', () => {
      const options: SecurityTestOptions = {
        tool: 'npm-audit',
        command: 'npm audit --json',
        severityThreshold: 'medium', // NPM internally uses 'moderate', but our interface uses 'medium'
        failOnVulnerabilities: true
      };
      
      expect(options.tool).toBe('npm-audit');
      expect(options.command).toBe('npm audit --json');
      expect(options.severityThreshold).toBe('medium');
    });

    it('should work with snyk configuration', () => {
      const options: SecurityTestOptions = {
        tool: 'snyk',
        command: 'snyk test --json',
        severityThreshold: 'high',
        failOnVulnerabilities: true
      };
      
      expect(options.tool).toBe('snyk');
      expect(options.command).toBe('snyk test --json');
      expect(options.severityThreshold).toBe('high');
    });

    it('should work with OWASP dependency-check configuration', () => {
      const options: SecurityTestOptions = {
        tool: 'owasp-dependency-check',
        command: 'dependency-check --project "Test" --out . --scan .',
        failOnVulnerabilities: true,
        threshold: 0 // Zero tolerance for vulnerabilities
      };
      
      expect(options.tool).toBe('owasp-dependency-check');
      expect(options.command).toContain('dependency-check');
      expect(options.threshold).toBe(0);
    });

    it('should work with custom tool configuration', () => {
      const options: SecurityTestOptions = {
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
  describe('Path Configuration', () => {
    it('should handle different path formats', () => {
      // Absolute paths
      const absPathOptions: SecurityTestOptions = {
        path: '/home/user/project'
      };
      expect(absPathOptions.path).toBe('/home/user/project');
      
      // Relative paths
      const relPathOptions: SecurityTestOptions = {
        path: './src'
      };
      expect(relPathOptions.path).toBe('./src');
      
      // Windows-style paths
      const winPathOptions: SecurityTestOptions = {
        path: 'C:\\project\\src'
      };
      expect(winPathOptions.path).toBe('C:\\project\\src');
    });
  });
});