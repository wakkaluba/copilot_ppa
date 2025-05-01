import * as fs from 'fs';
import { ConfigValidationError } from '../../errors/ConfigValidationError';
import { RollupConfigValidationService } from '../RollupConfigValidationService';

// Mock file system
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
  },
  existsSync: jest.fn(),
}));

describe('RollupConfigValidationService', () => {
  let service: RollupConfigValidationService;
  let mockLogger: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    service = new RollupConfigValidationService(mockLogger);

    // Default mock behavior
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.promises.access as jest.Mock).mockResolvedValue(undefined);
  });

  describe('validateConfig', () => {
    it('should validate a valid config', () => {
      const analysis = {
        input: 'src/index.js',
        output: { file: 'dist/bundle.js', format: 'es' },
        plugins: [{ name: 'terser' }],
      };

      const result = service.validateConfig(analysis);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Config validation successful'));
    });

    it('should detect missing input in config', () => {
      const analysis = {
        // input is missing
        output: { file: 'dist/bundle.js', format: 'es' },
        plugins: [],
      };

      const result = service.validateConfig(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('input'));
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('missing input'));
    });

    it('should detect missing output in config', () => {
      const analysis = {
        input: 'src/index.js',
        // output is missing
        plugins: [],
      };

      const result = service.validateConfig(analysis);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('output'));
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('missing output'));
    });

    it('should validate config with array output', () => {
      const analysis = {
        input: 'src/index.js',
        output: [
          { file: 'dist/bundle.esm.js', format: 'es' },
          { file: 'dist/bundle.cjs.js', format: 'cjs' },
        ],
        plugins: [],
      };

      const result = service.validateConfig(analysis);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept undefined plugins', () => {
      const analysis = {
        input: 'src/index.js',
        output: { file: 'dist/bundle.js', format: 'es' },
        // plugins is missing
      };

      const result = service.validateConfig(analysis);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateWorkspacePath', () => {
    it('should validate existing workspace path', async () => {
      const workspacePath = '/valid/workspace/path';

      await expect(service.validateWorkspacePath(workspacePath)).resolves.not.toThrow();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('workspace path validation'));
    });

    it('should throw error for non-existent workspace path', async () => {
      const workspacePath = '/invalid/workspace/path';
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.validateWorkspacePath(workspacePath)).rejects.toThrow(ConfigValidationError);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid workspace path'));
    });

    it('should throw error for empty workspace path', async () => {
      const workspacePath = '';

      await expect(service.validateWorkspacePath(workspacePath)).rejects.toThrow(ConfigValidationError);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('empty workspace path'));
    });

    it('should throw error with specific message for filesystem access errors', async () => {
      const workspacePath = '/permission/denied/path';
      (fs.promises.access as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(service.validateWorkspacePath(workspacePath)).rejects.toThrow(ConfigValidationError);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error accessing workspace path'));
    });
  });

  describe('validateConfigPath', () => {
    it('should validate existing config path', async () => {
      const configPath = '/valid/rollup.config.js';

      await expect(service.validateConfigPath(configPath)).resolves.not.toThrow();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('config path validation'));
    });

    it('should throw error for non-existent config path', async () => {
      const configPath = '/invalid/rollup.config.js';
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.validateConfigPath(configPath)).rejects.toThrow(ConfigValidationError);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Config file does not exist'));
    });

    it('should throw error for empty config path', async () => {
      const configPath = '';

      await expect(service.validateConfigPath(configPath)).rejects.toThrow(ConfigValidationError);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('empty config path'));
    });

    it('should throw error with specific message for filesystem access errors', async () => {
      const configPath = '/permission/denied/rollup.config.js';
      (fs.promises.access as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(service.validateConfigPath(configPath)).rejects.toThrow(ConfigValidationError);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error accessing config file'));
    });
  });
});
