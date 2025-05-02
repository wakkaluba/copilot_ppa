const { WebpackConfigDetector } = require('../WebpackConfigDetector');
const glob = require('glob');
const path = require('path');

jest.mock('glob');

describe('WebpackConfigDetector JavaScript Implementation', () => {
  let detector;
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  const workspacePath = '/test/workspace';
  const mockConfigFiles = [
    'webpack.config.js',
    'webpack.dev.config.js',
    'webpack.prod.config.js',
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    detector = new WebpackConfigDetector(mockLogger);

    // Mock glob to return our mock config files
    glob.mockImplementation((pattern, options, callback) => {
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
      glob.mockImplementation((pattern, options, callback) => {
        callback(new Error('Mock glob error'), null);
      });

      await expect(detector.detectConfigs(workspacePath)).rejects.toThrow('Failed to detect webpack configurations');
    });

    it('should remove duplicate configs', async () => {
      // Setup glob to return the same file for different patterns
      glob.mockImplementation((pattern, options, callback) => {
        callback(null, ['webpack.config.js']);
      });

      const configs = await detector.detectConfigs(workspacePath);

      expect(configs.length).toBe(1);
      expect(configs[0]).toBe(path.resolve(workspacePath, 'webpack.config.js'));
    });
  });

  describe('findFiles', () => {
    it('should find files matching the pattern', async () => {
      // This is a private method, but JS doesn't enforce privacy
      const files = await detector.findFiles('webpack.config.js', workspacePath);

      expect(files).toContain('webpack.config.js');
    });

    it('should reject when glob has an error', async () => {
      glob.mockImplementation((pattern, options, callback) => {
        callback(new Error('Mock glob error'), null);
      });

      await expect(detector.findFiles('webpack.config.js', workspacePath)).rejects.toThrow('Mock glob error');
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
