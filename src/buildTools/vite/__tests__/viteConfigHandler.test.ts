import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ViteConfigHandler } from '../viteConfigHandler';

// Mock the vscode module
jest.mock('vscode', () => ({
    window: {
        showInformationMessage: jest.fn().mockResolvedValue(null),
        showErrorMessage: jest.fn().mockResolvedValue(null),
        showTextDocument: jest.fn().mockResolvedValue(null),
        showQuickPick: jest.fn().mockResolvedValue(null)
    },
    workspace: {
        openTextDocument: jest.fn().mockResolvedValue({}),
        workspaceFolders: null
    },
    Uri: {
        file: jest.fn((filePath) => ({ fsPath: filePath }))
    }
}));

// Mock the fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    writeFileSync: jest.fn()
}));

// Mock the path module
jest.mock('path', () => ({
    join: jest.fn((a, b) => `${a}/${b}`)
}));

describe('ViteConfigHandler', () => {
    let handler: ViteConfigHandler;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock workspace folders
        (vscode.workspace.workspaceFolders as any) = [{
            uri: { fsPath: '/workspace' },
            name: 'workspace',
            index: 0
        }];

        handler = new ViteConfigHandler();
    });

    describe('isConfigPresent', () => {
        it('should return true when a vite config file exists', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);

            const result = await handler.isConfigPresent();

            expect(result).toBe(true);
            expect(fs.existsSync).toHaveBeenCalled();
            expect(path.join).toHaveBeenCalledWith('/workspace', expect.stringMatching(/vite\.config\.(js|ts|mjs)/));
        });

        it('should return false when no vite config file exists', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = await handler.isConfigPresent();

            expect(result).toBe(false);
            expect(fs.existsSync).toHaveBeenCalled();
        });

        it('should check all supported config file names', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await handler.isConfigPresent();

            // Should check all 3 supported file types
            expect(fs.existsSync).toHaveBeenCalledTimes(3);
            expect(path.join).toHaveBeenCalledWith('/workspace', 'vite.config.js');
            expect(path.join).toHaveBeenCalledWith('/workspace', 'vite.config.ts');
            expect(path.join).toHaveBeenCalledWith('/workspace', 'vite.config.mjs');
        });

        it('should return false when no workspace folders are open', async () => {
            (vscode.workspace.workspaceFolders as any) = null;

            const result = await handler.isConfigPresent();

            expect(result).toBe(false);
            expect(fs.existsSync).not.toHaveBeenCalled();
        });
    });

    describe('openConfig', () => {
        it('should open the vite config file when only one exists', async () => {
            (fs.existsSync as jest.Mock).mockImplementation((path) =>
                path === '/workspace/vite.config.js');

            await handler.openConfig();

            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith('/workspace/vite.config.js');
            expect(vscode.window.showTextDocument).toHaveBeenCalled();
        });

        it('should show quick pick when multiple config files exist', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({
                configPath: '/workspace/vite.config.ts'
            });

            await handler.openConfig();

            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith('/workspace/vite.config.ts');
            expect(vscode.window.showTextDocument).toHaveBeenCalled();
        });

        it('should prompt to create new config when none exists', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Yes');

            // Mock the private method
            const createNewConfigSpy = jest.spyOn(handler as any, 'createNewConfig').mockResolvedValue(undefined);

            await handler.openConfig();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'No Vite configuration files found. Create a new one?',
                'Yes',
                'No'
            );
            expect(createNewConfigSpy).toHaveBeenCalled();
        });

        it('should not create new config when user cancels', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('No');

            // Mock the private method
            const createNewConfigSpy = jest.spyOn(handler as any, 'createNewConfig').mockResolvedValue(undefined);

            await handler.openConfig();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'No Vite configuration files found. Create a new one?',
                'Yes',
                'No'
            );
            expect(createNewConfigSpy).not.toHaveBeenCalled();
        });

        it('should show error when no workspace folders are open', async () => {
            (vscode.workspace.workspaceFolders as any) = null;

            await handler.openConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No workspace folder is open');
            expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled();
        });
    });

    describe('createNewConfig', () => {
        it('should create a new config file in the selected folder', async () => {
            // Mock showQuickPick to return a workspace folder then a config name
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce({ folderPath: '/workspace' })
                .mockResolvedValueOnce('vite.config.js');

            // Spy on the private method that returns the template
            const getTemplateSpy = jest.spyOn(handler as any, 'getViteConfigTemplate')
                .mockReturnValue('// vite config template');

            await (handler as any).createNewConfig();

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                '/workspace/vite.config.js',
                '// vite config template'
            );
            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith('/workspace/vite.config.js');
            expect(vscode.window.showTextDocument).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Created vite.config.js');
            expect(getTemplateSpy).toHaveBeenCalled();
        });

        it('should handle the case with only one workspace folder', async () => {
            // Setup with only one workspace folder
            (vscode.workspace.workspaceFolders as any) = [{
                uri: { fsPath: '/single-workspace' },
                name: 'single-workspace',
                index: 0
            }];

            // Mock only the config name selection
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce('vite.config.ts');

            // Spy on the private method that returns the template
            const getTemplateSpy = jest.spyOn(handler as any, 'getViteConfigTemplate')
                .mockReturnValue('// vite config template');

            await (handler as any).createNewConfig();

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                '/single-workspace/vite.config.ts',
                '// vite config template'
            );
            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith('/single-workspace/vite.config.ts');
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Created vite.config.ts');
        });

        it('should abort if no workspace folder is selected', async () => {
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce(null);

            await (handler as any).createNewConfig();

            expect(fs.writeFileSync).not.toHaveBeenCalled();
            expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled();
        });

        it('should abort if no config name is selected', async () => {
            (vscode.window.showQuickPick as jest.Mock)
                .mockResolvedValueOnce({ folderPath: '/workspace' })
                .mockResolvedValueOnce(null);

            await (handler as any).createNewConfig();

            expect(fs.writeFileSync).not.toHaveBeenCalled();
            expect(vscode.workspace.openTextDocument).not.toHaveBeenCalled();
        });

        it('should show error when no workspace folders are open', async () => {
            (vscode.workspace.workspaceFolders as any) = null;

            await (handler as any).createNewConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No workspace folder is open');
            expect(fs.writeFileSync).not.toHaveBeenCalled();
        });
    });

    describe('getViteConfigTemplate', () => {
        it('should return a valid vite config template', () => {
            const template = (handler as any).getViteConfigTemplate();

            expect(template).toContain('import { defineConfig } from \'vite\'');
            expect(template).toContain('import react from \'@vitejs/plugin-react\'');
            expect(template).toContain('export default defineConfig({');
            expect(template).toContain('plugins: [react()]');
            expect(template).toContain('server: {');
            expect(template).toContain('build: {');
        });
    });

    describe('suggestOptimizations', () => {
        it('should provide optimization suggestions', async () => {
            // Mock the document text
            const mockDocument = { getText: jest.fn().mockReturnValue('export default {}') };
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument);

            // Mock the user selecting some optimizations
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue([
                'Add code splitting with manualChunks',
                'Use terser for minification'
            ]);

            await handler.suggestOptimizations('/workspace/vite.config.js');

            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith('/workspace/vite.config.js');
            expect(vscode.window.showQuickPick).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Selected optimizations: Add code splitting with manualChunks, Use terser for minification'
            );
        });

        it('should suggest terser when not present', async () => {
            // Mock the document text without terser
            const mockDocument = { getText: jest.fn().mockReturnValue('export default { build: {} }') };
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument);

            // User doesn't select any optimization
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue([]);

            await handler.suggestOptimizations('/workspace/vite.config.js');

            expect(vscode.window.showQuickPick).toHaveBeenCalledWith(
                expect.arrayContaining(['Use terser for minification']),
                expect.any(Object)
            );
        });

        it('should suggest manualChunks when not present', async () => {
            // Mock the document text without manualChunks
            const mockDocument = { getText: jest.fn().mockReturnValue('export default { build: {} }') };
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument);

            // User doesn't select any optimization
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue([]);

            await handler.suggestOptimizations('/workspace/vite.config.js');

            expect(vscode.window.showQuickPick).toHaveBeenCalledWith(
                expect.arrayContaining(['Add code splitting with manualChunks']),
                expect.any(Object)
            );
        });

        it('should suggest visualizer when not present', async () => {
            // Mock the document text without visualizer
            const mockDocument = { getText: jest.fn().mockReturnValue('export default { build: {} }') };
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument);

            // User doesn't select any optimization
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue([]);

            await handler.suggestOptimizations('/workspace/vite.config.js');

            expect(vscode.window.showQuickPick).toHaveBeenCalledWith(
                expect.arrayContaining(['Add bundle visualization with rollup-plugin-visualizer']),
                expect.any(Object)
            );
        });

        it('should show message when no optimization suggestions available', async () => {
            // Mock the document text with all optimizations
            const mockDocument = {
                getText: jest.fn().mockReturnValue(`
                    export default {
                        build: {
                            minify: 'terser',
                            rollupOptions: {
                                output: {
                                    manualChunks: {}
                                }
                            }
                        },
                        plugins: [visualizer()]
                    }
                `)
            };
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument);

            await handler.suggestOptimizations('/workspace/vite.config.js');

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('No optimization suggestions available');
            expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
        });
    });
});
