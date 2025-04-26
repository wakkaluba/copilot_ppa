import * as assert from 'assert';
import * as vscode from 'vscode';
import { WorkspaceManager } from '../../src/services/WorkspaceManager';
import { TestWorkspace } from '../helpers/TestWorkspace';
import { Logger } from '../../src/utils/Logger';
import { FileType } from 'vscode';

interface MockLogger extends Logger {
    debug: jest.Mock<void, [string, ...any[]]>;
    info: jest.Mock<void, [string, ...any[]]>;
    warn: jest.Mock<void, [string, ...any[]]>;
    error: jest.Mock<void, [string | Error, ...any[]]>;
}

interface MockFileSystem {
    readFile: jest.Mock<Promise<Uint8Array>, [vscode.Uri]>;
    writeFile: jest.Mock<Promise<void>, [vscode.Uri, Uint8Array]>;
    readDirectory: jest.Mock<Promise<[string, vscode.FileType][]>, [vscode.Uri]>;
    stat: jest.Mock<Promise<vscode.FileStat>, [vscode.Uri]>;
    createDirectory: jest.Mock<Promise<void>, [vscode.Uri]>;
}

interface MockWorkspaceConfiguration extends vscode.WorkspaceConfiguration {
    get: jest.Mock<any, [string, any?]>;
    update: jest.Mock<Promise<void>, [string, any, (vscode.ConfigurationTarget | boolean | null)?]>;
    has: jest.Mock<boolean, [string]>;
    inspect: jest.Mock<any, [string]>;
}

describe('Workspace Manager', () => {
    let workspaceManager: WorkspaceManager;
    let testWorkspace: TestWorkspace;
    let mockLogger: MockLogger;
    let mockFs: MockFileSystem;
    let originalWorkspaceFolders: typeof vscode.workspace.workspaceFolders;
    let originalGetConfiguration: typeof vscode.workspace.getConfiguration;
    let originalFindFiles: typeof vscode.workspace.findFiles;
    let originalFs: typeof vscode.workspace.fs;

    beforeEach(async () => {
        testWorkspace = new TestWorkspace();
        await testWorkspace.setup();

        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        } as MockLogger;

        originalWorkspaceFolders = vscode.workspace.workspaceFolders;
        originalGetConfiguration = vscode.workspace.getConfiguration;
        originalFindFiles = vscode.workspace.findFiles;
        originalFs = vscode.workspace.fs;

        mockFs = {
            readFile: jest.fn(),
            writeFile: jest.fn(),
            readDirectory: jest.fn(),
            stat: jest.fn(),
            createDirectory: jest.fn(),
        };
        (vscode.workspace as any).fs = mockFs;

        (vscode.workspace.findFiles as jest.Mock) = jest.fn();
        (vscode.workspace.getConfiguration as jest.Mock) = jest.fn();
        Object.defineProperty(vscode.workspace, 'workspaceFolders', {
            value: [],
            writable: true,
            configurable: true
        });

        (WorkspaceManager as any).instance = undefined;
        workspaceManager = WorkspaceManager.getInstance();
        if ((workspaceManager as any).setLogger) {
            (workspaceManager as any).setLogger(mockLogger);
        }
    });

    afterEach(async () => {
        await testWorkspace.cleanup();
        Object.defineProperty(vscode.workspace, 'workspaceFolders', {
            value: originalWorkspaceFolders,
            writable: false,
            configurable: true
        });
        (vscode.workspace as any).getConfiguration = originalGetConfiguration;
        (vscode.workspace as any).findFiles = originalFindFiles;
        (vscode.workspace as any).fs = originalFs;

        jest.clearAllMocks();
    });

    describe('File Operations', () => {
        test('reads file content', async () => {
            const uri = vscode.Uri.file('/test/file.ts');
            const expectedContent = 'test content';
            mockFs.readFile.mockResolvedValue(Buffer.from(expectedContent));
            try {
                const content = await workspaceManager.readFile(uri);
                expect(content).toBe(expectedContent);
                expect(mockFs.readFile).toHaveBeenCalledWith(uri);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });

        test('writes file content', async () => {
            const uri = vscode.Uri.file('/test/file.ts');
            const content = 'new content';
            mockFs.writeFile.mockResolvedValue(undefined);
            try {
                await workspaceManager.writeFile(uri, content);
                expect(mockFs.writeFile).toHaveBeenCalledWith(
                    uri,
                    Buffer.from(content)
                );
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });

        test('lists directory contents', async () => {
            const uri = vscode.Uri.file('/test/dir');
            const mockDirectoryContents: [string, vscode.FileType][] = [
                ['file1.ts', vscode.FileType.File],
                ['dir1', vscode.FileType.Directory]
            ];
            mockFs.readDirectory.mockResolvedValue(mockDirectoryContents);
            try {
                const contents = await workspaceManager.listDirectory(uri);
                expect(contents).toHaveLength(2);
                expect(contents?.[0]?.[0]).toBe('file1.ts');
                expect(contents?.[0]?.[1]).toBe(vscode.FileType.File);
                expect(contents?.[1]?.[0]).toBe('dir1');
                expect(contents?.[1]?.[1]).toBe(vscode.FileType.Directory);
                expect(mockFs.readDirectory).toHaveBeenCalledWith(uri);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });

        test('checks file existence', async () => {
            const uri = vscode.Uri.file('/test/file.ts');
            mockFs.stat.mockResolvedValue({
                type: vscode.FileType.File, size: 100, ctime: 0, mtime: 0
            });
            try {
                const exists = await workspaceManager.fileExists(uri);
                expect(exists).toBe(true);
                expect(mockFs.stat).toHaveBeenCalledWith(uri);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });

         test('checks file non-existence', async () => {
            const uri = vscode.Uri.file('/test/nonexistent.ts');
            mockFs.stat.mockRejectedValue(new vscode.FileSystemError(uri));
            try {
                const exists = await workspaceManager.fileExists(uri);
                expect(exists).toBe(false);
                expect(mockFs.stat).toHaveBeenCalledWith(uri);
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
            mockFs.createDirectory.mockResolvedValue(undefined);
            try {
                await workspaceManager.createDirectory(uri);
                expect(mockFs.createDirectory).toHaveBeenCalledWith(uri);
            } catch (error) {
                assert.fail(`Test failed with error: ${error}`);
            }
        });
    });

    describe('Error Handling', () => {
        test('handles file read errors', async () => {
            const uri = vscode.Uri.file('/test/nonexistent.ts');
            const expectedError = new vscode.FileSystemError('File not found');
            mockFs.readFile.mockRejectedValue(expectedError);

            await expect(workspaceManager.readFile(uri)).rejects.toThrow(expectedError);
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error reading file'), expectedError);
        });

        test('handles file write errors', async () => {
            const uri = vscode.Uri.file('/test/readonly.ts');
            const expectedError = new vscode.FileSystemError('Permission denied');
            mockFs.writeFile.mockRejectedValue(expectedError);

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
            mockFs.readDirectory.mockRejectedValue(expectedError);

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
            mockFs.createDirectory.mockRejectedValue(expectedError);

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