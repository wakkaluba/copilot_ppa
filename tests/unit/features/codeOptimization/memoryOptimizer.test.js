const assert = require('assert');
const sinon = require('sinon');
const vscode = require('vscode');

// Mock dependencies
class MockStaticMemoryAnalyzer {
  analyze(content) {
    return Promise.resolve([
      {
        file: 'test.js',
        line: 10,
        issue: 'Memory leak in closure',
        severity: 'medium',
        suggestion: 'Use WeakMap instead of storing direct references'
      }
    ]);
  }
}

class MockLLMMemoryAnalyzer {
  constructor(llmService) {
    this.llmService = llmService;
  }

  analyze(content) {
    return Promise.resolve([
      {
        file: 'test.js',
        line: 20,
        issue: 'Large object allocation',
        severity: 'high',
        suggestion: 'Consider lazy loading or pagination',
        affectedMemory: '50MB'
      }
    ]);
  }
}

class MockMemoryCacheService {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key) || null;
  }

  store(key, issues) {
    this.cache.set(key, issues);
  }

  clear() {
    this.cache.clear();
  }
}

class MockMemoryDiagnosticCollector {
  constructor(context) {
    this.context = context;
  }

  collect(fileUri, issues) {
    // Mock implementation
  }

  dispose() {
    // Mock implementation
  }
}

class MockMemoryReportGenerator {
  constructor(context) {
    this.context = context;
  }

  generate(issues) {
    // Mock implementation
  }
}

// Mock LLM Service
class MockLLMService {
  async generateCompletion() {
    return "Mock LLM response";
  }
}

