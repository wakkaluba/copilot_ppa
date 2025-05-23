import * as vscode from 'vscode';
import type { ILogger } from '../../logging/ILogger';
import { PullRequestIntegration } from '../pullRequestIntegration';
import { ReviewChecklist } from '../reviewChecklist';

export class CodeReviewService {
  public pullRequestIntegration: PullRequestIntegration;
  public reviewChecklist: ReviewChecklist;
  public logger: ILogger;

  constructor(logger: ILogger, context: vscode.ExtensionContext) {
    this.logger = logger;
    this.pullRequestIntegration = new PullRequestIntegration();
    this.reviewChecklist = new ReviewChecklist(context);
  }

  public getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'codeReview', 'codeReview.js'),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'codeReview', 'codeReview.css'),
    );
    return this.generateHtml(webview, scriptUri, styleUri);
  }

  public async handleWebviewMessage(message: any): Promise<any> {
    try {
      switch (message.command) {
        case 'refreshPullRequests':
          return await this.handleRefreshPullRequests();
        case 'createPullRequest':
          return await this.handleCreatePullRequest();
        case 'getChecklists':
          return this.handleGetChecklists();
        case 'startReview':
          return await this.handleStartReview(message.checklistName);
        case 'createChecklist':
          return await this.handleCreateChecklist();
        case 'submitReview':
          return await this.handleSubmitReview(
            message.reportId,
            message.results,
            message.summary,
            message.approved,
          );
        case 'getReportHistory':
          return this.handleGetReportHistory();
        case 'viewReport':
          return await this.handleViewReport(message.reportId);
        case 'exportReport':
          return await this.handleExportReport(message.reportId);
        default:
          this.logger &&
            this.logger.warn &&
            this.logger.warn(`Unknown command received: ${message.command}`);
          return null;
      }
    } catch (error) {
      this.logger &&
        this.logger.error &&
        this.logger.error('Error handling webview message:', error);
      throw error;
    }
  }

  public async handleRefreshPullRequests(): Promise<any> {
    try {
      const pullRequests = await this.pullRequestIntegration.getOpenPullRequests();
      return {
        command: 'pullRequestsRefreshed',
        pullRequests,
      };
    } catch (error) {
      this.logger &&
        this.logger.error &&
        this.logger.error('Failed to refresh pull requests:', error);
      throw error;
    }
  }

  public async handleCreatePullRequest(): Promise<any> {
    return undefined;
  }
  public handleGetChecklists(): any {
    return undefined;
  }
  public async handleStartReview(_name: string): Promise<any> {
    return undefined;
  }
  public async handleCreateChecklist(): Promise<any> {
    return undefined;
  }
  public async handleSubmitReview(
    _id: string,
    _results: any,
    _summary: string,
    _approved: boolean,
  ): Promise<any> {
    return undefined;
  }
  public handleGetReportHistory(): any {
    return undefined;
  }
  public async handleViewReport(_id: string): Promise<any> {
    return undefined;
  }
  public async handleExportReport(_id: string): Promise<any> {
    return undefined;
  }

  public generateHtml(
    webview: vscode.Webview,
    scriptUri: vscode.Uri,
    styleUri: vscode.Uri,
  ): string {
    const nonce = this.generateNonce();
    return `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Code Review</title>
            </head>
            <body>
                <div class="container">
                    <h1>Code Review Tools</h1>

                    <div class="section">
                        <h2>Pull Requests</h2>
                        <button id="refreshPRs">Refresh</button>
                        <div id="prList" class="list-container">
                            <p>No pull requests found.</p>
                        </div>
                        <button id="createPR">Create Pull Request</button>
                    </div>

                    <div class="section">
                        <h2>Review Checklists</h2>
                        <select id="checklistSelect">
                            <option value="">Select a checklist...</option>
                        </select>
                        <button id="startReview">Start Review</button>
                        <button id="createChecklist">Create Checklist</button>
                    </div>

                    <div class="section">
                        <h2>Recent Reviews</h2>
                        <div id="reportList" class="list-container">
                            <p>No recent reviews found.</p>
                        </div>
                    </div>

                    <div id="reviewForm" class="hidden">
                        <h2>Code Review Form</h2>
                        <div id="reviewItems"></div>
                        <div class="form-group">
                            <label for="summary">Summary</label>
                            <textarea id="summary" rows="4"></textarea>
                        </div>
                        <div class="form-controls">
                            <button id="submitReview">Submit Review</button>
                            <button id="cancelReview">Cancel</button>
                        </div>
                    </div>
                </div>

                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
        </html>`;
  }

  public generateNonce(): string {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    // fallback for Node/test
    return Math.random().toString(36).substring(2, 18);
  }
}
