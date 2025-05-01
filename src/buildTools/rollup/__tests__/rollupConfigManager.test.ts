import { ILogger } from '../../../logging/ILogger';
import { ConfigValidationError } from '../errors/ConfigValidationError';
import { RollupConfigManager } from '../rollupConfigManager';
import { RollupConfigAnalyzer } from '../services/RollupConfigAnalyzer';
import { RollupConfigDetector } from '../services/RollupConfigDetector';
import { RollupOptimizationService } from '../services/RollupOptimizationService';

jest.mock('../services/RollupConfigDetector');
jest.mock('../services/RollupConfigAnalyzer');
jest.mock('../services/RollupOptimizationService');

describe('RollupConfigManager', () => {
    let manager: RollupConfigManager;
    let mockLogger: jest.Mocked<ILogger>;
    let mockDetector: jest.Mocked<RollupConfigDetector>;
    let mockAnalyzer: jest.Mocked<RollupConfigAnalyzer>;
    let mockOptimizationService: jest.Mocked<RollupOptimizationService>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        mockDetector = new RollupConfigDetector() as jest.Mocked<RollupConfigDetector>;
        mockAnalyzer = new RollupConfigAnalyzer() as jest.Mocked<RollupConfigAnalyzer>;
        mockOptimizationService = new RollupOptimizationService() as jest.Mocked<RollupOptimizationService>;
    });

    describe('constructor', () => {
        it('should initialize with logger only', () => {
            manager = new RollupConfigManager(mockLogger);
            expect(manager).toBeDefined();
        });

        it('should initialize with all dependencies', () => {
            manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
            expect(manager).toBeDefined();
        });
    });

    describe('detectConfigs', () => {
        beforeEach(() => {
            manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
        });

        it('should detect rollup configs in workspace', async () => {
            const mockConfigs = ['/workspace/rollup.config.js'];
            mockDetector.detectConfigs.mockResolvedValue(mockConfigs);

            const result = await manager.detectConfigs('/workspace');

            expect(result).toEqual(mockConfigs);
            expect(mockDetector.detectConfigs).toHaveBeenCalledWith('/workspace');
            expect(mockLogger.debug).toHaveBeenCalled();
        });

        it('should handle detection errors', async () => {
            const error = new Error('Detection failed');
            mockDetector.detectConfigs.mockRejectedValue(error);

            await expect(manager.detectConfigs('/workspace')).rejects.toThrow(error);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should log when no configs found', async () => {
            const workspacePath = '/workspace';
            mockDetector.detectConfigs.mockResolvedValue([]);

            manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
            const result = await manager.detectConfigs(workspacePath);

            expect(result).toEqual([]);
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('No Rollup configurations found'));
        });
    });

    describe('analyzeConfig', () => {
        beforeEach(() => {
            manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
        });

        it('should analyze rollup config', async () => {
            const mockAnalysis = {
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'cjs' }],
                plugins: [],
                external: [],
                content: '',
                optimizationSuggestions: []
            };
            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);

            const result = await manager.analyzeConfig('/workspace/rollup.config.js');

            expect(result).toEqual(mockAnalysis);
            expect(mockAnalyzer.analyze).toHaveBeenCalledWith('/workspace/rollup.config.js');
            expect(mockLogger.debug).toHaveBeenCalled();
        });

        it('should handle analysis errors', async () => {
            const error = new ConfigValidationError('Analysis failed');
            mockAnalyzer.analyze.mockRejectedValue(error);

            await expect(manager.analyzeConfig('/workspace/rollup.config.js')).rejects.toThrow(error);
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('generateOptimizations', () => {
        beforeEach(() => {
            manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
        });

        it('should generate optimization suggestions', async () => {
            const mockAnalysis = {
                input: ['src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'cjs' }],
                plugins: [],
                external: [],
                content: '',
                optimizationSuggestions: []
            };
            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);

            const mockSuggestions = ['Add terser for minification'];
            mockOptimizationService.generateSuggestions.mockResolvedValue(mockSuggestions);

            const result = await manager.generateOptimizations('/workspace/rollup.config.js');

            expect(result).toEqual(mockSuggestions);
            expect(mockAnalyzer.analyze).toHaveBeenCalledWith('/workspace/rollup.config.js');
            expect(mockOptimizationService.generateSuggestions).toHaveBeenCalledWith(
                mockAnalysis.content,
                mockAnalysis.input,
                mockAnalysis.output,
                mockAnalysis.plugins
            );
        });

        it('should handle optimization errors', async () => {
            const error = new Error('Optimization failed');
            mockAnalyzer.analyze.mockRejectedValue(error);

            await expect(manager.generateOptimizations('/workspace/rollup.config.js')).rejects.toThrow(error);
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('validateConfig', () => {
        beforeEach(() => {
            manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
        });

        it('should validate rollup config', () => {
            mockDetector.validateConfig.mockReturnValue(true);

            const result = manager.validateConfig('/workspace/rollup.config.js');

            expect(result).toBe(true);
            expect(mockDetector.validateConfig).toHaveBeenCalledWith('/workspace/rollup.config.js');
            expect(mockLogger.debug).toHaveBeenCalled();
        });

        it('should return false for invalid config', () => {
            mockDetector.validateConfig.mockReturnValue(false);

            const result = manager.validateConfig('/workspace/rollup.config.js');

            expect(result).toBe(false);
            expect(mockLogger.debug).toHaveBeenCalled();
        });

        it('should validate config and return validation results', async () => {
            const configPath = '/workspace/rollup.config.js';
            const configContent = 'export default { /* ... */ }';

            // Mock implementation for validateConfig
            mockAnalyzer.analyzeConfig.mockImplementation(async () => {
                return {
                    isValid: true,
                    warnings: [],
                    errors: []
                };
            });

            manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
            const result = await manager.validateConfig(configPath);

            expect(result.isValid).toBe(true);
            expect(mockAnalyzer.analyzeConfig).toHaveBeenCalledWith(configPath);
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Validation completed'));
        });

        it('should handle validation errors', async () => {
            const configPath = '/workspace/rollup.config.js';
            const error = new Error('Validation failed');
            mockAnalyzer.analyzeConfig.mockRejectedValue(error);

            manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);

            await expect(manager.validateConfig(configPath)).rejects.toThrow(Error);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error validating configuration'));
        });
    });
});
