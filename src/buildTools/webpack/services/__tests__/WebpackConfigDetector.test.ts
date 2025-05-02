import * as glob from 'glob';
import { mock } from 'jest-mock-extended';
import * as path from 'path';
import { ILogger } from '../../../../services/logging/ILogger';
import { WebpackConfigDetector } from '../WebpackConfigDetector';

jest.mock('glob', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('WebpackConfigDetector', () => {
  let detector: WebpackConfigDetector;
  let mockLogger: ILogger;
  const workspacePath = '/test/workspace';
  const mockConfigFiles = [
    'webpack.config.js',
    'webpack.dev.config.js',
    'webpack.prod.config.js',
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = mock<ILogger>();
    detector = new WebpackConfigDetector(mockLogger);

    // Mock glob to return our mock config files
    (glob as any).mockImplementation((pattern: string, options: any, callback: Function) => {
      if (pattern.includes('webpack')) {
        callback(null, mockConfigFiles.filter(file =>
          new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')).test(file)
        ));
      } else {
        callback(null, []);
      }
    });
  });

  describe('detectConfigs', () => {
    it('should detect webpack config files in the workspace', async () => {
      const configs = await detector.detectConfigs(workspacePath);

      expect(configs.length).toBeGreaterThan(0);
      expect(configs).toContain(path.resolve(workspacePath, 'webpack.config.js'));
    });

    it('should handle glob errors', async () => {
      (glob as any).mockImplementation((pattern: string, options: any, callback: Function) => {
        callback(new Error('Mock glob error'), null);
      });

      await expect(detector.detectConfigs(workspacePath)).rejects.toThrow('Failed to detect webpack configurations');
    });

    it('should remove duplicate configs', async () => {
      // Setup glob to return the same file for different patterns
      (glob as any).mockImplementation((pattern: string, options: any, callback: Function) => {
        callback(null, ['webpack.config.js']);
      });

      const configs = await detector.detectConfigs(workspacePath);

      expect(configs.length).toBe(1);
      expect(configs[0]).toBe(path.resolve(workspacePath, 'webpack.config.js'));
    });
  });

  describe('findFiles', () => {
    it('should find files matching the pattern', async () => {
      // This is a private method, so we need to use any to access it
      const files = await (detector as any).findFiles('webpack.config.js', workspacePath);

      expect(files).toContain('webpack.config.js');
    });

    it('should reject when glob has an error', async () => {
      (glob as any).mockImplementation((pattern: string, options: any, callback: Function) => {
        callback(new Error('Mock glob error'), null);
      });

      await expect((detector as any).findFiles('webpack.config.js', workspacePath)).rejects.toThrow('Mock glob error');
    });
  });

  describe('validateConfigFile', () => {
    it('should validate a webpack config file', async () => {
      const isValid = await detector.validateConfigFile(path.join(workspacePath, 'webpack.config.js'));

      expect(isValid).toBe(true);
    });

    it('should reject files not matching webpack patterns', async () => {
      const isValid = await detector.validateConfigFile(path.join(workspacePath, 'not-webpack.js'));

      expect(isValid).toBe(false);
    });

    it('should handle errors during validation', async () => {
      // Mock path.basename to throw an error
      const originalBasename = path.basename;
      path.basename = jest.fn().mockImplementation(() => {
        throw new Error('Mock basename error');
      });

      await expect(detector.validateConfigFile(path.join(workspacePath, 'webpack.config.js')))
        .rejects.toThrow('Failed to validate webpack configuration file');

      // Restore original implementation
      path.basename = originalBasename;
    });
  });

  it('should use a default logger if none is provided', () => {
    const detectorWithoutLogger = new WebpackConfigDetector();
    expect(detectorWithoutLogger).toBeDefined();
  });
});
