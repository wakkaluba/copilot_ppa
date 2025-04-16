import * as vscode from 'vscode';
import { WorkspaceManager } from '../../src/workspace/workspaceManager';
import { TestWorkspace } from '../helpers/testWorkspace';

describe('Workspace Manager', () => {
  let workspaceManager: WorkspaceManager;
  let testWorkspace: TestWorkspace;
  let mockContext: vscode.ExtensionContext;

  beforeEach(async () => {
    // Initialize test workspace
    testWorkspace = new TestWorkspace();
    await testWorkspace.setup();

    // Create mock context
    mockContext = {
      subscriptions: [],
      extensionPath: '/test',
      extensionUri: vscode.Uri.file('/test'),
      storageUri: vscode.Uri.file('/test/storage'),
      globalStorageUri: vscode.Uri.file('/test/global'),
      logUri: vscode.Uri.file('/test/log'),
      extensionMode: vscode.ExtensionMode.Development,
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        setKeysForSync: jest.fn()
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn()
      },
      secrets: {
        get: jest.fn(),
        store: jest.fn(),
        delete: jest.fn()
      },
      asAbsolutePath: jest.fn(path => `/test/${path}`),
      environmentVariableCollection: {
        persistent: true,
        replace: jest.fn(),
        append: jest.fn(),
        prepend: jest.fn(),
        get: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
      }
    };

    // Mock workspace APIs
    (vscode.workspace.fs.readFile as jest.Mock).mockImplementation((uri) => {
      return Promise.resolve(Buffer.from('test content'));
    });

    (vscode.workspace.fs.writeFile as jest.Mock).mockImplementation((uri, content) => {
      return Promise.resolve();
    });

    (vscode.workspace.fs.readDirectory as jest.Mock).mockImplementation((uri) => {
      return Promise.resolve([
        ['file1.ts', vscode.FileType.File],
        ['dir1', vscode.FileType.Directory]
      ]);
    });

    workspaceManager = new WorkspaceManager(mockContext);
  });

  afterEach(async () => {
    await testWorkspace.cleanup();
    jest.clearAllMocks();
  });

  describe('File Operations', () => {
    test('reads file content', async () => {
      const uri = vscode.Uri.file('/test/file.ts');
      const content = await workspaceManager.readFile(uri);

      expect(content).toBe('test content');
      expect(vscode.workspace.fs.readFile).toHaveBeenCalledWith(uri);
    });

    test('writes file content', async () => {
      const uri = vscode.Uri.file('/test/file.ts');
      const content = 'new content';

      await workspaceManager.writeFile(uri, content);

      expect(vscode.workspace.fs.writeFile).toHaveBeenCalledWith(
        uri,
        expect.any(Uint8Array)
      );
    });

    test('lists directory contents', async () => {
      const uri = vscode.Uri.file('/test/dir');
      const contents = await workspaceManager.listDirectory(uri);

      expect(contents).toHaveLength(2);
      expect(contents[0].name).toBe('file1.ts');
      expect(contents[0].type).toBe(vscode.FileType.File);
      expect(contents[1].name).toBe('dir1');
      expect(contents[1].type).toBe(vscode.FileType.Directory);
    });

    test('checks file existence', async () => {
      const uri = vscode.Uri.file('/test/file.ts');
      (vscode.workspace.fs.stat as jest.Mock).mockResolvedValueOnce({
        type: vscode.FileType.File
      });

      const exists = await workspaceManager.fileExists(uri);
      expect(exists).toBe(true);
    });
  });

  describe('Workspace Operations', () => {
    test('gets workspace folders', () => {
      const mockFolders = [
        { uri: vscode.Uri.file('/workspace1'), name: 'ws1', index: 0 },
        { uri: vscode.Uri.file('/workspace2'), name: 'ws2', index: 1 }
      ];
      (vscode.workspace.workspaceFolders as any) = mockFolders;

      const folders = workspaceManager.getWorkspaceFolders();
      expect(folders).toHaveLength(2);
      expect(folders[0].name).toBe('ws1');
      expect(folders[1].name).toBe('ws2');
    });

    test('finds files by pattern', async () => {
      const mockUris = [
        vscode.Uri.file('/test/file1.ts'),
        vscode.Uri.file('/test/file2.ts')
      ];
      (vscode.workspace.findFiles as jest.Mock).mockResolvedValueOnce(mockUris);

      const files = await workspaceManager.findFiles('**/*.ts');
      expect(files).toHaveLength(2);
      expect(files[0].fsPath).toContain('file1.ts');
      expect(files[1].fsPath).toContain('file2.ts');
    });

    test('creates directory', async () => {
      const uri = vscode.Uri.file('/test/newdir');
      await workspaceManager.createDirectory(uri);

      expect(vscode.workspace.fs.createDirectory).toHaveBeenCalledWith(uri);
    });
  });

  describe('Error Handling', () => {
    test('handles file read errors', async () => {
      const uri = vscode.Uri.file('/test/nonexistent.ts');
      (vscode.workspace.fs.readFile as jest.Mock).mockRejectedValueOnce(
        new Error('File not found')
      );

      await expect(workspaceManager.readFile(uri)).rejects.toThrow('File not found');
    });

    test('handles file write errors', async () => {
      const uri = vscode.Uri.file('/test/readonly.ts');
      (vscode.workspace.fs.writeFile as jest.Mock).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      await expect(workspaceManager.writeFile(uri, 'content')).rejects.toThrow(
        'Permission denied'
      );
    });

    test('handles invalid workspace folders', () => {
      (vscode.workspace.workspaceFolders as any) = undefined;

      const folders = workspaceManager.getWorkspaceFolders();
      expect(folders).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    test('gets workspace configuration', () => {
      const mockConfig = {
        get: jest.fn().mockReturnValue('test-value'),
        update: jest.fn()
      };
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

      const value = workspaceManager.getConfiguration('section', 'key');
      expect(value).toBe('test-value');
    });

    test('updates workspace configuration', async () => {
      const mockConfig = {
        get: jest.fn(),
        update: jest.fn().mockResolvedValueOnce(undefined)
      };
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

      await workspaceManager.updateConfiguration('section', 'key', 'new-value');
      expect(mockConfig.update).toHaveBeenCalledWith('key', 'new-value', undefined);
    });
  });
});