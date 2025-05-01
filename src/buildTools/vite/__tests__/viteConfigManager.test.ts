import * as fs from 'fs';
import * as vscode from 'vscode';
import { ViteOptimizationType } from '../types';
import { ViteConfigManager } from '../viteConfigManager';

// Mock the vscode module
jest.mock('vscode', () => ({
    window: {
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn()
    },
    workspace: {
        workspaceFolders: [],
        getWorkspaceFolder: jest.fn(),
        findFiles: jest.fn()
    },
    Uri: {
        file: jest.fn((filePath) => ({ fsPath: filePath })),
        parse: jest.fn()
    }
}));

// Mock the fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
    readdirSync: jest.fn()
}));

describe('ViteConfigManager', () => {
    let manager: ViteConfigManager;

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup test workspace
        (vscode.workspace.workspaceFolders as any) = [{
            uri: { fsPath: '/workspace' },
            name: 'workspace',
            index: 0
        }];
        (vscode.workspace.getWorkspaceFolder as jest.Mock).mockReturnValue({
            uri: { fsPath: '/workspace' }
        });

        manager = new ViteConfigManager();
    });

    describe('detectConfigs', () => {
        it('should detect vite.config.js files', async () => {
            const configFiles = [
                { fsPath: '/workspace/vite.config.js' }
            ];
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue(configFiles);
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const result = await manager.detectConfigs();

            expect(result).toHaveLength(1);
            expect(result[0]).toBe('/workspace/vite.config.js');
            expect(vscode.workspace.findFiles).toHaveBeenCalledWith('**/vite.config.{js,ts,mjs,cjs}');
        });

        it('should detect multiple config files', async () => {
            const configFiles = [
                { fsPath: '/workspace/vite.config.js' },
                { fsPath: '/workspace/packages/app/vite.config.ts' }
            ];
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue(configFiles);
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const result = await manager.detectConfigs();

            expect(result).toHaveLength(2);
            expect(result).toContain('/workspace/vite.config.js');
            expect(result).toContain('/workspace/packages/app/vite.config.ts');
        });

        it('should return empty array when no configs are found', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);

            const result = await manager.detectConfigs();

            expect(result).toHaveLength(0);
        });

        it('should handle errors during detection', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockRejectedValue(new Error('Test error'));

            const result = await manager.detectConfigs();

            expect(result).toHaveLength(0);
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Error detecting Vite configuration files')
            );
        });
    });

    describe('analyzeConfig', () => {
        it('should analyze vite config file', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    plugins: ['@vitejs/plugin-react'],
                    build: {
                        outDir: 'dist',
                        minify: true
                    },
                    server: {
                        port: 3000
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await manager.analyzeConfig(configPath);

            expect(result).toBeDefined();
            expect(result.configPath).toBe(configPath);
            expect(result.plugins).toContain('@vitejs/plugin-react');
            expect(result.build).toHaveProperty('outDir', 'dist');
            expect(result.server).toHaveProperty('port', 3000);
            expect(result.warnings).toBeDefined();
            expect(result.errors).toBeDefined();
        });

        it('should include warnings for potential issues', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    // Missing plugins
                    build: {
                        outDir: 'dist'
                        // Missing minify option
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await manager.analyzeConfig(configPath);

            expect(result.warnings).toBeDefined();
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('should handle errors when config file does not exist', async () => {
            const configPath = '/workspace/vite.config.js';
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = await manager.analyzeConfig(configPath);

            expect(result.errors).toBeDefined();
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain('Configuration file not found');
        });

        it('should handle invalid config files', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                // Invalid config
                export default {
                    plugins: [
                        // Unclosed array
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await manager.analyzeConfig(configPath);

            expect(result.errors).toBeDefined();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('validateConfig', () => {
        it('should validate a correct config file', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    plugins: ['@vitejs/plugin-react'],
                    build: {
                        outDir: 'dist',
                        minify: true
                    },
                    server: {
                        port: 3000
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await manager.validateConfig(configPath);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toBeDefined();
            expect(result.errors).toHaveLength(0);
        });

        it('should detect validation issues', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    // Missing plugins
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const result = await manager.validateConfig(configPath);

            expect(result.isValid).toBe(true); // Still valid but with warnings
            expect(result.warnings).toBeDefined();
            expect(result.warnings.length).toBeGreaterThan(0);
        });

        it('should mark invalid configs as not valid', async () => {
            const configPath = '/workspace/vite.config.js';
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = await manager.validateConfig(configPath);

            expect(result.isValid).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('generateOptimizations', () => {
        it('should generate optimization suggestions', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    plugins: [],
                    build: {
                        outDir: 'dist'
                        // Missing minify option
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const optimizations = await manager.generateOptimizations(configPath);

            expect(optimizations).toBeDefined();
            expect(optimizations.length).toBeGreaterThan(0);

            // Look for specific optimization types
            const pluginOpt = optimizations.find(o => o.type === ViteOptimizationType.Plugin);
            expect(pluginOpt).toBeDefined();

            const configOpt = optimizations.find(o => o.type === ViteOptimizationType.Config);
            expect(configOpt).toBeDefined();
        });

        it('should suggest plugin optimizations', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    plugins: [],
                    build: {
                        outDir: 'dist',
                        minify: true
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const optimizations = await manager.generateOptimizations(configPath);

            // Should suggest at least one plugin optimization
            const pluginOpts = optimizations.filter(o => o.type === ViteOptimizationType.Plugin);
            expect(pluginOpts.length).toBeGreaterThan(0);

            // Check for common plugin suggestions
            const hasReactPlugin = pluginOpts.some(o => o.name && o.name.includes('react'));
            const hasVuePlugin = pluginOpts.some(o => o.name && o.name.includes('vue'));
            expect(hasReactPlugin || hasVuePlugin).toBe(true);
        });

        it('should suggest config optimizations', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    plugins: ['@vitejs/plugin-react'],
                    build: {
                        outDir: 'dist'
                        // Missing minify option
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const optimizations = await manager.generateOptimizations(configPath);

            // Should suggest at least one config optimization
            const configOpts = optimizations.filter(o => o.type === ViteOptimizationType.Config);
            expect(configOpts.length).toBeGreaterThan(0);
        });

        it('should handle errors during optimization generation', async () => {
            const configPath = '/workspace/vite.config.js';
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const optimizations = await manager.generateOptimizations(configPath);

            expect(optimizations).toHaveLength(0);
            expect(vscode.window.showErrorMessage).toHaveBeenCalled();
        });
    });
});
