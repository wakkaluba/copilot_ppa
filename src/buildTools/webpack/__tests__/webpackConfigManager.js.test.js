// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\webpack\__tests__\webpackConfigManager.js.test.js

const { WebpackConfigManager } = require('../webpackConfigManager');
const { WebpackConfigDetector, WebpackConfigAnalyzer, WebpackOptimizationService } = require('../services');

// Mock the services
jest.mock('../services', () => ({
    WebpackConfigDetector: jest.fn().mockImplementation(() => ({
        detectConfigs: jest.fn()
    })),
    WebpackConfigAnalyzer: jest.fn().mockImplementation(() => ({
        analyze: jest.fn()
    })),
    WebpackOptimizationService: jest.fn().mockImplementation(() => ({
        generateSuggestions: jest.fn()
    }))
}));

describe('WebpackConfigManager JavaScript Implementation', () => {
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
        mockDetector = new WebpackConfigDetector();
        mockAnalyzer = new WebpackConfigAnalyzer();
        mockOptimizationService = new WebpackOptimizationService();

        // Create the manager instance with mocked dependencies
        manager = new WebpackConfigManager(mockDetector, mockAnalyzer, mockOptimizationService, mockLogger);
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

            const loggerOnlyManager = new WebpackConfigManager(mockLogger);

            expect(loggerOnlyManager.logger).toBe(mockLogger);
            expect(WebpackConfigDetector).toHaveBeenCalled();
            expect(WebpackConfigAnalyzer).toHaveBeenCalled();
            expect(WebpackOptimizationService).toHaveBeenCalled();
        });
    });

    describe('detectConfigs', () => {
        test('should detect webpack configs successfully', async () => {
            const mockConfigs = [
                '/workspace/webpack.config.js',
                '/workspace/webpack.dev.js',
                '/workspace/webpack.prod.js'
            ];

            mockDetector.detectConfigs.mockResolvedValue(mockConfigs);

            const configs = await manager.detectConfigs('/workspace');

            expect(mockDetector.detectConfigs).toHaveBeenCalledWith('/workspace');
            expect(configs).toEqual(mockConfigs);
            expect(mockLogger.debug).toHaveBeenCalledWith('Searching for webpack configs in /workspace');
        });

        test('should handle errors during config detection', async () => {
            const mockError = new Error('Detection failed');
            mockDetector.detectConfigs.mockRejectedValue(mockError);

            await expect(manager.detectConfigs('/workspace')).rejects.toThrow(
                'Failed to detect webpack configurations: Detection failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error detecting webpack configs:', mockError);
        });
    });

    describe('analyzeConfig', () => {
        test('should analyze webpack config and return combined results', async () => {
            const mockAnalysis = {
                content: '/* webpack config content */',
                entryPoints: [{ name: 'main', path: './src/index.js' }],
                loaders: [{ name: 'babel-loader', test: /\.js$/ }],
                plugins: [{ name: 'HtmlWebpackPlugin' }],
                errors: [],
                warnings: []
            };

            const mockSuggestions = [
                { title: 'Add caching', description: 'Enable cache for faster rebuilds', code: 'cache: true' }
            ];

            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);
            mockOptimizationService.generateSuggestions.mockResolvedValue(mockSuggestions);

            const result = await manager.analyzeConfig('/workspace/webpack.config.js');

            expect(mockAnalyzer.analyze).toHaveBeenCalledWith('/workspace/webpack.config.js');
            expect(mockOptimizationService.generateSuggestions).toHaveBeenCalledWith(
                mockAnalysis.content,
                mockAnalysis.entryPoints,
                mockAnalysis.loaders,
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

            await expect(manager.analyzeConfig('/workspace/webpack.config.js')).rejects.toThrow(
                'Failed to analyze webpack configuration: Analysis failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error analyzing webpack config:', mockError);
        });
    });

    describe('validateConfig', () => {
        test('should validate webpack config and return validation results', async () => {
            const mockAnalysis = {
                content: '/* webpack config content */',
                entryPoints: [{ name: 'main', path: './src/index.js' }],
                loaders: [{ name: 'babel-loader', test: /\.js$/ }],
                plugins: [{ name: 'HtmlWebpackPlugin' }],
                errors: [],
                warnings: [{ message: 'Deprecated option', line: 10, column: 5 }],
                optimizationSuggestions: []
            };

            // Mock the analyzeConfig method itself since we're testing validateConfig
            manager.analyzeConfig = jest.fn().mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig('/workspace/webpack.config.js');

            expect(manager.analyzeConfig).toHaveBeenCalledWith('/workspace/webpack.config.js');
            expect(result).toEqual({
                isValid: true,
                errors: [],
                warnings: [
                    {
                        message: 'Deprecated option',
                        line: 10,
                        column: 5,
                        severity: 'warning'
                    }
                ]
            });
        });

        test('should report invalid config when errors exist', async () => {
            const mockAnalysis = {
                content: '/* webpack config content */',
                entryPoints: [],
                loaders: [],
                plugins: [],
                errors: [{ message: 'Invalid entry point', line: 5, column: 10 }],
                warnings: [],
                optimizationSuggestions: []
            };

            manager.analyzeConfig = jest.fn().mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig('/workspace/webpack.config.js');

            expect(result).toEqual({
                isValid: false,
                errors: [
                    {
                        message: 'Invalid entry point',
                        line: 5,
                        column: 10,
                        severity: 'error'
                    }
                ],
                warnings: []
            });
        });

        test('should handle errors during validation', async () => {
            const mockError = new Error('Validation failed');
            manager.analyzeConfig = jest.fn().mockRejectedValue(mockError);

            await expect(manager.validateConfig('/workspace/webpack.config.js')).rejects.toThrow(
                'Failed to validate webpack configuration: Validation failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error validating webpack config:', mockError);
        });
    });

    describe('generateOptimizations', () => {
        test('should generate optimization suggestions', async () => {
            const mockAnalysis = {
                content: '/* webpack config content */',
                entryPoints: [{ name: 'main', path: './src/index.js' }],
                loaders: [{ name: 'babel-loader', test: /\.js$/ }],
                plugins: [{ name: 'HtmlWebpackPlugin' }],
                errors: [],
                warnings: [],
                optimizationSuggestions: [
                    { title: 'Add caching', description: 'Enable cache for faster rebuilds', code: 'cache: true' },
                    { title: 'Use SplitChunks', description: 'Split vendor code', code: 'splitChunks: { chunks: "all" }' }
                ]
            };

            manager.analyzeConfig = jest.fn().mockResolvedValue(mockAnalysis);

            const result = await manager.generateOptimizations('/workspace/webpack.config.js');

            expect(manager.analyzeConfig).toHaveBeenCalledWith('/workspace/webpack.config.js');
            expect(result).toEqual(mockAnalysis.optimizationSuggestions);
        });

        test('should handle errors during optimization generation', async () => {
            const mockError = new Error('Optimization failed');
            manager.analyzeConfig = jest.fn().mockRejectedValue(mockError);

            await expect(manager.generateOptimizations('/workspace/webpack.config.js')).rejects.toThrow(
                'Failed to generate optimization suggestions: Optimization failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error generating optimizations:', mockError);
        });
    });

    describe('Integration between methods', () => {
        test('should detect configs and then analyze the first one', async () => {
            const mockConfigs = ['/workspace/webpack.config.js', '/workspace/webpack.prod.js'];
            const mockAnalysis = {
                content: '/* webpack config content */',
                entryPoints: [{ name: 'main', path: './src/index.js' }],
                loaders: [],
                plugins: [],
                errors: [],
                warnings: []
            };
            const mockSuggestions = [
                { title: 'Add caching', description: 'Enable cache for faster rebuilds', code: 'cache: true' }
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
    });
});
