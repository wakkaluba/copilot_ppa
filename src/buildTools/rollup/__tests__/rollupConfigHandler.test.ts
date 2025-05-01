import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ConfigValidationError } from '../errors/ConfigValidationError';
import { OptimizationError } from '../errors/OptimizationError';
import { RollupConfigHandler } from '../rollupConfigHandler';

jest.mock('vscode');
jest.mock('fs');
jest.mock('path');

describe('RollupConfigHandler', () => {
    let handler: RollupConfigHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        handler = new RollupConfigHandler();
    });

    describe('isConfigPresent', () => {
        it('should throw when no workspace folders are open', async () => {
            (vscode.workspace.workspaceFolders as any) = undefined;

            await expect(handler.isConfigPresent()).rejects.toThrow(ConfigValidationError);
        });

        it('should return true when config file exists', async () => {
            const mockWorkspaceFolder = {
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            };
            (vscode.workspace.workspaceFolders as any) = [mockWorkspaceFolder];
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (path.join as jest.Mock).mockReturnValue('/test/workspace/rollup.config.js');

            const result = await handler.isConfigPresent();
            expect(result).toBe(true);
        });

        it('should return false when no config files exist', async () => {
            const mockWorkspaceFolder = {
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            };
            (vscode.workspace.workspaceFolders as any) = [mockWorkspaceFolder];
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = await handler.isConfigPresent();
            expect(result).toBe(false);
        });

        it('should check multiple possible config file locations', async () => {
            (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
                return path.includes('rollup.config.mjs');
            });

            const result = await handler.isConfigPresent();

            expect(result).toBe(true);
            expect(fs.existsSync).toHaveBeenCalledTimes(expect.any(Number));
        });
    });

    describe('openConfig', () => {
        it('should throw when no workspace folders are open', async () => {
            (vscode.workspace.workspaceFolders as any) = undefined;

            await expect(handler.openConfig()).rejects.toThrow(ConfigValidationError);
        });

        it('should prompt to create new config when none exists', async () => {
            const mockWorkspaceFolder = {
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            };
            (vscode.workspace.workspaceFolders as any) = [mockWorkspaceFolder];
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('No');

            await handler.openConfig();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'No Rollup configuration files found. Create a new one?',
                'Yes',
                'No'
            );
        });

        it('should open single config file directly', async () => {
            const mockWorkspaceFolder = {
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            };
            (vscode.workspace.workspaceFolders as any) = [mockWorkspaceFolder];
            (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
            (path.join as jest.Mock).mockReturnValue('/test/workspace/rollup.config.js');
            const mockDocument = { mock: 'document' };
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument);

            await handler.openConfig();

            expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
            expect(vscode.window.showTextDocument).toHaveBeenCalledWith(mockDocument);
        });

        it('should open existing config file', async () => {
            await handler.openConfig();

            expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
            expect(vscode.window.showTextDocument).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('Opened Rollup configuration')
            );
        });

        it('should suggest creating a new config when file does not exist', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Yes');

            await handler.openConfig();

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('No Rollup configuration found'),
                'Yes',
                'No'
            );
        });

        it('should not create a new config when user declines', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('No');

            await handler.openConfig();

            expect(fs.promises.writeFile).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            (vscode.workspace.openTextDocument as jest.Mock).mockRejectedValue(new Error('Failed to open'));

            await handler.openConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Error opening Rollup configuration')
            );
        });
    });

    describe('createNewConfig', () => {
        it('should create new config file in workspace root', async () => {
            const mockWorkspaceFolder = {
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            };
            (vscode.workspace.workspaceFolders as any) = [mockWorkspaceFolder];
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (path.join as jest.Mock).mockReturnValue('/test/workspace/rollup.config.js');
            const mockDocument = { mock: 'document' };
            (vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue(mockDocument);

            await handler["createNewConfig"]();

            expect(fs.writeFileSync).toHaveBeenCalled();
            expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
            expect(vscode.window.showTextDocument).toHaveBeenCalledWith(mockDocument);
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Created new Rollup configuration file'
            );
        });

        it('should throw if config file already exists', async () => {
            const mockWorkspaceFolder = {
                uri: { fsPath: '/test/workspace' },
                name: 'test',
                index: 0
            };
            (vscode.workspace.workspaceFolders as any) = [mockWorkspaceFolder];
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (path.join as jest.Mock).mockReturnValue('/test/workspace/rollup.config.js');

            await expect(handler["createNewConfig"]()).rejects.toThrow(ConfigValidationError);
        });

        it('should create a new config file', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Basic config', value: 'basic' });

            await handler.createNewConfig();

            expect(fs.promises.writeFile).toHaveBeenCalled();
            expect(vscode.workspace.openTextDocument).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('Created new Rollup configuration')
            );
        });

        it('should show error when failing to write config', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue({ label: 'Basic config', value: 'basic' });
            (fs.promises.writeFile as jest.Mock).mockRejectedValue(new Error('Write error'));

            await handler.createNewConfig();

            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Error creating Rollup configuration')
            );
        });

        it('should not create config when user cancels template selection', async () => {
            (vscode.window.showQuickPick as jest.Mock).mockResolvedValue(undefined);

            await handler.createNewConfig();

            expect(fs.promises.writeFile).not.toHaveBeenCalled();
        });
    });

    describe('getRollupConfigTemplate', () => {
        it('should return a valid rollup config template', () => {
            const template = handler["getRollupConfigTemplate"]();

            expect(template).toContain('export default {');
            expect(template).toContain('input:');
            expect(template).toContain('output:');
            expect(template).toContain('plugins:');
            expect(template).toContain('@rollup/plugin-typescript');
            expect(template).toContain('@rollup/plugin-node-resolve');
            expect(template).toContain('@rollup/plugin-commonjs');
            expect(template).toContain('rollup-plugin-terser');
        });

        it('should return basic template when specified', () => {
            const template = handler.getRollupConfigTemplate('basic');

            expect(template).toContain('import');
            expect(template).toContain('export default');
            expect(template).toContain('input:');
            expect(template).toContain('output:');
        });

        it('should return library template when specified', () => {
            const template = handler.getRollupConfigTemplate('library');

            expect(template).toContain('library');
            expect(template).toContain('formats:');
        });

        it('should return TypeScript template when specified', () => {
            const template = handler.getRollupConfigTemplate('typescript');

            expect(template).toContain('typescript');
            expect(template).toContain('tsconfig');
        });

        it('should default to basic template when unspecified or unknown', () => {
            const template1 = handler.getRollupConfigTemplate();
            const template2 = handler.getRollupConfigTemplate('unknown');

            expect(template1).toEqual(template2);
            expect(template1).toContain('export default');
        });
    });

    describe('suggestOptimizations', () => {
        it('should suggest optimizations for a config file', async () => {
            const mockConfig = `
                export default {
                    input: 'src/index.js',
                    output: { file: 'dist/bundle.js', format: 'esm' }
                };
            `;
            (fs.readFileSync as jest.Mock).mockReturnValue(mockConfig);

            await handler.suggestOptimizations('/path/to/rollup.config.js');

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('optimization suggestions')
            );
        });

        it('should throw OptimizationError when config is invalid', async () => {
            (fs.readFileSync as jest.Mock).mockReturnValue('invalid config');

            await expect(handler.suggestOptimizations('/path/to/rollup.config.js'))
                .rejects.toThrow(OptimizationError);
        });

        it('should handle file not found error', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            await expect(handler.suggestOptimizations('/path/to/rollup.config.js'))
                .rejects.toThrow(expect.stringMatching(/file not found/i));
        });

        it('should handle file read errors', async () => {
            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('Read error');
            });

            await expect(handler.suggestOptimizations('/path/to/rollup.config.js'))
                .rejects.toThrow(expect.stringMatching(/error reading/i));
        });
    });
});
