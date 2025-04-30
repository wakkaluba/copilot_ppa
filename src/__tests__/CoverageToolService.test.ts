import * as fs from 'fs';
import { CoverageToolService } from '../services/testRunner/services/CoverageToolService';

describe('CoverageToolService', () => {
  let service: CoverageToolService;
  let mockWorkspacePath: string;

  beforeEach(() => {
    service = new CoverageToolService();
    mockWorkspacePath = '/test/workspace';
    jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('detectTool', () => {
    it('should detect Jest when package.json contains jest dependency', async () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
        devDependencies: {
          'jest': '^27.0.0'
        }
      }));

      const tool = await service.detectTool({}, mockWorkspacePath);
      expect(tool).toBe('jest');
    });

    it('should detect NYC when package.json contains nyc dependency', async () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
        devDependencies: {
          'nyc': '^15.0.0'
        }
      }));

      const tool = await service.detectTool({}, mockWorkspacePath);
      expect(tool).toBe('nyc');
    });

    it('should use explicitly specified tool over detected one', async () => {
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
        devDependencies: {
          'jest': '^27.0.0'
        }
      }));

      const tool = await service.detectTool({ tool: 'nyc' }, mockWorkspacePath);
      expect(tool).toBe('nyc');
    });
  });

  describe('buildCommand', () => {
    it('should build Jest command with default options', () => {
      const command = service.buildCommand('jest', {});
      expect(command).toBe('jest --coverage');
    });

    it('should build NYC command with default options', () => {
      const command = service.buildCommand('nyc', {});
      expect(command).toBe('nyc --reporter=lcov npm test');
    });

    it('should build command with custom report format', () => {
      const command = service.buildCommand('jest', { reportFormat: 'json' });
      expect(command).toBe('jest --coverage --coverageReporters=json');
    });

    it('should build command with custom path', () => {
      const command = service.buildCommand('jest', { path: 'src/components' });
      expect(command).toBe('jest --coverage src/components');
    });

    it('should use custom command if provided', () => {
      const customCommand = 'custom-coverage-tool run --with-args';
      const command = service.buildCommand('custom', { command: customCommand });
      expect(command).toBe(customCommand);
    });
  });

  describe('validateTool', () => {
    it('should return true for supported tools', () => {
      expect(service.validateTool('jest')).toBe(true);
      expect(service.validateTool('nyc')).toBe(true);
      expect(service.validateTool('istanbul')).toBe(true);
      expect(service.validateTool('c8')).toBe(true);
      expect(service.validateTool('custom')).toBe(true);
    });

    it('should return false for unsupported tools', () => {
      expect(service.validateTool('invalid')).toBe(false);
      expect(service.validateTool('')).toBe(false);
      expect(service.validateTool(undefined)).toBe(false);
    });
  });
});
