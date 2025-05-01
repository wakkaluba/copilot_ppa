import * as fs from 'fs';
import * as vscode from 'vscode';
import { ViteOptimizationType } from '../types';
import { ViteConfigHandler } from '../viteConfigHandler';

// Mock the vscode module
jest.mock('vscode', () => ({
    window: {
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showTextDocument: jest.fn()
    },
    workspace: {
        openTextDocument: jest.fn(),
        workspaceFolders: [],
        getWorkspaceFolder: jest.fn(),
        findFiles: jest.fn()
    },
    Uri: {
        file: jest.fn((filePath) => ({ fsPath: filePath })),
        parse: jest.fn()
    },
    commands: {
        executeCommand: jest.fn()
    },
    Position: jest.fn(),
    Selection: jest.fn()
}));

// Mock the fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn()
}));

describe('ViteConfigHandler', () => {
    let handler: ViteConfigHandler;

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

        handler = new ViteConfigHandler();
    });

    describe('isConfigPresent', () => {
        it('should return true when vite.config.js exists', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([{ fsPath: '/workspace/vite.config.js' }]);

            const result = await handler.isConfigPresent();

            expect(result).toBe(true);
            expect(vscode.workspace.findFiles).toHaveBeenCalled();
        });

        it('should return false when no vite config exists', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);

            const result = await handler.isConfigPresent();

            expect(result).toBe(false);
            expect(vscode.workspace.findFiles).toHaveBeenCalled();
        });

        it('should handle different config file names', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([{ fsPath: '/workspace/vite.config.ts' }]);

            const result = await handler.isConfigPresent();

            expect(result).toBe(true);
            expect(vscode.workspace.findFiles).toHaveBeenCalled();
        });
    });

    describe('openConfig', () => {
        it('should open existing config file', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([{ fsPath: '/workspace/vite.config.js' }]);
            const mockTextDocument = { fileName: '/workspace/vite.config.js' };
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockTextDocument);

            await handler.openConfig();

            expect(vscode.workspace.findFiles).toHaveBeenCalled();
            expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
            expect(vscode.window.showTextDocument).toHaveBeenCalledWith(mockTextDocument);
        });

        it('should show error message when no config is found', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);

            await handler.openConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('No Vite configuration file found')
            );
            expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            (vscode.workspace.findFiles as jest.Mock).mockRejectedValue(new Error('Test error'));

            await handler.openConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Error opening Vite configuration')
            );
        });
    });

    describe('createNewConfig', () => {
        it('should create new config file with template', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);
            const mockTemplate = 'export default { /* config */ }';
            (fs.writeFileSync as jest.Mock).mockImplementation();
            const mockTextDocument = { fileName: '/workspace/vite.config.js' };
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockTextDocument);

            // Mock the template method
            jest.spyOn(handler, 'getViteConfigTemplate').mockReturnValue(mockTemplate);

            await handler.createNewConfig();

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                expect.stringContaining('vite.config.js'),
                mockTemplate
            );
            expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
            expect(vscode.window.showTextDocument).toHaveBeenCalledWith(mockTextDocument);
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('Vite configuration created')
            );
        });

        it('should show error when config already exists', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([{ fsPath: '/workspace/vite.config.js' }]);

            await handler.createNewConfig();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('Vite configuration already exists')
            );
            expect(fs.writeFileSync).not.toHaveBeenCalled();
        });

        it('should handle errors during creation', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue([]);
            (fs.writeFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('Write error');
            });

            await handler.createNewConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Error creating Vite configuration')
            );
        });
    });

    describe('getViteConfigTemplate', () => {
        it('should return a valid config template string', () => {
            const template = handler.getViteConfigTemplate();

            expect(typeof template).toBe('string');
            expect(template).toContain('export default');
            expect(template).toContain('plugins');
            expect(template).toContain('build');
        });
    });

    describe('suggestOptimizations', () => {
        it('should return optimization suggestions', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    plugins: [],
                    build: {
                        outDir: 'dist'
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const optimizations = await handler.suggestOptimizations(configPath);

            expect(optimizations.length).toBeGreaterThan(0);
            expect(optimizations[0]).toHaveProperty('type');
            expect(optimizations[0]).toHaveProperty('name');
            expect(optimizations[0]).toHaveProperty('reason');
        });

        it('should suggest plugins if none are present', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    plugins: [],
                    build: {
                        outDir: 'dist'
                    }
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const optimizations = await handler.suggestOptimizations(configPath);

            // Look for plugin optimization
            const pluginOpt = optimizations.find(opt => opt.type === ViteOptimizationType.Plugin);
            expect(pluginOpt).toBeDefined();
            expect(pluginOpt?.name).toBeDefined();
        });

        it('should suggest build optimizations', async () => {
            const configPath = '/workspace/vite.config.js';
            const configContent = `
                export default {
                    plugins: [
                        'react'
                    ]
                }
            `;
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(configContent);

            const optimizations = await handler.suggestOptimizations(configPath);

            // Look for config optimization
            const configOpt = optimizations.find(opt => opt.type === ViteOptimizationType.Config);
            expect(configOpt).toBeDefined();
        });

        it('should handle errors when reading config', async () => {
            const configPath = '/workspace/vite.config.js';
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('Read error');
            });

            const optimizations = await handler.suggestOptimizations(configPath);

            expect(optimizations).toEqual([]);
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Error analyzing Vite configuration')
            );
        });

        it('should return empty array when config does not exist', async () => {
            const configPath = '/workspace/vite.config.js';
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const optimizations = await handler.suggestOptimizations(configPath);

            expect(optimizations).toEqual([]);
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Vite configuration file not found')
            );
        });
    });
});
