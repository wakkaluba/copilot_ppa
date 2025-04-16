import * as vscode from 'vscode';
import { AgentWorkspace } from '../../src/workspace/agentWorkspace';
import { LLMProviderFactory } from '../../src/providers/llmProviderFactory';

describe('Agent Workspace Integration Tests', () => {
  let workspace: AgentWorkspace;
  let mockProviderFactory: LLMProviderFactory;

  beforeEach(() => {
    mockProviderFactory = new LLMProviderFactory();
    jest.spyOn(mockProviderFactory, 'createProvider').mockImplementation(() => ({
      sendMessage: jest.fn(),
      getContext: jest.fn(),
      getCapabilities: jest.fn()
    }));
    workspace = new AgentWorkspace(mockProviderFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('File Operations', () => {
    test('reads file content correctly', async () => {
      const fileContent = 'Test file content';
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValueOnce(Buffer.from(fileContent));

      const uri = vscode.Uri.file('/test/path/file.txt');
      const content = await workspace.readFile(uri);

      expect(vscode.workspace.fs.readFile).toHaveBeenCalledWith(uri);
      expect(content).toBe(fileContent);
    });

    test('writes file content correctly', async () => {
      const fileContent = 'Updated content';
      const uri = vscode.Uri.file('/test/path/file.txt');

      await workspace.writeFile(uri, fileContent);

      expect(vscode.workspace.fs.writeFile).toHaveBeenCalledWith(
        uri,
        Buffer.from(fileContent)
      );
    });

    test('lists directory contents correctly', async () => {
      const mockFiles = [
        ['file1.txt', vscode.FileType.File],
        ['folder1', vscode.FileType.Directory],
        ['file2.md', vscode.FileType.File]
      ];

      (vscode.workspace.fs.readDirectory as jest.Mock).mockResolvedValueOnce(mockFiles);

      const uri = vscode.Uri.file('/test/path');
      const files = await workspace.listDirectory(uri);

      expect(vscode.workspace.fs.readDirectory).toHaveBeenCalledWith(uri);
      expect(files).toHaveLength(3);
      expect(files[0].name).toBe('file1.txt');
      expect(files[0].type).toBe(vscode.FileType.File);
      expect(files[1].name).toBe('folder1');
      expect(files[1].type).toBe(vscode.FileType.Directory);
    });

    test('creates directory correctly', async () => {
      const uri = vscode.Uri.file('/test/path/newdir');
      await workspace.createDirectory(uri);
      expect(vscode.workspace.fs.createDirectory).toHaveBeenCalledWith(uri);
    });
  });

  describe('Search Operations', () => {
    test('finds files matching pattern', async () => {
      const mockUris = [
        vscode.Uri.file('/test/file1.js'),
        vscode.Uri.file('/test/file2.js')
      ];

      (vscode.workspace.findFiles as jest.Mock).mockResolvedValueOnce(mockUris);

      const files = await workspace.findFiles('**/*.js');

      expect(vscode.workspace.findFiles).toHaveBeenCalledWith('**/*.js', null);
      expect(files).toHaveLength(2);
      expect(files[0].fsPath).toContain('file1.js');
      expect(files[1].fsPath).toContain('file2.js');
    });
  });
});
