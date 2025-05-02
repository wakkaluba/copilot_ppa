import { mock } from 'jest-mock-extended';
import { ILogger } from '../../../services/logging/ILogger';
import { WebpackConfigAnalyzer } from '../services/WebpackConfigAnalyzer';
import { WebpackConfigDetector } from '../services/WebpackConfigDetector';
import { WebpackOptimizationService } from '../services/WebpackOptimizationService';
import { WebpackConfigManager } from '../webpackConfigManager';

jest.mock('../services/WebpackConfigDetector');
jest.mock('../services/WebpackConfigAnalyzer');
jest.mock('../services/WebpackOptimizationService');

describe('WebpackConfigManager', () => {
  let manager: WebpackConfigManager;
  let mockDetector: jest.Mocked<WebpackConfigDetector>;
  let mockAnalyzer: jest.Mocked<WebpackConfigAnalyzer>;
  let mockOptimizationService: jest.Mocked<WebpackOptimizationService>;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockDetector = mock<WebpackConfigDetector>();
    mockAnalyzer = mock<WebpackConfigAnalyzer>();
    mockOptimizationService = mock<WebpackOptimizationService>();
    mockLogger = mock<ILogger>();

    mockDetector.findConfigs = jest.fn().mockResolvedValue(['webpack.config.js']);
    mockDetector.validateConfig = jest.fn().mockResolvedValue(true);

    mockAnalyzer.analyzeConfig = jest.fn().mockResolvedValue({
      entryPoints: [{ name: 'main', path: './src/index.js' }],
      output: { path: 'dist', filename: 'bundle.js' },
      loaders: [{ name: 'babel-loader', test: '/\\.js$/', options: {} }],
      plugins: [{ name: 'HtmlWebpackPlugin', description: 'Generates HTML files' }]
    });

    mockOptimizationService.generateSuggestions = jest.fn().mockReturnValue([
      { type: 'performance', description: 'Use code splitting', impact: 'high' }
    ]);

    manager = new WebpackConfigManager(
      mockDetector,
      mockAnalyzer,
      mockOptimizationService,
      mockLogger
    );
  });

  it('should be initialized with dependencies', () => {
    expect(manager).toBeDefined();
  });

  it('should initialize with logger only and create default dependencies', () => {
    const loggerOnlyManager = new WebpackConfigManager(mockLogger);
    expect(loggerOnlyManager).toBeDefined();
  });

  describe('detectConfigs', () => {
    it('should delegate to WebpackConfigDetector to find configurations', async () => {
      const workspacePath = '/test/workspace';
      await manager.detectConfigs(workspacePath);

      expect(mockDetector.findConfigs).toHaveBeenCalledWith(workspacePath);
    });

    it('should handle errors during config detection', async () => {
      const error = new Error('Detection error');
      mockDetector.findConfigs = jest.fn().mockRejectedValue(error);

      await expect(manager.detectConfigs('/test/workspace')).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('analyzeConfig', () => {
    it('should delegate to WebpackConfigAnalyzer to analyze configuration', async () => {
      const configPath = '/test/workspace/webpack.config.js';
      const result = await manager.analyzeConfig(configPath);

      expect(mockAnalyzer.analyzeConfig).toHaveBeenCalledWith(configPath);
      expect(result).toEqual({
        entryPoints: [{ name: 'main', path: './src/index.js' }],
        output: { path: 'dist', filename: 'bundle.js' },
        loaders: [{ name: 'babel-loader', test: '/\\.js$/', options: {} }],
        plugins: [{ name: 'HtmlWebpackPlugin', description: 'Generates HTML files' }]
      });
    });

    it('should handle errors during config analysis', async () => {
      const error = new Error('Analysis error');
      mockAnalyzer.analyzeConfig = jest.fn().mockRejectedValue(error);

      await expect(manager.analyzeConfig('/test/workspace/webpack.config.js')).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('validateConfig', () => {
    it('should delegate to WebpackConfigDetector to validate configuration', async () => {
      const configPath = '/test/workspace/webpack.config.js';
      const result = await manager.validateConfig(configPath);

      expect(mockDetector.validateConfig).toHaveBeenCalledWith(configPath);
      expect(result).toBe(true);
    });

    it('should handle errors during config validation', async () => {
      const error = new Error('Validation error');
      mockDetector.validateConfig = jest.fn().mockRejectedValue(error);

      await expect(manager.validateConfig('/test/workspace/webpack.config.js')).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('generateOptimizations', () => {
    it('should generate optimization suggestions for a config', async () => {
      const configPath = '/test/workspace/webpack.config.js';
      const configContent = 'module.exports = { mode: "development" }';
      jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(configContent);

      const result = await manager.generateOptimizations(configPath);

      expect(mockAnalyzer.analyzeConfig).toHaveBeenCalledWith(configPath);
      expect(mockOptimizationService.generateSuggestions).toHaveBeenCalled();
      expect(result).toEqual([
        { type: 'performance', description: 'Use code splitting', impact: 'high' }
      ]);
    });

    it('should handle errors during optimization generation', async () => {
      const error = new Error('Optimization error');
      mockAnalyzer.analyzeConfig = jest.fn().mockRejectedValue(error);

      await expect(manager.generateOptimizations('/test/workspace/webpack.config.js')).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