describe('Memory Optimizer Tests', () => {
  let memoryOptimizer;
  let extensionContext;
  let sandbox;
  let mockStaticAnalyzer;
  let mockLLMAnalyzer;
  let mockCacheService;
  let mockDiagnosticCollector;
  let mockReportGenerator;
  let mockLLMService;
  let commandRegisterStub;
  let windowStub;
  let workspaceStub;
  let openTextDocumentStub;
  let editorStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create mock extension context
    extensionContext = {
      subscriptions: [],
      extensionPath: '/mock/path',
      workspaceState: {
        get: () => undefined,
        update: () => Promise.resolve()
      },
      globalState: {
        get: () => undefined,
        update: () => Promise.resolve()
      },
      asAbsolutePath: (path) => `/mock/path/${path}`,
      storagePath: '/mock/storage',
      globalStoragePath: '/mock/global-storage',
      logPath: '/mock/log'
    };

    // Prepare stubs
    commandRegisterStub = sandbox.stub(vscode.commands, 'registerCommand').returns({
      dispose: () => {}
    });

    windowStub = sandbox.stub(vscode.window, 'showWarningMessage');
    editorStub = sandbox.stub(vscode.window, 'activeTextEditor');

    workspaceStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([{
      uri: {
        fsPath: '/mock/workspace'
      },
      name: 'mock',
      index: 0
    }]);

    openTextDocumentStub = sandbox.stub(vscode.workspace, 'openTextDocument').resolves({
      getText: () => 'mock file content'
    });

    // Create dependency mocks
    mockStaticAnalyzer = new MockStaticMemoryAnalyzer();
    mockLLMService = new MockLLMService();
    mockLLMAnalyzer = new MockLLMMemoryAnalyzer(mockLLMService);
    mockCacheService = new MockMemoryCacheService();
    mockDiagnosticCollector = new MockMemoryDiagnosticCollector(extensionContext);
    mockReportGenerator = new MockMemoryReportGenerator(extensionContext);

    // Create spies
    sandbox.spy(mockStaticAnalyzer, 'analyze');
    sandbox.spy(mockLLMAnalyzer, 'analyze');
    sandbox.spy(mockCacheService, 'get');
    sandbox.spy(mockCacheService, 'store');
    sandbox.spy(mockCacheService, 'clear');
    sandbox.spy(mockDiagnosticCollector, 'collect');
    sandbox.spy(mockDiagnosticCollector, 'dispose');
    sandbox.spy(mockReportGenerator, 'generate');

    // Mock the required modules
    const StaticMemoryAnalyzerModule = { StaticMemoryAnalyzer: function() { return mockStaticAnalyzer; }};
    const LLMMemoryAnalyzerModule = { LLMMemoryAnalyzer: function() { return mockLLMAnalyzer; }};
    const MemoryCacheServiceModule = { MemoryCacheService: function() { return mockCacheService; }};
    const MemoryDiagnosticCollectorModule = { MemoryDiagnosticCollector: function() { return mockDiagnosticCollector; }};
    const MemoryReportGeneratorModule = { MemoryReportGenerator: function() { return mockReportGenerator; }};

    // Override the constructor to use our mocks
    const originalMemoryOptimizer = require('../../../src/features/codeOptimization/memoryOptimizer').MemoryOptimizer;
    const MemoryOptimizerProxy = function(context, llmService) {
      const instance = new originalMemoryOptimizer(context, llmService);
      instance.staticAnalyzer = mockStaticAnalyzer;
      instance.llmAnalyzer = mockLLMAnalyzer;
      instance.cacheService = mockCacheService;
      instance.diagnosticCollector = mockDiagnosticCollector;
      instance.reportGenerator = mockReportGenerator;
      return instance;
    };
    MemoryOptimizerProxy.prototype = originalMemoryOptimizer.prototype;

    // Create instance
    memoryOptimizer = new MemoryOptimizerProxy(extensionContext, mockLLMService);
  });

  afterEach(() => {
    sandbox.restore();
  });

  test('Should register commands on initialization', () => {
    assert.strictEqual(extensionContext.subscriptions.length, 1);
    assert.strictEqual(commandRegisterStub.callCount, 3);

    const commandNames = commandRegisterStub.args.map(arg => arg[0]);
    assert.ok(commandNames.includes('vscode-local-llm-agent.analyzeMemoryUsage'));
    assert.ok(commandNames.includes('vscode-local-llm-agent.analyzeWorkspaceMemory'));
    assert.ok(commandNames.includes('vscode-local-llm-agent.findMemoryLeaks'));
  });

  test('Should dispose resources correctly', () => {
    memoryOptimizer.dispose();

    sinon.assert.calledOnce(mockDiagnosticCollector.dispose);
    sinon.assert.calledOnce(mockCacheService.clear);
  });

  test('Should show warning when no active editor on analyzeCurrentFile', async () => {
    editorStub.value(undefined);

    const result = await memoryOptimizer.analyzeCurrentFile();

    sinon.assert.calledOnce(windowStub);
    sinon.assert.calledWith(windowStub, 'No active file to analyze');
    assert.deepStrictEqual(result, []);
  });

  test('Should analyze current file successfully', async () => {
    const mockDocument = {
      uri: vscode.Uri.file('/test/file.js'),
      getText: () => 'const x = 10;'
    };

    editorStub.value({
      document: mockDocument
    });

    const analyzeFileSpy = sandbox.spy(memoryOptimizer, 'analyzeFile');

    await memoryOptimizer.analyzeCurrentFile();

    sinon.assert.calledOnce(analyzeFileSpy);
    sinon.assert.calledWith(analyzeFileSpy, mockDocument.uri);
  });

  test('Should use cache when available on analyzeFile', async () => {
    const mockUri = vscode.Uri.file('/test/file.js');
    const cachedIssues = [
      {
        file: 'cached.js',
        line: 5,
        issue: 'Cached issue',
        severity: 'low',
        suggestion: 'Cached suggestion'
      }
    ];

    // Set up cache to return our mock issues
    mockCacheService.get.restore();
    sandbox.stub(mockCacheService, 'get').returns(cachedIssues);

    const issues = await memoryOptimizer.analyzeFile(mockUri);

    sinon.assert.calledOnce(mockCacheService.get);
    sinon.assert.notCalled(mockStaticAnalyzer.analyze);
    sinon.assert.notCalled(mockLLMAnalyzer.analyze);
    sinon.assert.calledOnce(mockDiagnosticCollector.collect);

    assert.deepStrictEqual(issues, cachedIssues);
  });

  test('Should combine analyzer results when no cache on analyzeFile', async () => {
    const mockUri = vscode.Uri.file('/test/file.js');

    // Ensure cache returns null (no cached data)
    mockCacheService.get.restore();
    sandbox.stub(mockCacheService, 'get').returns(null);

    const staticIssues = [
      {
        file: 'static.js',
        line: 10,
        issue: 'Static issue',
        severity: 'medium',
        suggestion: 'Static suggestion'
      }
    ];

    const llmIssues = [
      {
        file: 'llm.js',
        line: 20,
        issue: 'LLM issue',
        severity: 'high',
        suggestion: 'LLM suggestion'
      }
    ];

    // Mock analyzer results
    mockStaticAnalyzer.analyze.restore();
    mockLLMAnalyzer.analyze.restore();

    sandbox.stub(mockStaticAnalyzer, 'analyze').resolves(staticIssues);
    sandbox.stub(mockLLMAnalyzer, 'analyze').resolves(llmIssues);

    const issues = await memoryOptimizer.analyzeFile(mockUri);

    sinon.assert.calledOnce(mockCacheService.get);
    sinon.assert.calledOnce(mockStaticAnalyzer.analyze);
    sinon.assert.calledOnce(mockLLMAnalyzer.analyze);
    sinon.assert.calledOnce(mockCacheService.store);
    sinon.assert.calledOnce(mockDiagnosticCollector.collect);

    // Check that the issues are combined correctly
    assert.strictEqual(issues.length, 2);
    assert.deepStrictEqual(issues, [...staticIssues, ...llmIssues]);
  });

  test('Should show warning when no workspace folders on analyzeWorkspace', async () => {
    // Override the workspaceFolders stub to return null
    workspaceStub.value(undefined);

    await memoryOptimizer.analyzeWorkspace();

    sinon.assert.calledOnce(windowStub);
    sinon.assert.calledWith(windowStub, 'No workspace folder open');
  });

  test('Should find memory leaks in current file', async () => {
    const mockDocument = {
      uri: vscode.Uri.file('/test/file.js')
    };

    editorStub.value({
      document: mockDocument
    });

    const analyzeFileSpy = sandbox.spy(memoryOptimizer, 'analyzeFile');

    await memoryOptimizer.findMemoryLeaks();

    sinon.assert.calledOnce(analyzeFileSpy);
    sinon.assert.calledWith(analyzeFileSpy, mockDocument.uri);
  });

  test('Should show warning when no active editor on findMemoryLeaks', async () => {
    editorStub.value(undefined);

    await memoryOptimizer.findMemoryLeaks();

    sinon.assert.calledOnce(windowStub);
    sinon.assert.calledWith(windowStub, 'No active file to analyze');
  });

  test('Should handle workspace analysis with progress indicator', async () => {
    // Mock the withProgress function
    const withProgressStub = sandbox.stub(vscode.window, 'withProgress').resolves();

    // Mock the findFiles function
    const mockFiles = [
      vscode.Uri.file('/test/file1.js'),
      vscode.Uri.file('/test/file2.js')
    ];
    const findFilesStub = sandbox.stub(vscode.workspace, 'findFiles').resolves(mockFiles);

    // Mock the analyzeFile function
    const analyzeFileSpy = sandbox.stub(memoryOptimizer, 'analyzeFile');
    analyzeFileSpy.onCall(0).resolves([{ file: 'file1.js', line: 10, issue: 'Issue 1', severity: 'low', suggestion: 'Fix 1' }]);
    analyzeFileSpy.onCall(1).resolves([{ file: 'file2.js', line: 20, issue: 'Issue 2', severity: 'medium', suggestion: 'Fix 2' }]);

    await memoryOptimizer.analyzeWorkspace();

    sinon.assert.calledOnce(withProgressStub);
    assert.strictEqual(withProgressStub.args[0][0].title, 'Analyzing workspace memory usage');

    // Get the progress callback function
    const progressCallback = withProgressStub.args[0][1];

    // Create mock progress and token
    const mockProgress = {
      report: sandbox.stub()
    };
    const mockToken = {
      isCancellationRequested: false
    };

    // Call the progress callback
    await progressCallback(mockProgress, mockToken);

    sinon.assert.calledOnce(findFilesStub);
    sinon.assert.calledWith(findFilesStub, '**/*.{js,ts,jsx,tsx,py,java,c,cpp}', '**/node_modules/**');

    // Verify that analyzeFile was called for each file
    sinon.assert.calledTwice(analyzeFileSpy);
    sinon.assert.calledWith(analyzeFileSpy.firstCall, mockFiles[0]);
    sinon.assert.calledWith(analyzeFileSpy.secondCall, mockFiles[1]);

    // Verify that progress was reported
    sinon.assert.calledTwice(mockProgress.report);

    // Verify that the report generator was called with the combined issues
    sinon.assert.calledOnce(mockReportGenerator.generate);
    // The combined issues should be an array of 2 issues
    assert.strictEqual(mockReportGenerator.generate.args[0][0].length, 2);
  });

  test('Should respect cancellation token during workspace analysis', async () => {
    // Mock the withProgress function
    const withProgressStub = sandbox.stub(vscode.window, 'withProgress').resolves();

    // Mock the findFiles function
    const mockFiles = [
      vscode.Uri.file('/test/file1.js'),
      vscode.Uri.file('/test/file2.js')
    ];
    const findFilesStub = sandbox.stub(vscode.workspace, 'findFiles').resolves(mockFiles);

    // Mock the analyzeFile function
    const analyzeFileSpy = sandbox.stub(memoryOptimizer, 'analyzeFile');
    analyzeFileSpy.resolves([]);

    await memoryOptimizer.analyzeWorkspace();

    // Get the progress callback function
    const progressCallback = withProgressStub.args[0][1];

    // Create mock progress and token with cancellation
    const mockProgress = {
      report: sandbox.stub()
    };
    const mockToken = {
      isCancellationRequested: true // Set to true to simulate user cancellation
    };

    // Call the progress callback
    await progressCallback(mockProgress, mockToken);

    // Verify that analyzeFile was not called due to cancellation
    sinon.assert.notCalled(analyzeFileSpy);
  });
});
