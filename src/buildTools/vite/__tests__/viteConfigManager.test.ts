import * as fs from 'fs';
import { ILogger } from '../../../services/logging/ILogger';
import { ViteConfigAnalyzer, ViteConfigDetector, ViteOptimizationService } from '../services';
import { ViteConfigManager } from '../viteConfigManager';

// Mock the dependencies
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
    },
    existsSync: jest.fn()
}));

jest.mock('path', () => ({
    join: jest.fn((...args) => args.join('/')),
    resolve: jest.fn((...args) => args.join('/')),
}));

jest.mock('glob', () => ({
    sync: jest.fn()
}));

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

// Mock logger
class MockLogger implements ILogger {
    debug = jest.fn();
    info = jest.fn();
    warn = jest.fn();
    error = jest.fn();
}

describe('ViteConfigManager', () => {
    let manager: ViteConfigManager;
    let mockLogger: MockLogger;
    let mockDetector: jest.Mocked<ViteConfigDetector>;
    let mockAnalyzer: jest.Mocked<ViteConfigAnalyzer>;
    let mockOptimizationService: jest.Mocked<ViteOptimizationService>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock logger and dependencies
        mockLogger = new MockLogger();

        // Initialize the manager with the mock logger
        manager = new ViteConfigManager(mockLogger);

        // Get references to the mocked services
        mockDetector = (manager as any).configDetector;
        mockAnalyzer = (manager as any).configAnalyzer;
        mockOptimizationService = (manager as any).optimizationService;
    });

    describe('constructor', () => {
        it('should initialize with provided logger', () => {
            const customLogger = new MockLogger();
            const customManager = new ViteConfigManager(customLogger);

            expect((customManager as any).logger).toBe(customLogger);
            expect(ViteConfigDetector).toHaveBeenCalledWith(customLogger);
            expect(ViteConfigAnalyzer).toHaveBeenCalledWith(customLogger);
            expect(ViteOptimizationService).toHaveBeenCalledWith(customLogger);
        });

        it('should initialize with default NoOpLogger when no logger provided', () => {
            const defaultManager = new ViteConfigManager();

            expect((defaultManager as any).logger).toBeDefined();
            expect(ViteConfigDetector).toHaveBeenCalled();
            expect(ViteConfigAnalyzer).toHaveBeenCalled();
            expect(ViteOptimizationService).toHaveBeenCalled();
        });
    });

    describe('detectConfigs', () => {
        it('should call detector service and return detected config paths', async () => {
            const workspacePath = '/workspace';
            const mockConfigPaths = ['/workspace/vite.config.js', '/workspace/app/vite.config.ts'];

            mockDetector.detect.mockResolvedValue(mockConfigPaths);

            const result = await manager.detectConfigs(workspacePath);

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(workspacePath));
            expect(mockDetector.detect).toHaveBeenCalledWith(workspacePath);
            expect(result).toEqual(mockConfigPaths);
        });

        it('should handle errors from detector service', async () => {
            const workspacePath = '/workspace';
            const error = new Error('Detection failed');

            mockDetector.detect.mockRejectedValue(error);

            await expect(manager.detectConfigs(workspacePath)).rejects.toThrow(
                /Failed to detect Vite configurations/
            );

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(workspacePath));
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Error detecting Vite configs:',
                error
            );
        });
    });

    describe('analyzeConfig', () => {
        it('should analyze config and include optimization suggestions', async () => {
            const configPath = '/workspace/vite.config.js';
            const mockAnalysis = {
                content: 'export default {}',
                plugins: [],
                optimizationOptions: {},
                isValid: true
            };
            const mockSuggestions = ['Use plugins', 'Enable minification'];

            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);
            mockOptimizationService.generateSuggestions.mockResolvedValue(mockSuggestions);

            const result = await manager.analyzeConfig(configPath);

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(mockAnalyzer.analyze).toHaveBeenCalledWith(configPath);
            expect(mockOptimizationService.generateSuggestions).toHaveBeenCalledWith(
                mockAnalysis.content,
                mockAnalysis.plugins,
                mockAnalysis.optimizationOptions
            );

            expect(result).toEqual({
                ...mockAnalysis,
                optimizationSuggestions: mockSuggestions
            });
        });

        it('should handle errors from analyzer service', async () => {
            const configPath = '/workspace/vite.config.js';
            const error = new Error('Analysis failed');

            mockAnalyzer.analyze.mockRejectedValue(error);

            await expect(manager.analyzeConfig(configPath)).rejects.toThrow(
                /Failed to analyze Vite configuration/
            );

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Error analyzing Vite config:',
                error
            );
        });

        it('should handle errors from optimization service', async () => {
            const configPath = '/workspace/vite.config.js';
            const mockAnalysis = {
                content: 'export default {}',
                plugins: [],
                optimizationOptions: {},
                isValid: true
            };
            const error = new Error('Optimization failed');

            mockAnalyzer.analyze.mockResolvedValue(mockAnalysis);
            mockOptimizationService.generateSuggestions.mockRejectedValue(error);

            await expect(manager.analyzeConfig(configPath)).rejects.toThrow(
                /Failed to analyze Vite configuration/
            );

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Error analyzing Vite config:',
                error
            );
        });
    });

    describe('validateConfig', () => {
        it('should return true when config is valid', async () => {
            const configPath = '/workspace/vite.config.js';
            const mockAnalysis = {
                content: 'export default {}',
                plugins: [],
                optimizationOptions: {},
                isValid: true,
                optimizationSuggestions: []
            };

            jest.spyOn(manager, 'analyzeConfig').mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig(configPath);

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(manager.analyzeConfig).toHaveBeenCalledWith(configPath);
            expect(result).toBe(true);
        });

        it('should handle invalid configs', async () => {
            const configPath = '/workspace/vite.config.js';
            const mockAnalysis = {
                content: 'export default {}',
                plugins: [],
                optimizationOptions: {},
                isValid: false,
                optimizationSuggestions: []
            };

            jest.spyOn(manager, 'analyzeConfig').mockResolvedValue(mockAnalysis);

            const result = await manager.validateConfig(configPath);

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(manager.analyzeConfig).toHaveBeenCalledWith(configPath);
            expect(result).toBe(false);
        });

        it('should handle errors during validation', async () => {
            const configPath = '/workspace/vite.config.js';
            const error = new Error('Validation failed');

            jest.spyOn(manager, 'analyzeConfig').mockRejectedValue(error);

            await expect(manager.validateConfig(configPath)).rejects.toThrow(
                /Failed to validate Vite configuration/
            );

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Error validating Vite config:',
                error
            );
        });
    });

    describe('generateOptimizations', () => {
        it('should return optimization suggestions', async () => {
            const configPath = '/workspace/vite.config.js';
            const mockAnalysis = {
                content: 'export default {}',
                plugins: [],
                optimizationOptions: {},
                isValid: true,
                optimizationSuggestions: ['Use plugins', 'Enable minification']
            };

            jest.spyOn(manager, 'analyzeConfig').mockResolvedValue(mockAnalysis);

            const result = await manager.generateOptimizations(configPath);

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(manager.analyzeConfig).toHaveBeenCalledWith(configPath);
            expect(result).toEqual(mockAnalysis.optimizationSuggestions);
        });

        it('should handle errors during optimization generation', async () => {
            const configPath = '/workspace/vite.config.js';
            const error = new Error('Optimization generation failed');

            jest.spyOn(manager, 'analyzeConfig').mockRejectedValue(error);

            await expect(manager.generateOptimizations(configPath)).rejects.toThrow(
                /Failed to generate optimization suggestions/
            );

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Error generating optimizations:',
                error
            );
        });
    });

    describe('detectFramework', () => {
        it('should detect Vue framework', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                import vue from '@vitejs/plugin-vue';
                export default {
                    plugins: [vue()]
                }
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(configContent);

            const result = await manager.detectFramework(configPath);

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(fs.promises.readFile).toHaveBeenCalledWith(configPath, 'utf-8');
            expect(result).toBe('vue');
        });

        it('should detect React framework', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                import react from '@vitejs/plugin-react';
                export default {
                    plugins: [react()]
                }
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(configContent);

            const result = await manager.detectFramework(configPath);

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(fs.promises.readFile).toHaveBeenCalledWith(configPath, 'utf-8');
            expect(result).toBe('react');
        });

        it('should detect Svelte framework', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                import svelte from '@sveltejs/vite-plugin-svelte';
                export default {
                    plugins: [svelte()]
                }
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(configContent);

            const result = await manager.detectFramework(configPath);

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(fs.promises.readFile).toHaveBeenCalledWith(configPath, 'utf-8');
            expect(result).toBe('svelte');
        });

        it('should return null when no framework is detected', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    plugins: []
                }
            `;

            (fs.promises.readFile as jest.Mock).mockResolvedValue(configContent);

            const result = await manager.detectFramework(configPath);

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(fs.promises.readFile).toHaveBeenCalledWith(configPath, 'utf-8');
            expect(result).toBeNull();
        });

        it('should handle errors during framework detection', async () => {
            const configPath = '/workspace/vite.config.js';
            const error = new Error('File read failed');

            (fs.promises.readFile as jest.Mock).mockRejectedValue(error);

            await expect(manager.detectFramework(configPath)).rejects.toThrow(
                /Failed to detect framework/
            );

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(configPath));
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Error detecting framework:',
                error
            );
        });
    });
});
