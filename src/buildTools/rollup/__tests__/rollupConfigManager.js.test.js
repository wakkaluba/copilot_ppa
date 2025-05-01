// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\__tests__\rollupConfigManager.js.test.js

const { RollupConfigManager } = require('../rollupConfigManager');
const { RollupConfigDetector, RollupConfigAnalyzer, RollupOptimizationService } = require('../services');

// Mock the services
jest.mock('../services', () => ({
    RollupConfigDetector: jest.fn().mockImplementation(() => ({
        detectConfigs: jest.fn()
    })),
    RollupConfigAnalyzer: jest.fn().mockImplementation(() => ({
        analyze: jest.fn()
    })),
    RollupOptimizationService: jest.fn().mockImplementation(() => ({
        generateSuggestions: jest.fn()
    }))
}));

describe('RollupConfigManager JavaScript Implementation', () => {
    let mockLogger;
    let manager;
    let mockDetector;
    let mockAnalyzer;
    let mockOptimizationService;

    beforeEach(() => {
        // Create mock logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        // Reset mocks
        jest.clearAllMocks();

        // Create mocked services
        mockDetector = new RollupConfigDetector();
        mockAnalyzer = new RollupConfigAnalyzer();
        mockOptimizationService = new RollupOptimizationService();

        // Create the manager instance with mocked dependencies
        manager = new RollupConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
    });

    describe('Constructor', () => {
        test('should initialize with services when provided', () => {
            expect(manager.configDetector).toBe(mockDetector);
            expect(manager.configAnalyzer).toBe(mockAnalyzer);
            expect(manager.optimizationService).toBe(mockOptimizationService);
            expect(manager.logger).toBe(mockLogger);
        });

        test('should initialize with only logger parameter and create default services', () => {
            // Reset mocks
            jest.clearAllMocks();

            const loggerOnlyManager = new RollupConfigManager(mockLogger);

            expect(loggerOnlyManager.logger).toBe(mockLogger);
            expect(RollupConfigDetector).toHaveBeenCalled();
            expect(RollupConfigAnalyzer).toHaveBeenCalled();
            expect(RollupOptimizationService).toHaveBeenCalled();
        });
    });

    describe('detectConfigs', () => {
        test('should detect rollup configs successfully', async () => {
            const mockConfigs = [
                '/workspace/rollup.config.js',
                '/workspace/rollup.config.mjs',
                '/workspace/rollup.config.ts'
            ];

            mockDetector.detectConfigs.mockResolvedValue(mockConfigs);

            const configs = await manager.detectConfigs('/workspace');

            expect(mockDetector.detectConfigs).toHaveBeenCalledWith('/workspace');
            expect(configs).toEqual(mockConfigs);
            expect(mockLogger.debug).toHaveBeenCalledWith('Detecting rollup configs in /workspace');
        });

        test('should handle errors during config detection', async () => {
            const mockError = new Error('Detection failed');
            mockDetector.detectConfigs.mockRejectedValue(mockError);

            await expect(manager.detectConfigs('/workspace')).rejects.toThrow(
                'Failed to detect rollup configurations: Detection failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error detecting rollup configs:', mockError);
        });
    });

    describe('analyzeConfig', () => {
        test('should analyze rollup config and return combined results', async () => {
            const mockAnalysis = {
                content: '/* rollup config content */',
                input: ['./src/index.js'],
                output: [{ format: 'esm', file: 'dist/bundle.js' }],
                plugins: [{ name: 'terser', description: 'Minify generated bundle' }],
                external: ['lodash', 'react']
            };

            const mockSuggestions = [
                { title: 'Use code splitting', description: 'Enable code splitting for better chunking', code: 'output: { dir: "dist", format: "esm" }' }
            ];

            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);
            mockOptimizationService.generateSuggestions.mockResolvedValue(mockSuggestions);

            const result = await manager.analyzeConfig('/workspace/rollup.config.js');

            expect(mockAnalyzer.analyze).toHaveBeenCalledWith('/workspace/rollup.config.js');
            expect(mockOptimizationService.generateSuggestions).toHaveBeenCalledWith(
                mockAnalysis.content,
                mockAnalysis.input,
                mockAnalysis.output,
                mockAnalysis.plugins
            );

            expect(result).toEqual({
                ...mockAnalysis,
                optimizationSuggestions: mockSuggestions
            });
        });

        test('should handle errors during analysis', async () => {
            const mockError = new Error('Analysis failed');
            mockAnalyzer.analyze.mockRejectedValue(mockError);

            await expect(manager.analyzeConfig('/workspace/rollup.config.js')).rejects.toThrow(
                'Failed to analyze rollup configuration: Analysis failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error analyzing rollup config:', mockError);
        });
    });

    describe('validateConfig', () => {
        test('should validate config with both input and output defined', async () => {
            const mockAnalysis = {
                content: '/* rollup config content */',
                input: ['./src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'esm' }],
                plugins: [],
                external: []
            };

            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig('/workspace/rollup.config.js');

            expect(mockAnalyzer.analyze).toHaveBeenCalledWith('/workspace/rollup.config.js');
            expect(result).toBe(true);
        });

        test('should validate config with directory output defined', async () => {
            const mockAnalysis = {
                content: '/* rollup config content */',
                input: ['./src/index.js'],
                output: [{ dir: 'dist', format: 'esm' }],
                plugins: [],
                external: []
            };

            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig('/workspace/rollup.config.js');

            expect(result).toBe(true);
        });

        test('should invalidate config with missing input', async () => {
            const mockAnalysis = {
                content: '/* rollup config content */',
                input: [],
                output: [{ file: 'dist/bundle.js', format: 'esm' }],
                plugins: [],
                external: []
            };

            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig('/workspace/rollup.config.js');

            expect(result).toBe(false);
        });

        test('should invalidate config with missing output file or dir', async () => {
            const mockAnalysis = {
                content: '/* rollup config content */',
                input: ['./src/index.js'],
                output: [{ format: 'esm' }], // Missing file or dir property
                plugins: [],
                external: []
            };

            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig('/workspace/rollup.config.js');

            expect(result).toBe(false);
        });

        test('should handle errors during validation', async () => {
            const mockError = new Error('Validation failed');
            mockAnalyzer.analyze.mockRejectedValue(mockError);

            await expect(manager.validateConfig('/workspace/rollup.config.js')).rejects.toThrow(
                'Failed to validate rollup configuration: Validation failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error validating rollup config:', mockError);
        });
    });

    describe('generateOptimizations', () => {
        test('should generate optimization suggestions', async () => {
            const mockAnalysis = {
                content: '/* rollup config content */',
                input: ['./src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'esm' }],
                plugins: [{ name: 'node-resolve' }],
                external: ['lodash'],
                optimizationSuggestions: [
                    { title: 'Use Terser', description: 'Add Terser plugin for minification', code: 'plugins: [...plugins, terser()]' },
                    { title: 'Set external dependencies', description: 'Externalize dependencies', code: 'external: ["react", "react-dom"]' }
                ]
            };

            // Mock analyzeConfig directly to avoid duplicating test logic
            manager.analyzeConfig = jest.fn().mockResolvedValue(mockAnalysis);

            const result = await manager.generateOptimizations('/workspace/rollup.config.js');

            expect(manager.analyzeConfig).toHaveBeenCalledWith('/workspace/rollup.config.js');
            expect(result).toEqual(mockAnalysis.optimizationSuggestions);
        });

        test('should handle errors during optimization generation', async () => {
            const mockError = new Error('Optimization failed');
            manager.analyzeConfig = jest.fn().mockRejectedValue(mockError);

            await expect(manager.generateOptimizations('/workspace/rollup.config.js')).rejects.toThrow(
                'Failed to generate optimization suggestions: Optimization failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error generating optimizations:', mockError);
        });
    });

    describe('Integration between methods', () => {
        test('should detect configs and then analyze the first one', async () => {
            const mockConfigs = ['/workspace/rollup.config.js', '/workspace/rollup.prod.js'];
            const mockAnalysis = {
                content: '/* rollup config content */',
                input: ['./src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'esm' }],
                plugins: [],
                external: []
            };
            const mockSuggestions = [
                { title: 'Use code splitting', description: 'Enable code splitting for better chunking', code: 'output: { dir: "dist", format: "esm" }' }
            ];

            mockDetector.detectConfigs.mockResolvedValue(mockConfigs);
            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);
            mockOptimizationService.generateSuggestions.mockResolvedValue(mockSuggestions);

            // First detect configs
            const configs = await manager.detectConfigs('/workspace');
            expect(configs).toEqual(mockConfigs);

            // Then analyze the first one
            const result = await manager.analyzeConfig(configs[0]);

            expect(result).toEqual({
                ...mockAnalysis,
                optimizationSuggestions: mockSuggestions
            });
        });

        test('should validate after analyzing', async () => {
            const mockAnalysis = {
                content: '/* rollup config content */',
                input: ['./src/index.js'],
                output: [{ file: 'dist/bundle.js', format: 'esm' }],
                plugins: [],
                external: []
            };

            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);

            // First analyze
            const analysisResult = await manager.analyzeConfig('/workspace/rollup.config.js');
            expect(analysisResult.input).toEqual(mockAnalysis.input);

            // Reset mock to verify it's called again during validation
            mockAnalyzer.analyze.mockClear();
            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);

            // Then validate
            const isValid = await manager.validateConfig('/workspace/rollup.config.js');
            expect(isValid).toBe(true);
            expect(mockAnalyzer.analyze).toHaveBeenCalledWith('/workspace/rollup.config.js');
        });
    });
});
