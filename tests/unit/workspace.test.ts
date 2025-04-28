import * as vscode from 'vscode';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { WorkspaceManager } from '../../src/services/WorkspaceManager';
import { Logger } from '../../src/utils/logger';

jest.mock('../../src/utils/logger');

describe('WorkspaceManager Tests', () => {
    let workspaceManager: WorkspaceManager;
    let sandbox: sinon.SinonSandbox;
    let fsStub: sinon.SinonStubbedInstance<typeof vscode.workspace.fs>;
    let mockLogger: jest.Mocked<Logger>;
    
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fsStub = sandbox.stub(vscode.workspace.fs);
        
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        } as unknown as jest.Mocked<Logger>;
        
        // Fix the Logger getInstance mock
        (Logger.getInstance as jest.Mock) = jest.fn().mockReturnValue(mockLogger);
        
        workspaceManager = new WorkspaceManager();
    });
    
    afterEach(() => {
        sandbox.restore();
    });
    
    describe('File Operations', () => {
        test('reads file content', async () => {
            const uri = vscode.Uri.file('/test/file.txt');
            const content = 'Test content';
            const buffer = Buffer.from(content, 'utf8');
            
            fsStub.readFile.resolves(buffer);
            
            const result = await workspaceManager.readFile(uri);
            
            assert.strictEqual(result, content);
            sinon.assert.calledWith(fsStub.readFile, uri);
        });
        
        test('writes file content', async () => {
            const uri = vscode.Uri.file('/test/file.txt');
            const content = 'New content';
            const buffer = Buffer.from(content, 'utf8');
            
            fsStub.writeFile.resolves(undefined);
            
            await workspaceManager.writeFile(uri, content);
            
            sinon.assert.calledWith(fsStub.writeFile, uri, buffer);
        });
        
        test('lists directory contents', async () => {
            const uri = vscode.Uri.file('/test/dir');
            const mockDirectoryContents: [string, vscode.FileType][] = [
                ['file1.ts', vscode.FileType.File],
                ['dir1', vscode.FileType.Directory]
            ];
            fsStub.readDirectory.resolves(mockDirectoryContents);
            try {
                const contents = await workspaceManager.listDirectory(uri);
                expect(contents).toHaveLength(2);
                expect(contents?.[0]?.[0]).toBe('file1.ts');
                expect(contents?.[0]?.[1]).toBe(vscode.FileType.File);
                expect(contents?.[1]?.[0]).toBe('dir1');
                expect(contents?.[1]?.[1]).toBe(vscode.FileType.Directory);
                expect(fsStub.readDirectory).toHaveBeenCalledWith(uri);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });

        test('checks file existence', async () => {
            const uri = vscode.Uri.file('/test/file.ts');
            fsStub.stat.resolves({
                type: vscode.FileType.File, size: 100, ctime: 0, mtime: 0
            });
            try {
                const exists = await workspaceManager.fileExists(uri);
                expect(exists).toBe(true);
                expect(fsStub.stat).toHaveBeenCalledWith(uri);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });

         test('checks file non-existence', async () => {
            const uri = vscode.Uri.file('/test/nonexistent.ts');
            fsStub.stat.rejects(new vscode.FileSystemError(uri));
            try {
                const exists = await workspaceManager.fileExists(uri);
                expect(exists).toBe(false);
                expect(fsStub.stat).toHaveBeenCalledWith(uri);
            } catch (error) {
                 assert.fail(`Test failed unexpectedly: ${error}`);
            }
        });
    });

    describe('Workspace Operations', () => {
        test('gets workspace folders', () => {
            const mockFoldersData: vscode.WorkspaceFolder[] = [
                { uri: vscode.Uri.file('/workspace1'), name: 'ws1', index: 0 },
                { uri: vscode.Uri.file('/workspace2'), name: 'ws2', index: 1 }
            ];
            Object.defineProperty(vscode.workspace, 'workspaceFolders', {
                value: mockFoldersData,
                writable: true,
                configurable: true
            });

            const folders = workspaceManager.getWorkspaceFolders();
            expect(folders).toHaveLength(2);
            expect(folders?.[0]?.name).toBe('ws1');
            expect(folders?.[1]?.name).toBe('ws2');
        });

        test('finds files by pattern', async () => {
            const mockUris = [
                vscode.Uri.file('/test/file1.ts'),
                vscode.Uri.file('/test/file2.ts')
            ];
            (vscode.workspace.findFiles as jest.Mock).mockResolvedValue(mockUris);
            try {
                const files = await workspaceManager.findFiles('**/*.ts', undefined, undefined);
                expect(files).toHaveLength(2);
                expect(files?.[0]?.fsPath).toContain('file1.ts');
                expect(files?.[1]?.fsPath).toContain('file2.ts');
                expect(vscode.workspace.findFiles).toHaveBeenCalledWith('**/*.ts', undefined, undefined, undefined);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });

        test('creates directory', async () => {
            const uri = vscode.Uri.file('/test/newdir');
            fsStub.createDirectory.resolves(undefined);
            try {
                await workspaceManager.createDirectory(uri);
                expect(fsStub.createDirectory).toHaveBeenCalledWith(uri);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });
    });

    describe('Error Handling', () => {
        test('handles file read errors', async () => {
            const uri = vscode.Uri.file('/test/nonexistent.ts');
            const expectedError = new vscode.FileSystemError('File not found');
            fsStub.readFile.rejects(expectedError);

            await expect(workspaceManager.readFile(uri)).rejects.toThrow(expectedError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error reading file'), expectedError);
        });

        test('handles file write errors', async () => {
            const uri = vscode.Uri.file('/test/readonly.ts');
            const expectedError = new vscode.FileSystemError('Permission denied');
            fsStub.writeFile.rejects(expectedError);

            await expect(workspaceManager.writeFile(uri, 'content')).rejects.toThrow(expectedError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error writing file'), expectedError);
        });

        test('handles invalid workspace folders', () => {
            Object.defineProperty(vscode.workspace, 'workspaceFolders', {
                value: undefined,
                writable: true,
                configurable: true
            });

            const folders = workspaceManager.getWorkspaceFolders();
            expect(folders).toHaveLength(0);
        });

         test('handles list directory errors', async () => {
            const uri = vscode.Uri.file('/test/nodir');
            const expectedError = new vscode.FileSystemError('Directory not found');
            fsStub.readDirectory.rejects(expectedError);

            await expect(workspaceManager.listDirectory(uri)).rejects.toThrow(expectedError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error listing directory'), expectedError);
        });

         test('handles find files errors', async () => {
            const expectedError = new Error('Search failed');
            (vscode.workspace.findFiles as jest.Mock).mockRejectedValue(expectedError);

            await expect(workspaceManager.findFiles('**/*.ts')).rejects.toThrow(expectedError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error finding files'), expectedError);
        });

         test('handles create directory errors', async () => {
            const uri = vscode.Uri.file('/test/noperm');
            const expectedError = new vscode.FileSystemError('Permission denied');
            fsStub.createDirectory.rejects(expectedError);

            await expect(workspaceManager.createDirectory(uri)).rejects.toThrow(expectedError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating directory'), expectedError);
        });
    });

    describe('Configuration', () => {
        let mockConfig: MockWorkspaceConfiguration;

         beforeEach(() => {
            mockConfig = {
                get: jest.fn(),
                update: jest.fn().mockResolvedValue(undefined),
                has: jest.fn(),
                inspect: jest.fn()
            } as MockWorkspaceConfiguration;
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);
        });

        test('gets workspace configuration', () => {
            const expectedValue = 'test-value';
            mockConfig.get.mockReturnValue(expectedValue);

            const value = workspaceManager.getConfiguration('section', 'key');
            expect(value).toBe(expectedValue);
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('section', undefined);
            expect(mockConfig.get).toHaveBeenCalledWith('key', undefined);
        });

         test('gets workspace configuration with default value', () => {
            const defaultValue = 'default';
            mockConfig.get.mockReturnValue(undefined);

            const value = workspaceManager.getConfiguration('section', 'key', defaultValue);
            expect(value).toBe(defaultValue);
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('section', undefined);
            expect(mockConfig.get).toHaveBeenCalledWith('key', defaultValue);
        });

        test('updates workspace configuration', async () => {
            const newValue = 'new-value';
            try {
                await workspaceManager.updateConfiguration('section', 'key', newValue);
                expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('section', undefined);
                expect(mockConfig.update).toHaveBeenCalledWith('key', newValue, vscode.ConfigurationTarget.Workspace);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });

         test('updates workspace configuration with target', async () => {
            const newValue = 'new-value-global';
            const target = vscode.ConfigurationTarget.Global;
            try {
                await workspaceManager.updateConfiguration('section', 'key', newValue, target);
                expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('section', undefined);
                expect(mockConfig.update).toHaveBeenCalledWith('key', newValue, target);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });

         test('handles configuration update errors', async () => {
            const expectedError = new Error('Update failed');
            mockConfig.update.mockRejectedValue(expectedError);

            await expect(workspaceManager.updateConfiguration('section', 'key', 'value'))
                .rejects.toThrow(expectedError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error updating configuration'), expectedError);
        });
    });
});