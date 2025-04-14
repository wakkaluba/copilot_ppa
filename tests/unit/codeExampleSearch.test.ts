import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as assert from 'assert';
import axios from 'axios';
import { CodeExampleSearch, CodeExample } from '../../src/codeExampleSearch';

describe('CodeExampleSearch Tests', () => {
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;
  let fsExistsSyncStub: sinon.SinonStub;
  let fsMkdirSyncStub: sinon.SinonStub;
  let fsReadFileSyncStub: sinon.SinonStub;
  let fsWriteFileSyncStub: sinon.SinonStub;
  let fsUnlinkSyncStub: sinon.SinonStub;
  let axiosGetStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;
  let createWebviewPanelStub: sinon.SinonStub;
  let mockWebviewPanel: any;
  let mockWebview: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Mock the extension context
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: () => {},
        update: () => Promise.resolve(),
        keys: () => []
      },
      globalState: {
        get: () => {},
        update: () => Promise.resolve(),
        keys: () => [],
        setKeysForSync: () => {}
      },
      extensionPath: '/fake/extension/path',
      extensionUri: vscode.Uri.parse('file:///fake/extension/path'),
      asAbsolutePath: (p) => path.join('/fake/extension/path', p),
      storagePath: '/fake/storage/path',
      storageUri: vscode.Uri.parse('file:///fake/storage/path'),
      globalStoragePath: '/fake/global/storage/path',
      globalStorageUri: vscode.Uri.parse('file:///fake/global/storage/path'),
      logPath: '/fake/log/path',
      logUri: vscode.Uri.parse('file:///fake/log/path')
    };

    // Mock fs functions
    fsExistsSyncStub = sandbox.stub(fs, 'existsSync');
    fsMkdirSyncStub = sandbox.stub(fs, 'mkdirSync');
    fsReadFileSyncStub = sandbox.stub(fs, 'readFileSync');
    fsWriteFileSyncStub = sandbox.stub(fs, 'writeFileSync');
    fsUnlinkSyncStub = sandbox.stub(fs, 'unlinkSync');

    // Mock axios
    axiosGetStub = sandbox.stub(axios, 'get');

    // Mock VS Code API
    showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
    
    // Mock webview panel
    mockWebview = {
      html: '',
      onDidReceiveMessage: sandbox.stub(),
      postMessage: sandbox.stub(),
      cspSource: 'mock-csp-source'
    };
    
    mockWebviewPanel = {
      webview: mockWebview,
      onDidDispose: sandbox.stub()
    };
    
    createWebviewPanelStub = sandbox.stub(vscode.window, 'createWebviewPanel').returns(mockWebviewPanel);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Constructor', () => {
    it('should create cache directory if it does not exist', () => {
      fsExistsSyncStub.returns(false);
      
      new CodeExampleSearch(mockContext);
      
      assert(fsExistsSyncStub.calledOnce, 'Should check if cache directory exists');
      assert(fsMkdirSyncStub.calledOnce, 'Should create cache directory');
      assert(fsMkdirSyncStub.firstCall.args[1].recursive, 'Should create directories recursively');
    });

    it('should not create cache directory if it already exists', () => {
      fsExistsSyncStub.returns(true);
      
      new CodeExampleSearch(mockContext);
      
      assert(fsExistsSyncStub.calledOnce, 'Should check if cache directory exists');
      assert(fsMkdirSyncStub.notCalled, 'Should not create cache directory');
    });
  });

  describe('searchExamples', () => {
    it('should return cached results if available and not expired', async () => {
      fsExistsSyncStub.returns(true);
      
      const mockCachedData = {
        timestamp: new Date().toISOString(),
        examples: [{ id: '123', filename: 'test.js', content: 'console.log("test")', language: 'javascript', url: 'https://github.com', repository: 'test/repo', relevanceScore: 0.8 }]
      };
      
      fsReadFileSyncStub.returns(JSON.stringify(mockCachedData));
      
      const codeExampleSearch = new CodeExampleSearch(mockContext);
      const results = await codeExampleSearch.searchExamples('test query', 'javascript');
      
      assert.deepStrictEqual(results, mockCachedData.examples, 'Should return cached examples');
      assert(fsReadFileSyncStub.calledOnce, 'Should read from cache file');
      assert(axiosGetStub.notCalled, 'Should not call GitHub API');
    });

    it('should search GitHub API if cache is not available', async () => {
      // Make cache check fail
      fsExistsSyncStub.returns(false);
      
      // Mock GitHub API response
      const mockGitHubSearchResponse = {
        status: 200,
        data: {
          items: [
            { sha: '123', name: 'test.js', html_url: 'https://github.com/test/repo/test.js', url: 'https://api.github.com/repos/test/repo/contents/test.js', repository: { full_name: 'test/repo' } }
          ]
        }
      };
      
      const mockGitHubContentResponse = {
        status: 200,
        data: 'console.log("test");'
      };
      
      axiosGetStub.onFirstCall().resolves(mockGitHubSearchResponse);
      axiosGetStub.onSecondCall().resolves(mockGitHubContentResponse);
      
      const codeExampleSearch = new CodeExampleSearch(mockContext);
      const results = await codeExampleSearch.searchExamples('test query', 'javascript');
      
      assert(axiosGetStub.calledTwice, 'Should call GitHub API twice (search + content)');
      assert(fsWriteFileSyncStub.calledOnce, 'Should write results to cache');
      assert.strictEqual(results.length, 1, 'Should return one example');
      assert.strictEqual(results[0].filename, 'test.js', 'Example should have correct filename');
    });
  });

  describe('showExampleUI', () => {
    it('should show information message if no examples are found', async () => {
      const codeExampleSearch = new CodeExampleSearch(mockContext);
      await codeExampleSearch.showExampleUI([]);
      
      assert(showInformationMessageStub.calledOnce, 'Should show information message');
      assert(showInformationMessageStub.calledWith('No code examples found.'), 'Should show correct message');
      assert(createWebviewPanelStub.notCalled, 'Should not create webview panel');
    });

    it('should create webview panel with examples', async () => {
      const examples: CodeExample[] = [
        { 
          id: '123', 
          filename: 'test.js', 
          content: 'console.log("test")', 
          language: 'javascript', 
          url: 'https://github.com/test/repo/test.js', 
          repository: 'test/repo', 
          relevanceScore: 0.8 
        }
      ];
      
      const codeExampleSearch = new CodeExampleSearch(mockContext);
      await codeExampleSearch.showExampleUI(examples);
      
      assert(createWebviewPanelStub.calledOnce, 'Should create webview panel');
      assert(mockWebview.onDidReceiveMessage.calledOnce, 'Should set up message handler');
      assert.strictEqual(typeof mockWebview.html, 'string', 'Should set HTML content');
      assert(mockWebview.html.includes('test.js'), 'HTML should contain example filename');
      assert(mockWebview.html.includes('console.log("test")'), 'HTML should contain example content');
    });
  });
});