import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeReviewWebviewProvider } from '../../../src/codeReview/codeReviewWebviewProvider';
import { CodeReviewService } from '../../../src/codeReview/services/CodeReviewService';
import { ILogger } from '../../../src/logging/ILogger';

describe('CodeReviewWebviewProvider - TypeScript', () => {
  let provider: CodeReviewWebviewProvider;
  let sandbox: sinon.SinonSandbox;
  let mockLogger: ILogger;
  let mockContext: vscode.ExtensionContext;
  let mockService: CodeReviewService;
  let mockWebviewView: vscode.WebviewView;
  let mockWebview: vscode.Webview;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create mock objects
    mockLogger = {
      info: sandbox.stub(),
      error: sandbox.stub(),
      debug: sandbox.stub(),
      warn: sandbox.stub()
    } as unknown as ILogger;

    mockService = {
      getReviewChecklist: sandbox.stub().resolves({ items: [] }),
      generateReport: sandbox.stub().resolves({ id: 'test-report', status: 'success', items: [] }),
      updateReport: sandbox.stub().resolves(true),
      performCodeReview: sandbox.stub().resolves({ success: true })
    } as unknown as CodeReviewService;

    mockWebview = {
      html: '',
      onDidReceiveMessage: sandbox.stub().returns({ dispose: sandbox.stub() }),
      postMessage: sandbox.stub().resolves(true),
      options: {
        enableScripts: false,
        localResourceRoots: []
      }
    } as unknown as vscode.Webview;

    mockWebviewView = {
      webview: mockWebview,
      title: 'Code Review'
    } as unknown as vscode.WebviewView;

    mockContext = {
      extensionUri: vscode.Uri.parse('file:///extension/path'),
      subscriptions: [],
      workspaceState: {
        get: sandbox.stub(),
        update: sandbox.stub().resolves()
      }
    } as unknown as vscode.ExtensionContext;

    // Initialize the provider
    provider = new CodeReviewWebviewProvider(
      mockLogger,
      mockContext.extensionUri,
      mockContext,
      mockService
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('resolveWebviewView', () => {
    it('should initialize the webview properly', async () => {
      await provider.resolveWebviewView(mockWebviewView, { webviewView: mockWebviewView } as vscode.WebviewViewResolveContext, null as unknown as vscode.CancellationToken);

      // Verify webview options were set correctly
      expect(mockWebviewView.webview.options.enableScripts).to.be.true;
      expect(mockWebviewView.webview.options.localResourceRoots).to.be.an('array');

      // Check that HTML content was set
      expect(mockWebviewView.webview.html).to.be.a('string');
      expect(mockWebviewView.webview.html.length).to.be.greaterThan(0);

      // Verify message listener was registered
      expect(mockWebviewView.webview.onDidReceiveMessage.calledOnce).to.be.true;
    });

    it('should handle errors during initialization', async () => {
      (mockWebviewView.webview.onDidReceiveMessage as sinon.SinonStub).throws(new Error('Failed to register listener'));

      await provider.resolveWebviewView(mockWebviewView, { webviewView: mockWebviewView } as vscode.WebviewViewResolveContext, null as unknown as vscode.CancellationToken);

      expect(mockLogger.error.calledOnce).to.be.true;
    });
  });

  describe('_setWebviewMessageListener', () => {
    it('should register a message handler for the webview', () => {
      provider['_setWebviewMessageListener'](mockWebview);

      expect(mockWebview.onDidReceiveMessage.calledOnce).to.be.true;
    });

    it('should handle "getChecklist" messages', async () => {
      // Set up message handler
      provider['_setWebviewMessageListener'](mockWebview);

      // Extract message handler function
      const messageHandler = (mockWebview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

      // Call the handler with a getChecklist message
      await messageHandler({ command: 'getChecklist' });

      // Verify service call
      expect(mockService.getReviewChecklist.calledOnce).to.be.true;

      // Verify response was sent back
      expect(mockWebview.postMessage.calledOnce).to.be.true;
      const response = (mockWebview.postMessage as sinon.SinonStub).firstCall.args[0];
      expect(response).to.have.property('command', 'checklist');
    });

    it('should handle "generateReport" messages', async () => {
      // Set up message handler
      provider['_setWebviewMessageListener'](mockWebview);

      // Extract message handler function
      const messageHandler = (mockWebview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

      // Call the handler with a generateReport message
      await messageHandler({
        command: 'generateReport',
        filepath: '/path/to/file.ts',
        reviewType: 'standard'
      });

      // Verify service call
      expect(mockService.generateReport.calledOnce).to.be.true;

      // Verify response was sent back
      expect(mockWebview.postMessage.calledOnce).to.be.true;
      const response = (mockWebview.postMessage as sinon.SinonStub).firstCall.args[0];
      expect(response).to.have.property('command', 'report');
    });

    it('should handle "updateReport" messages', async () => {
      // Set up message handler
      provider['_setWebviewMessageListener'](mockWebview);

      // Extract message handler function
      const messageHandler = (mockWebview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

      // Call the handler with an updateReport message
      await messageHandler({
        command: 'updateReport',
        reportId: 'test-report',
        results: [{ itemId: 'item1', passed: true }]
      });

      // Verify service call
      expect(mockService.updateReport.calledOnce).to.be.true;

      // Verify response was sent back
      expect(mockWebview.postMessage.calledOnce).to.be.true;
      const response = (mockWebview.postMessage as sinon.SinonStub).firstCall.args[0];
      expect(response).to.have.property('command', 'updateSuccess');
    });

    it('should handle "reviewCode" messages', async () => {
      // Set up message handler
      provider['_setWebviewMessageListener'](mockWebview);

      // Extract message handler function
      const messageHandler = (mockWebview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

      // Call the handler with a reviewCode message
      await messageHandler({
        command: 'reviewCode',
        filepath: '/path/to/file.ts'
      });

      // Verify service call
      expect(mockService.performCodeReview.calledOnce).to.be.true;

      // Verify response was sent back
      expect(mockWebview.postMessage.calledOnce).to.be.true;
      const response = (mockWebview.postMessage as sinon.SinonStub).firstCall.args[0];
      expect(response).to.have.property('command', 'reviewResult');
    });

    it('should handle errors during message processing', async () => {
      // Set up message handler
      provider['_setWebviewMessageListener'](mockWebview);

      // Extract message handler function
      const messageHandler = (mockWebview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

      // Set up the service to throw an error
      (mockService.getReviewChecklist as sinon.SinonStub).rejects(new Error('Service error'));

      // Call the handler with a getChecklist message
      await messageHandler({ command: 'getChecklist' });

      // Verify error was logged
      expect(mockLogger.error.calledOnce).to.be.true;

      // Verify error response was sent
      expect(mockWebview.postMessage.calledOnce).to.be.true;
      const response = (mockWebview.postMessage as sinon.SinonStub).firstCall.args[0];
      expect(response).to.have.property('command', 'error');
    });

    it('should ignore unknown command messages', async () => {
      // Set up message handler
      provider['_setWebviewMessageListener'](mockWebview);

      // Extract message handler function
      const messageHandler = (mockWebview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

      // Call the handler with an unknown command
      await messageHandler({ command: 'unknownCommand' });

      // Verify service was not called
      expect(mockService.getReviewChecklist.called).to.be.false;
      expect(mockService.generateReport.called).to.be.false;
      expect(mockService.updateReport.called).to.be.false;
      expect(mockService.performCodeReview.called).to.be.false;

      // Verify no response was sent
      expect(mockWebview.postMessage.called).to.be.false;
    });
  });

  describe('static properties', () => {
    it('should have a viewType property', () => {
      expect(CodeReviewWebviewProvider.viewType).to.equal('codeReviewPanel');
    });
  });
});
