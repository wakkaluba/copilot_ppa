const assert = require('assert');
const sinon = require('sinon');
const vscode = require('vscode');

// Mock dependencies
class MockSecurityPatternService {
  getPatterns() {
    return [
      {
        id: 'sql-injection',
        name: 'SQL Injection',
        severity: 'high',
        description: 'Possible SQL injection vulnerability',
        regex: /\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b.*\b(FROM|INTO|WHERE)\b.*\$\{/i,
        languages: ['javascript', 'typescript', 'python'],
        remediation: 'Use parameterized queries or an ORM'
      },
      {
        id: 'xss',
        name: 'Cross-site Scripting (XSS)',
        severity: 'high',
        description: 'Possible XSS vulnerability',
        regex: /\binnerHTML\b|\bdocument\.write\b|\beval\b/i,
        languages: ['javascript', 'typescript', 'html'],
        remediation: 'Use textContent instead of innerHTML or implement proper output encoding'
      }
    ];
  }
}

class MockSecurityAnalyzerService {
  constructor(patternService) {
    this.patternService = patternService;
  }

  async scanDocument(document) {
    const issues = [
      {
        id: 'issue-1',
        patternId: 'sql-injection',
        file: document.uri.fsPath,
        line: 10,
        column: 5,
        message: 'Possible SQL injection detected',
        severity: 'high',
        code: 'SELECT * FROM users WHERE id = ${userId}',
        remediation: 'Use parameterized queries'
      }
    ];

    const diagnostics = [
      new vscode.Diagnostic(
        new vscode.Range(9, 5, 9, 50),
        'Possible SQL injection detected',
        vscode.DiagnosticSeverity.Error
      )
    ];

    return { issues, diagnostics };
  }

  async scanWorkspace(progressCallback) {
    if (progressCallback) {
      progressCallback('Scanning files...');
    }

    const issues = [
      {
        id: 'issue-1',
        patternId: 'sql-injection',
        file: '/workspace/file1.js',
        line: 10,
        column: 5,
        message: 'Possible SQL injection detected',
        severity: 'high',
        code: 'SELECT * FROM users WHERE id = ${userId}',
        remediation: 'Use parameterized queries'
      },
      {
        id: 'issue-2',
        patternId: 'xss',
        file: '/workspace/file2.js',
        line: 25,
        column: 12,
        message: 'Possible XSS vulnerability detected',
        severity: 'high',
        code: 'element.innerHTML = userInput;',
        remediation: 'Use textContent instead or implement proper output encoding'
      }
    ];

    return {
      issues,
      scannedFiles: 35
    };
  }
}

class MockSecurityDiagnosticService {
  constructor(context) {
    this.context = context;
  }

  report(fileUri, diagnostics) {
    // Mock implementation
  }

  dispose() {
    // Mock implementation
  }
}

class MockSecurityFixService {
  constructor(context) {
    this.context = context;
  }

  async applyFix(issueId, filePath) {
    return true;
  }
}

describe('Code Security Scanner Tests', () => {
  let scanner;
  let extensionContext;
  let sandbox;
  let mockPatternService;
  let mockAnalyzerService;
  let mockDiagnosticService;
  let mockFixService;
  let windowStub;
  let openTextDocumentStub;
  let editorStub;
  let webviewPanelStub;
  let workspaceStub;

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
    windowStub = sandbox.stub(vscode.window, 'showErrorMessage');
    editorStub = sandbox.stub(vscode.window, 'activeTextEditor');
    webviewPanelStub = sandbox.stub(vscode.window, 'createWebviewPanel').returns({
      webview: {
        html: '',
        onDidReceiveMessage: () => ({ dispose: () => {} }),
        postMessage: sandbox.stub()
      },
      onDidDispose: () => ({ dispose: () => {} }),
      reveal: sandbox.stub(),
      dispose: sandbox.stub()
    });

    openTextDocumentStub = sandbox.stub(vscode.workspace, 'openTextDocument').resolves({
      uri: vscode.Uri.file('/mock/file.js'),
      getText: () => 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
      languageId: 'javascript',
      version: 1,
      isDirty: false,
      isClosed: false,
      lineCount: 20,
      lineAt: () => ({ text: '', range: new vscode.Range(0, 0, 0, 0), rangeIncludingLineBreak: new vscode.Range(0, 0, 0, 0), firstNonWhitespaceCharacterIndex: 0, isEmptyOrWhitespace: false })
    });

    workspaceStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([{
      uri: {
        fsPath: '/mock/workspace'
      },
      name: 'mock',
      index: 0
    }]);

    // Create dependency mocks
    mockPatternService = new MockSecurityPatternService();
    mockAnalyzerService = new MockSecurityAnalyzerService(mockPatternService);
    mockDiagnosticService = new MockSecurityDiagnosticService(extensionContext);
    mockFixService = new MockSecurityFixService(extensionContext);

    // Create spies
    sandbox.spy(mockPatternService, 'getPatterns');
    sandbox.spy(mockAnalyzerService, 'scanDocument');
    sandbox.spy(mockAnalyzerService, 'scanWorkspace');
    sandbox.spy(mockDiagnosticService, 'report');
    sandbox.spy(mockDiagnosticService, 'dispose');
    sandbox.spy(mockFixService, 'applyFix');

    // Override the constructor to use our mocks
    const originalScanner = require('../../../src/security/codeScanner').CodeSecurityScanner;
    const CodeSecurityScannerProxy = function(context) {
      const instance = new originalScanner(context);
      // Replace the dependencies with our mocks
      instance.patternService = mockPatternService;
      instance.analyzerService = mockAnalyzerService;
      instance.diagnosticService = mockDiagnosticService;
      instance.fixService = mockFixService;
      return instance;
    };
    CodeSecurityScannerProxy.prototype = originalScanner.prototype;

    // Create scanner instance
    scanner = new CodeSecurityScannerProxy(extensionContext);
  });

