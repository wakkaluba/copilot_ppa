import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { AgentWorkspace } from '../../src/workspace/agentWorkspace';
import { LLMProviderFactory } from '../../src/providers/llmProviderFactory';

suite('Agent Workspace Integration Tests', () => {
	let sandbox: sinon.SinonSandbox;
	let workspace: AgentWorkspace;
	
	setup(() => {
		sandbox = sinon.createSandbox();
		const providerFactory = new LLMProviderFactory();
		workspace = new AgentWorkspace(providerFactory);
	});
	
	teardown(() => {
		sandbox.restore();
	});
	
	test('Should read file content correctly', async () => {
		const fsReadStub = sandbox.stub(vscode.workspace.fs, 'readFile').resolves(Buffer.from('test content'));
		const uri = vscode.Uri.file('/test/path/file.txt');
		
		const content = await workspace.readFile(uri);
		assert.strictEqual(content, 'test content');
		assert.strictEqual(fsReadStub.calledOnce, true);
	});
	
	test('Should write file content correctly', async () => {
		const fsWriteStub = sandbox.stub(vscode.workspace.fs, 'writeFile').resolves();
		const uri = vscode.Uri.file('/test/path/file.txt');
		
		await workspace.writeFile(uri, 'updated content');
		assert.strictEqual(fsWriteStub.calledOnce, true);
		assert.deepStrictEqual(fsWriteStub.firstCall.args[1], Buffer.from('updated content'));
	});
	
	test('Should list directory contents correctly', async () => {
		const fakeFiles = [
			{ name: 'file1.txt', type: vscode.FileType.File },
			{ name: 'file2.txt', type: vscode.FileType.File },
			{ name: 'dir1', type: vscode.FileType.Directory }
		];
		
		const fsReadDirStub = sandbox.stub(vscode.workspace.fs, 'readDirectory').resolves(
			fakeFiles.map(f => [f.name, f.type])
		);
		
		const uri = vscode.Uri.file('/test/path');
		const files = await workspace.listDirectory(uri);
		
		assert.strictEqual(fsReadDirStub.calledOnce, true);
		assert.strictEqual(files.length, 3);
		assert.strictEqual(files[0].name, 'file1.txt');
		assert.strictEqual(files[2].type, vscode.FileType.Directory);
	});
	
	test('Should create directory correctly', async () => {
		const fsMkDirStub = sandbox.stub(vscode.workspace.fs, 'createDirectory').resolves();
		const uri = vscode.Uri.file('/test/path/newdir');
		
		await workspace.createDirectory(uri);
		assert.strictEqual(fsMkDirStub.calledOnce, true);
		assert.strictEqual(fsMkDirStub.firstCall.args[0].path, uri.path);
	});
});

describe('AgentWorkspace Integration', () => {
  let workspace: AgentWorkspace;
  let mockProviderFactory: LLMProviderFactory;
  
  beforeEach(() => {
    mockProviderFactory = new LLMProviderFactory();
    workspace = new AgentWorkspace(mockProviderFactory);
    
    // Reset mocks
    (vscode.workspace.fs.readFile as jest.Mock).mockReset();
    (vscode.workspace.fs.writeFile as jest.Mock).mockReset();
    (vscode.workspace.fs.readDirectory as jest.Mock).mockReset();
    (vscode.workspace.fs.createDirectory as jest.Mock).mockReset();
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
    
    test('lists directory contents', async () => {
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
    
    test('creates directory', async () => {
      const uri = vscode.Uri.file('/test/path/newFolder');
      
      await workspace.createDirectory(uri);
      
      expect(vscode.workspace.fs.createDirectory).toHaveBeenCalledWith(uri);
    });
  });
  
  describe('Search Operations', () => {
    test('finds files matching pattern', async () => {
      // Mock implementation depends on your actual workspace.findFiles implementation
      // This is a basic example
      const mockUris = [
        vscode.Uri.file('/test/file1.js'),
        vscode.Uri.file('/test/file2.js')
      ];
      
      (vscode.workspace.findFiles as jest.Mock) = jest.fn().mockResolvedValueOnce(mockUris);
      
      const files = await workspace.findFiles('**/*.js');
      
      expect(vscode.workspace.findFiles).toHaveBeenCalledWith('**/*.js', null);
      expect(files).toHaveLength(2);
      expect(files[0].fsPath).toContain('file1.js');
      expect(files[1].fsPath).toContain('file2.js');
    });
  });
});
