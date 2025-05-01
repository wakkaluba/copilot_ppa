// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\__tests__\rollupConfigManager.js.test.js

const { RollupConfigManager } = require('../rollupConfigManager');
const { ConfigDetectionError } = require('../errors/ConfigDetectionError');
const { AnalysisError } = require('../errors/AnalysisError');
const { OptimizationError } = require('../errors/OptimizationError');

// Create mocks
const createMockDetector = () => ({
    detectConfigs: jest.fn()
});

const createMockAnalyzer = () => ({
    analyzeConfig: jest.fn()
});

const createMockOptimizationService = () => ({
    generateOptimizations: jest.fn()
});

const createMockLogger = () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
});

describe('RollupConfigManager JavaScript Implementation', () => {
    let manager;
    let mockDetector;
    let mockAnalyzer;
    let mockOptimizationService;
    let mockLogger;

    beforeEach(() => {
        mockDetector = createMockDetector();
        mockAnalyzer = createMockAnalyzer();
        mockOptimizationService = createMockOptimizationService();
        mockLogger = createMockLogger();
        manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
    });

    describe('constructor', () => {
        it('should create an instance with all dependencies', () => {
            expect(manager).toBeInstanceOf(RollupConfigManager);
        });

        it('should create an instance with logger only', () => {
            const loggerOnlyManager = new RollupConfigManager(mockLogger);
            expect(loggerOnlyManager).toBeInstanceOf(RollupConfigManager);

            // Should still have all required methods
            expect(typeof loggerOnlyManager.detectConfigs).toBe('function');
            expect(typeof loggerOnlyManager.analyzeConfig).toBe('function');
            expect(typeof loggerOnlyManager.validateConfig).toBe('function');
            expect(typeof loggerOnlyManager.generateOptimizations).toBe('function');
        });
    });

    describe('detectConfigs', () => {
        it('should detect configs in workspace', async () => {
            const workspacePath = '/workspace';
            const configs = ['/workspace/rollup.config.js', '/workspace/rollup.config.mjs'];
            mockDetector.detectConfigs.mockResolvedValue(configs);

            const result = await manager.detectConfigs(workspacePath);

            expect(result).toEqual(configs);
            expect(mockDetector.detectConfigs).toHaveBeenCalledWith(workspacePath);
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('configurations found'));
        });

        it('should handle detection errors', async () => {
            const workspacePath = '/workspace';
            const error = new ConfigDetectionError('No configs found', 'CONFIG_NOT_FOUND');
            mockDetector.detectConfigs.mockRejectedValue(error);

            await expect(manager.detectConfigs(workspacePath)).rejects.toThrow(ConfigDetectionError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error detecting configurations'));
        });

        it('should log when no configs found', async () => {
            const workspacePath = '/workspace';
            mockDetector.detectConfigs.mockResolvedValue([]);

            const result = await manager.detectConfigs(workspacePath);

            expect(result).toEqual([]);
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('No Rollup configurations found'));
        });
    });

    describe('analyzeConfig', () => {
        it('should analyze config and return analysis results', async () => {
            const configPath = '/workspace/rollup.config.js';
            const analysisResult = {
                plugins: ['plugin1', 'plugin2'],
                input: 'src/index.js',
                output: { file: 'dist/bundle.js', format: 'esm' }
            };
            mockAnalyzer.analyzeConfig.mockResolvedValue(analysisResult);

            const result = await manager.analyzeConfig(configPath);

            expect(result).toEqual(analysisResult);
            expect(mockAnalyzer.analyzeConfig).toHaveBeenCalledWith(configPath);
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Analysis completed'));
        });

        it('should handle analysis errors', async () => {
            const configPath = '/workspace/rollup.config.js';
            const error = new AnalysisError('Failed to analyze config', 'ANALYSIS_ERROR', configPath);
            mockAnalyzer.analyzeConfig.mockRejectedValue(error);

            await expect(manager.analyzeConfig(configPath)).rejects.toThrow(AnalysisError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error analyzing configuration'));
        });
    });

    describe('validateConfig', () => {
        it('should validate config and return validation results', async () => {
            const configPath = '/workspace/rollup.config.js';

            mockAnalyzer.analyzeConfig.mockImplementation(async () => {
                return {
                    isValid: true,
                    warnings: [],
                    errors: []
                };
            });

            const result = await manager.validateConfig(configPath);

            expect(result.isValid).toBe(true);
            expect(mockAnalyzer.analyzeConfig).toHaveBeenCalledWith(configPath);
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Validation completed'));
        });

        it('should handle validation errors', async () => {
            const configPath = '/workspace/rollup.config.js';
            const error = new Error('Validation failed');
            mockAnalyzer.analyzeConfig.mockRejectedValue(error);

            await expect(manager.validateConfig(configPath)).rejects.toThrow(Error);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error validating configuration'));
        });
    });

    describe('generateOptimizations', () => {
        it('should generate optimization suggestions', async () => {
            const configPath = '/workspace/rollup.config.js';
            const optimizations = [
                { type: 'plugin', name: 'rollup-plugin-terser', reason: 'Improves minification' },
                { type: 'config', property: 'output.sourcemap', value: true, reason: 'Aids debugging' }
            ];
            mockOptimizationService.generateOptimizations.mockResolvedValue(optimizations);

            const result = await manager.generateOptimizations(configPath);

            expect(result).toEqual(optimizations);
            expect(mockOptimizationService.generateOptimizations).toHaveBeenCalledWith(configPath);
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Generated'));
        });

        it('should handle optimization generation errors', async () => {
            const configPath = '/workspace/rollup.config.js';
            const error = new OptimizationError('Failed to generate optimizations', 'OPTIMIZATION_ERROR', configPath);
            mockOptimizationService.generateOptimizations.mockRejectedValue(error);

            await expect(manager.generateOptimizations(configPath)).rejects.toThrow(OptimizationError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error generating optimizations'));
        });
    });
});