  afterEach(() => {
    sandbox.restore();
  });

  test('Should scan active file when available', async () => {
    const mockDocument = {
      uri: vscode.Uri.file('/mock/file.js')
    };

    editorStub.value({
      document: mockDocument
    });

    const scanFileSpy = sandbox.spy(scanner, 'scanFile');

    const result = await scanner.scanActiveFile();

    sinon.assert.calledOnce(scanFileSpy);
    sinon.assert.calledWith(scanFileSpy, mockDocument.uri);
    assert.strictEqual(result.scannedFiles, 1);
    assert.strictEqual(result.issues.length, 1);
  });

  test('Should return empty result when no active editor for scanActiveFile', async () => {
    editorStub.value(undefined);

    const result = await scanner.scanActiveFile();

    assert.strictEqual(result.issues.length, 0);
    assert.strictEqual(result.scannedFiles, 0);
  });

  test('Should scan individual file successfully', async () => {
    const fileUri = vscode.Uri.file('/mock/file.js');

    const result = await scanner.scanFile(fileUri);

    sinon.assert.calledOnce(openTextDocumentStub);
    sinon.assert.calledWith(openTextDocumentStub, fileUri);

    sinon.assert.calledOnce(mockAnalyzerService.scanDocument);
    sinon.assert.calledOnce(mockDiagnosticService.report);

    assert.strictEqual(result.issues.length, 1);
    assert.strictEqual(result.scannedFiles, 1);

    // Verify issue caching
    const cachedIssue = await scanner.getIssueDetails('issue-1');
    assert.strictEqual(cachedIssue.patternId, 'sql-injection');
  });

  test('Should scan workspace successfully', async () => {
    const progressCallbackSpy = sandbox.spy();

    const result = await scanner.scanWorkspace(progressCallbackSpy);

    sinon.assert.calledOnce(mockAnalyzerService.scanWorkspace);
    sinon.assert.calledWith(mockAnalyzerService.scanWorkspace, progressCallbackSpy);

    assert.strictEqual(result.issues.length, 2);
    assert.strictEqual(result.scannedFiles, 35);

    // Verify the progress callback was called
    sinon.assert.calledWith(progressCallbackSpy, 'Scanning files...');

    // Verify issue caching
    const cachedIssue1 = await scanner.getIssueDetails('issue-1');
    const cachedIssue2 = await scanner.getIssueDetails('issue-2');
    assert.strictEqual(cachedIssue1.patternId, 'sql-injection');
    assert.strictEqual(cachedIssue2.patternId, 'xss');
  });

  test('Should return undefined for non-existent issue details', async () => {
    const result = await scanner.getIssueDetails('non-existent-id');
    assert.strictEqual(result, undefined);
  });

  test('Should show security report with correct HTML', async () => {
    const mockResult = {
      issues: [
        {
          id: 'issue-1',
          patternId: 'sql-injection',
          file: '/workspace/file1.js',
          line: 10,
          column: 5,
          message: 'Possible SQL injection detected',
          severity: 'high',
          code: 'SELECT * FROM users WHERE id = ${userId}',
          remediation: 'Use parameterized queries'
        }
      ],
      scannedFiles: 1
    };

    // Mock the SecurityReportHtmlProvider
    const SecurityReportHtmlProvider = require('../../../src/providers/SecurityReportHtmlProvider') ||
                                      require('../../../src/security/providers/SecurityReportHtmlProvider');
    const getHtmlStub = sandbox.stub(SecurityReportHtmlProvider, 'getHtml').returns('<html>Mock HTML</html>');

    await scanner.showSecurityReport(mockResult);

    sinon.assert.calledOnce(webviewPanelStub);
    sinon.assert.calledOnce(getHtmlStub);
    sinon.assert.calledWith(getHtmlStub, mockResult);
  });

