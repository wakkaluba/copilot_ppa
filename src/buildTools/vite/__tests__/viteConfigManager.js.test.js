// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\vite\__tests__\viteConfigManager.js.test.js

const fs = require('fs');
const { ViteConfigManager } = require('../viteConfigManager');
const { ViteConfigDetector, ViteConfigAnalyzer, ViteOptimizationService } = require('../services');

// Mock the services
jest.mock('../services', () => ({
    ViteConfigDetector: jest.fn().mockImplementation(() => ({
        detect: jest.fn()
    })),
    ViteConfigAnalyzer: jest.fn().mockImplementation(() => ({
        analyze: jest.fn()
    })),
    ViteOptimizationService: jest.fn().mockImplementation(() => ({
        generateSuggestions: jest.fn()
    }))
}));

// Mock fs module
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn()
    }
}));

describe('ViteConfigManager JavaScript Implementation', () => {
    let mockLogger;
    let manager;

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

        // Create manager with mock logger
        manager = new ViteConfigManager(mockLogger);
    });

    describe('Constructor', () => {
        test('should initialize with logger when provided', () => {
            expect(manager.logger).toBe(mockLogger);
            expect(ViteConfigDetector).toHaveBeenCalledWith(mockLogger);
            expect(ViteConfigAnalyzer).toHaveBeenCalledWith(mockLogger);
            expect(ViteOptimizationService).toHaveBeenCalledWith(mockLogger);
        });

        test('should initialize with NoOpLogger when no logger provided', () => {
            const noLoggerManager = new ViteConfigManager();

            // NoOpLogger methods don't throw errors when called
            expect(() => noLoggerManager.logger.debug()).not.toThrow();
            expect(() => noLoggerManager.logger.info()).not.toThrow();
            expect(() => noLoggerManager.logger.warn()).not.toThrow();
            expect(() => noLoggerManager.logger.error()).not.toThrow();

            expect(ViteConfigDetector).toHaveBeenCalled();
            expect(ViteConfigAnalyzer).toHaveBeenCalled();
            expect(ViteOptimizationService).toHaveBeenCalled();
        });
    });

    describe('detectConfigs', () => {
        test('should detect Vite configs successfully', async () => {
            const mockConfigs = [
                '/workspace/vite.config.js',
                '/workspace/vite.config.ts'
            ];

            manager.configDetector.detect.mockResolvedValue(mockConfigs);

            const configs = await manager.detectConfigs('/workspace');

            expect(manager.configDetector.detect).toHaveBeenCalledWith('/workspace');
            expect(configs).toEqual(mockConfigs);
            expect(mockLogger.debug).toHaveBeenCalledWith('Detecting Vite configs in /workspace');
        });

        test('should handle errors during config detection', async () => {
            const mockError = new Error('Detection failed');
            manager.configDetector.detect.mockRejectedValue(mockError);

            await expect(manager.detectConfigs('/workspace')).rejects.toThrow(
                'Failed to detect Vite configurations: Detection failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error detecting Vite configs:', mockError);
        });
    });

    describe('analyzeConfig', () => {
        test('should analyze Vite config and return combined results', async () => {
            const mockAnalysis = {
                content: '/* vite config content */',
                plugins: [
                    { name: 'vite-plugin-react', description: 'React support for Vite' }
                ],
                optimizationOptions: {
                    build: { minify: true },
                    dependencies: { optimize: false }
                },
                isValid: true
            };

            const mockSuggestions = [
                { title: 'Enable dependency optimization', description: 'Speed up dev server startup', code: 'optimizeDeps: { include: ["react", "react-dom"] }' }
            ];

            manager.configAnalyzer.analyze.mockResolvedValue(mockAnalysis);
            manager.optimizationService.generateSuggestions.mockResolvedValue(mockSuggestions);

            const result = await manager.analyzeConfig('/workspace/vite.config.js');

            expect(manager.configAnalyzer.analyze).toHaveBeenCalledWith('/workspace/vite.config.js');
            expect(manager.optimizationService.generateSuggestions).toHaveBeenCalledWith(
                mockAnalysis.content,
                mockAnalysis.plugins,
                mockAnalysis.optimizationOptions
            );

            expect(result).toEqual({
                ...mockAnalysis,
                optimizationSuggestions: mockSuggestions
            });
        });

        test('should handle errors during analysis', async () => {
            const mockError = new Error('Analysis failed');
            manager.configAnalyzer.analyze.mockRejectedValue(mockError);

            await expect(manager.analyzeConfig('/workspace/vite.config.js')).rejects.toThrow(
                'Failed to analyze Vite configuration: Analysis failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error analyzing Vite config:', mockError);
        });
    });

    describe('validateConfig', () => {
        test('should validate config and return isValid', async () => {
            const mockAnalysis = {
                content: '/* vite config content */',
                plugins: [],
                optimizationOptions: {},
                isValid: true,
                optimizationSuggestions: []
            };

            // Mock analyzeConfig to return the mock analysis
            manager.analyzeConfig = jest.fn().mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig('/workspace/vite.config.js');

            expect(manager.analyzeConfig).toHaveBeenCalledWith('/workspace/vite.config.js');
            expect(result).toBe(true);
        });

        test('should handle invalid configurations', async () => {
            const mockAnalysis = {
                content: '/* vite config content */',
                plugins: [],
                optimizationOptions: {},
                isValid: false,
                optimizationSuggestions: []
            };

            manager.analyzeConfig = jest.fn().mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig('/workspace/vite.config.js');

            expect(result).toBe(false);
        });

        test('should handle errors during validation', async () => {
            const mockError = new Error('Validation failed');
            manager.analyzeConfig = jest.fn().mockRejectedValue(mockError);

            await expect(manager.validateConfig('/workspace/vite.config.js')).rejects.toThrow(
                'Failed to validate Vite configuration: Validation failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error validating Vite config:', mockError);
        });
    });

    describe('generateOptimizations', () => {
        test('should generate optimization suggestions', async () => {
            const mockAnalysis = {
                content: '/* vite config content */',
                plugins: [],
                optimizationOptions: {},
                isValid: true,
                optimizationSuggestions: [
                    { title: 'Enable build cache', description: 'Speed up builds', code: 'build: { cache: true }' },
                    { title: 'Use production source maps', description: 'Better performance', code: 'build: { sourcemap: "hidden" }' }
                ]
            };

            manager.analyzeConfig = jest.fn().mockResolvedValue(mockAnalysis);

            const result = await manager.generateOptimizations('/workspace/vite.config.js');

            expect(manager.analyzeConfig).toHaveBeenCalledWith('/workspace/vite.config.js');
            expect(result).toEqual(mockAnalysis.optimizationSuggestions);
        });

        test('should handle errors during optimization generation', async () => {
            const mockError = new Error('Optimization failed');
            manager.analyzeConfig = jest.fn().mockRejectedValue(mockError);

            await expect(manager.generateOptimizations('/workspace/vite.config.js')).rejects.toThrow(
                'Failed to generate optimization suggestions: Optimization failed'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error generating optimizations:', mockError);
        });
    });

    describe('detectFramework', () => {
        test('should detect Vue framework correctly', async () => {
            fs.promises.readFile.mockResolvedValue(`
                import { defineConfig } from 'vite';
                import vue from '@vitejs/plugin-vue';

                export default defineConfig({
                    plugins: [vue()]
                });
            `);

            const framework = await manager.detectFramework('/workspace/vite.config.js');

            expect(fs.promises.readFile).toHaveBeenCalledWith('/workspace/vite.config.js', 'utf-8');
            expect(framework).toBe('vue');
        });

        test('should detect React framework correctly', async () => {
            fs.promises.readFile.mockResolvedValue(`
                import { defineConfig } from 'vite';
                import react from '@vitejs/plugin-react';

                export default defineConfig({
                    plugins: [react()]
                });
            `);

            const framework = await manager.detectFramework('/workspace/vite.config.js');

            expect(framework).toBe('react');
        });

        test('should detect Svelte framework correctly', async () => {
            fs.promises.readFile.mockResolvedValue(`
                import { defineConfig } from 'vite';
                import { svelte } from '@sveltejs/vite-plugin-svelte';

                export default defineConfig({
                    plugins: [svelte()]
                });
            `);

            const framework = await manager.detectFramework('/workspace/vite.config.js');

            expect(framework).toBe('svelte');
        });

        test('should return null when no known framework is detected', async () => {
            fs.promises.readFile.mockResolvedValue(`
                import { defineConfig } from 'vite';

                export default defineConfig({
                    plugins: []
                });
            `);

            const framework = await manager.detectFramework('/workspace/vite.config.js');

            expect(framework).toBeNull();
        });

        test('should handle errors during framework detection', async () => {
            const mockError = new Error('File not found');
            fs.promises.readFile.mockRejectedValue(mockError);

            await expect(manager.detectFramework('/workspace/vite.config.js')).rejects.toThrow(
                'Failed to detect framework: File not found'
            );

            expect(mockLogger.error).toHaveBeenCalledWith('Error detecting framework:', mockError);
        });
    });

    describe('Integration between methods', () => {
        test('should detect configs and then analyze the first one', async () => {
            const mockConfigs = ['/workspace/vite.config.js', '/workspace/vite.config.ts'];
            const mockAnalysis = {
                content: '/* vite config content */',
                plugins: [],
                optimizationOptions: {},
                isValid: true
            };
            const mockSuggestions = [
                { title: 'Use build cache', description: 'Speed up rebuilds', code: 'build: { cache: true }' }
            ];

            manager.configDetector.detect.mockResolvedValue(mockConfigs);
            manager.configAnalyzer.analyze.mockResolvedValue(mockAnalysis);
            manager.optimizationService.generateSuggestions.mockResolvedValue(mockSuggestions);

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

        test('should analyze and then detect framework', async () => {
            const mockAnalysis = {
                content: '/* vite config content */',
                plugins: [{ name: '@vitejs/plugin-react' }],
                optimizationOptions: {},
                isValid: true,
                optimizationSuggestions: []
            };

            fs.promises.readFile.mockResolvedValue(`
                import react from '@vitejs/plugin-react';
                export default {
                    plugins: [react()]
                }
            `);

            manager.analyzeConfig = jest.fn().mockResolvedValue(mockAnalysis);

            // First analyze
            const analysisResult = await manager.analyzeConfig('/workspace/vite.config.js');
            expect(analysisResult.plugins[0].name).toBe('@vitejs/plugin-react');

            // Then detect framework (which should be React)
            const framework = await manager.detectFramework('/workspace/vite.config.js');
            expect(framework).toBe('react');
        });
    });
});
