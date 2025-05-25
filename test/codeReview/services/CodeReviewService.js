jest.mock('vscode', () => ({
  Uri: {
    joinPath: jest.fn((...args) => args.join('/')),
  },
  window: {
    createOutputChannel: jest.fn(() => ({
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  languages: {
    createDiagnosticCollection: jest.fn(() => ({
      clear: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      dispose: jest.fn(),
    })),
  },
  workspace: {},
}));

// Switch to importing the TypeScript source for compatibility
const { CodeReviewService } = require('../../../../src/codeReview/services/CodeReviewService.ts');

describe('CodeReviewService', () => {
  let service;
  let mockLogger;
  let mockContext;

  beforeEach(() => {
    mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    mockContext = { subscriptions: [] };
    service = new CodeReviewService(mockLogger, mockContext);
  });

  it('should instantiate with logger and context', () => {
    expect(service).toBeDefined();
    expect(service.logger).toBe(mockLogger);
    expect(service.pullRequestIntegration).toBeDefined();
    expect(service.reviewChecklist).toBeDefined();
  });

  it('should generate webview HTML', () => {
    const mockWebview = {
      asWebviewUri: jest.fn((uri) => uri),
    };
    const mockExtensionUri = { fsPath: '/mock/uri' };
    // generateHtml is called internally, so we can spy on it
    service.generateHtml = jest.fn(() => '<html></html>');
    const html = service.getWebviewHtml(mockWebview, mockExtensionUri);
    expect(service.generateHtml).toHaveBeenCalled();
    expect(typeof html).toBe('string');
  });

  it('should handle webview messages (no-op for base)', async () => {
    const result = await service.handleWebviewMessage({ type: 'unknown' });
    expect(result).toBeUndefined();
  });

  it('should handle refresh pull requests (no-op for base)', async () => {
    const result = await service.handleRefreshPullRequests();
    expect(result).toBeUndefined();
  });

  it('should generate a nonce', () => {
    const nonce = service.generateNonce();
    expect(typeof nonce).toBe('string');
    expect(nonce.length).toBeGreaterThan(0);
  });

  it('should call generateHtml with correct params', () => {
    const mockWebview = {};
    const scriptUri = 'script.js';
    const styleUri = 'style.css';
    service.generateNonce = jest.fn(() => 'abc123');
    // Should not throw
    service.generateHtml(mockWebview, scriptUri, styleUri);
    expect(service.generateNonce).toHaveBeenCalled();
  });
});