  test('Should register and handle webview messages', async () => {
    const mockWebview = {
      onDidReceiveMessage: sandbox.stub().returns({
        dispose: sandbox.stub()
      }),
      postMessage: sandbox.stub().resolves(true)
    };

    scanner.registerWebview('test-webview', mockWebview);

    // Get the message handler callback
    const messageHandler = mockWebview.onDidReceiveMessage.args[0][0];

    // Test message handling - open file
    const showTextDocumentStub = sandbox.stub(vscode.window, 'showTextDocument').resolves();

    // Simulate receiving a message
    await messageHandler({
      command: 'openFile',
      path: '/mock/file.js'
    });

    // Let the message queue process
    await new Promise(resolve => setTimeout(resolve, 0));

    sinon.assert.calledOnce(openTextDocumentStub);
    sinon.assert.calledOnce(showTextDocumentStub);

    // Test message handling - fix issue
    await messageHandler({
      command: 'fixIssue',
      issueId: 'issue-1',
      path: '/mock/file.js'
    });

    // Let the message queue process
    await new Promise(resolve => setTimeout(resolve, 0));

    sinon.assert.calledOnce(mockFixService.applyFix);
    sinon.assert.calledWith(mockFixService.applyFix, 'issue-1', '/mock/file.js');
  });

  test('Should properly unregister webview', async () => {
    const mockWebview = {
      onDidReceiveMessage: sandbox.stub().returns({
        dispose: sandbox.stub()
      }),
      postMessage: sandbox.stub().resolves(true)
    };

    scanner.registerWebview('test-webview', mockWebview);

    // Verify it was registered
    assert.ok(scanner.webviewMap.has('test-webview'));

    scanner.unregisterWebview('test-webview');

    // Verify it was unregistered
    assert.strictEqual(scanner.webviewMap.has('test-webview'), false);
  });

  test('Should handle error in webview message processing', async () => {
    const mockWebview = {
      onDidReceiveMessage: sandbox.stub().returns({
        dispose: sandbox.stub()
      }),
      postMessage: sandbox.stub().resolves(true)
    };

    scanner.registerWebview('test-webview', mockWebview);

    // Get the message handler callback
    const messageHandler = mockWebview.onDidReceiveMessage.args[0][0];

    // Create an error condition
    openTextDocumentStub.rejects(new Error('Test error'));

    const consoleErrorStub = sandbox.stub(console, 'error');

    // Simulate receiving a message that will cause an error
    await messageHandler({
      command: 'openFile',
      path: '/mock/file.js'
    });

    // Let the message queue process
    await new Promise(resolve => setTimeout(resolve, 0));

    sinon.assert.called(consoleErrorStub);
    sinon.assert.called(windowStub);
    sinon.assert.calledWithMatch(windowStub, 'Error: Test error');
  });

  test('Should properly dispose of all resources', async () => {
    // Add a webview to be disposed
    const mockWebview = {
      onDidReceiveMessage: sandbox.stub().returns({
        dispose: sandbox.stub()
      }),
      postMessage: sandbox.stub().resolves(true)
    };

    scanner.registerWebview('test-webview', mockWebview);

    // Add some pending messages
    scanner.messageQueue.push(async () => {});

    // Create disposable spy
    const disposableSpy = sandbox.spy(scanner.disposables[0], 'dispose');

    scanner.dispose();

    sinon.assert.calledOnce(mockDiagnosticService.dispose);
    sinon.assert.calledOnce(disposableSpy);

    // Verify internal state cleanup
    assert.strictEqual(scanner.webviewMap.size, 0);
    assert.strictEqual(scanner.messageQueue.length, 0);
    assert.strictEqual(scanner.disposables.length, 0);
    assert.strictEqual(scanner.issueCache.size, 0);
  });

  test('Should properly process message queue in order', async () => {
    // Set up the message queue with multiple items
    const handler1 = sandbox.stub().resolves();
    const handler2 = sandbox.stub().resolves();
    const handler3 = sandbox.stub().resolves();

    scanner.messageQueue = [handler1, handler2, handler3];

    // Process the queue
    await scanner.processMessageQueue();

    // Verify all handlers were called in order
    sinon.assert.callOrder(handler1, handler2, handler3);

    // Queue should be empty now
    assert.strictEqual(scanner.messageQueue.length, 0);

    // isProcessing flag should be reset
    assert.strictEqual(scanner.isProcessing, false);
  });

  test('Should handle error in message queue processing', async () => {
    // Set up the message queue with an item that throws
    const errorHandler = sandbox.stub().rejects(new Error('Queue processing error'));
    const successHandler = sandbox.stub().resolves();

    scanner.messageQueue = [errorHandler, successHandler];

    const consoleErrorStub = sandbox.stub(console, 'error');

    // Process the queue
    await scanner.processMessageQueue();

    // Verify error was logged
    sinon.assert.called(consoleErrorStub);

    // Verify second handler was still called
    sinon.assert.called(successHandler);

    // Queue should be empty now
    assert.strictEqual(scanner.messageQueue.length, 0);

    // isProcessing flag should be reset
    assert.strictEqual(scanner.isProcessing, false);
  });

  test('Should not start processing queue if already processing', async () => {
    // Set processing flag
    scanner.isProcessing = true;

    // Try to process queue
    await scanner.processMessageQueue();

    // Verify it returned early
    assert.strictEqual(scanner.isProcessing, true);
  });
});
