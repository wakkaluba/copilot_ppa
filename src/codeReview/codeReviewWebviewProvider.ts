import * as vscode from 'vscode';
import { PullRequestIntegration } from './pullRequestIntegration';
import { ReviewChecklist } from './reviewChecklist';

/**
 * Webview provider for the code review UI
 */
export class CodeReviewWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codeReviewPanel';
    
    private _view?: vscode.WebviewView;
    private _pullRequestIntegration: PullRequestIntegration;
    private _reviewChecklist: ReviewChecklist;
    
    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) {
        this._pullRequestIntegration = new PullRequestIntegration();
        this._reviewChecklist = new ReviewChecklist(_context);
    }
    
    /**
     * Resolves the webview view
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        
        // Set up message handling
        this._setWebviewMessageListener(webviewView.webview);
    }
    
    /**
     * Creates the HTML for the webview
     */
    private _getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'codeReview', 'codeReview.js')
        );
        
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'codeReview', 'codeReview.css')
        );
        
        const nonce = this._getNonce();
        
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
    
    /**
     * Sets up webview message listener
     */
    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'refreshPullRequests':
                    await this._refreshPullRequests();
                    break;
                case 'createPullRequest':
                    await this._createPullRequest();
                    break;
                case 'getChecklists':
                    this._getChecklists();
                    break;
                case 'startReview':
                    await this._startReview(message.checklistName);
                    break;
                case 'createChecklist':
                    await this._createChecklist();
                    break;
                case 'submitReview':
                    await this._submitReview(message.reportId, message.results, message.summary, message.approved);
                    break;
                case 'getReportHistory':
                    this._getReportHistory();
                    break;
                case 'viewReport':
                    await this._viewReport(message.reportId);
                    break;
                case 'exportReport':
                    await this._exportReport(message.reportId);
                    break;
            }
        });
    }
    
    /**
     * Refreshes the list of pull requests
     */
    private async _refreshPullRequests() {
        try {
            const pullRequests = await this._pullRequestIntegration.getOpenPullRequests();
            this._view?.webview.postMessage({
                command: 'pullRequestsRefreshed',
                pullRequests
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load pull requests: ${error}`);
        }
    }
    
    /**
     * Opens a dialog to create a new pull request
     */
    private async _createPullRequest() {
        const title = await vscode.window.showInputBox({
            prompt: 'Enter pull request title',
            placeHolder: 'PR Title'
        });
        
        if (!title) {
            return;
        }
        
        const description = await vscode.window.showInputBox({
            prompt: 'Enter pull request description',
            placeHolder: 'PR Description'
        });
        
        const sourceBranch = await vscode.window.showInputBox({
            prompt: 'Enter source branch',
            placeHolder: 'feature/my-branch'
        });
        
        if (!sourceBranch) {
            return;
        }
        
        const targetBranch = await vscode.window.showInputBox({
            prompt: 'Enter target branch',
            placeHolder: 'main',
            value: 'main'
        });
        
        if (!targetBranch) {
            return;
        }
        
        try {
            const result = await this._pullRequestIntegration.createPullRequest(
                title!,
                description || '',
                sourceBranch,
                targetBranch
            );
            
            vscode.window.showInformationMessage(`Pull request created successfully: ${result.url}`);
            await this._refreshPullRequests();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create pull request: ${error}`);
        }
    }
    
    /**
     * Gets available review checklists
     */
    private _getChecklists() {
        const checklists = this._reviewChecklist.getAvailableChecklists();
        this._view?.webview.postMessage({
            command: 'checklistsRefreshed',
            checklists
        });
    }
    
    /**
     * Starts a new code review
     */
    private async _startReview(checklistName: string) {
        if (!checklistName) {
            vscode.window.showErrorMessage('Please select a checklist template');
            return;
        }
        
        // Get files to review
        const files = await vscode.window.showOpenDialog({
            canSelectMany: true,
            openLabel: 'Select Files to Review'
        });
        
        if (!files || files.length === 0) {
            return;
        }
        
        const filePaths = files.map(file => file.fsPath);
        
        // Generate a new report
        const userId = this._context.globalState.get<string>('userId') || 'anonymous';
        const report = this._reviewChecklist.generateReport(checklistName, filePaths, userId);
        
        // Send report to webview
        this._view?.webview.postMessage({
            command: 'reviewStarted',
            report
        });
    }
    
    /**
     * Creates a new checklist template
     */
    private async _createChecklist() {
        const checklistName = await vscode.window.showInputBox({
            prompt: 'Enter checklist name',
            placeHolder: 'e.g., Security Review'
        });
        
        if (!checklistName) {
            return;
        }
        
        // Create a basic template for the user to edit
        const items = [
            { id: `${checklistName.toLowerCase()}-1`, category: 'General', description: 'Item 1', mandatory: true },
            { id: `${checklistName.toLowerCase()}-2`, category: 'General', description: 'Item 2', mandatory: false }
        ];
        
        this._reviewChecklist.createChecklist(checklistName, items);
        
        vscode.window.showInformationMessage(`Checklist "${checklistName}" created. You can now edit it in the extension's checklist directory.`);
        
        this._getChecklists();
    }
    
    /**
     * Submits a completed review
     */
    private async _submitReview(reportId: string, results: any[], summary: string, approved: boolean) {
        try {
            this._reviewChecklist.updateReport(reportId, results, summary, approved);
            
            vscode.window.showInformationMessage('Review submitted successfully');
            
            // Refresh the report history
            this._getReportHistory();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to submit review: ${error}`);
        }
    }
    
    /**
     * Gets the review report history
     */
    private _getReportHistory() {
        const reports = this._reviewChecklist.getReportHistory();
        this._view?.webview.postMessage({
            command: 'reportHistoryRefreshed',
            reports
        });
    }
    
    /**
     * Views a specific report
     */
    private async _viewReport(reportId: string) {
        try {
            const html = this._reviewChecklist.exportReportToHtml(reportId);
            
            // Create a new webview panel to display the report
            const panel = vscode.window.createWebviewPanel(
                'codeReviewReport',
                `Code Review Report ${reportId}`,
                vscode.ViewColumn.One,
                {
                    enableScripts: false
                }
            );
            
            panel.webview.html = html;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to view report: ${error}`);
        }
    }
    
    /**
     * Exports a report to HTML and saves it
     */
    private async _exportReport(reportId: string) {
        try {
            const html = this._reviewChecklist.exportReportToHtml(reportId);
            
            // Ask user where to save the file
            const saveLocation = await vscode.window.showSaveDialog({
                filters: {
                    'HTML Files': ['html'],
                    'All Files': ['*']
                },
                defaultUri: vscode.Uri.file(`code-review-report-${reportId}.html`)
            });
            
            if (saveLocation) {
                // Write the HTML to the file
                await vscode.workspace.fs.writeFile(saveLocation, Buffer.from(html, 'utf8'));
                vscode.window.showInformationMessage(`Report exported to ${saveLocation.fsPath}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export report: ${error}`);
        }
    }
    
    /**
     * Generates a nonce for script execution
     */
    private _getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
