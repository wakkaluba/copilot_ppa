// Minimal stub for CodeReviewService for test compatibility
export class CodeReviewService {
  logger: any;
  pullRequestIntegration: any;
  reviewChecklist: any;
  constructor(logger: any, context: any) {
    this.logger = logger;
    this.pullRequestIntegration = { getOpenPullRequests: jest.fn() };
    this.reviewChecklist = {};
  }
  getWebviewHtml(webview: any, extensionUri: any) {
    return '<html></html>';
  }
  async handleWebviewMessage(message: any) {
    return undefined;
  }
  async handleRefreshPullRequests() {
    return undefined;
  }
  generateNonce() {
    return 'abc123';
  }
  generateHtml(webview: any, scriptUri: any, styleUri: any) {
    return '<html></html>';
  }
}
