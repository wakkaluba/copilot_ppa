"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeReviewService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const ILogger_1 = require("../../logging/ILogger");
const pullRequestIntegration_1 = require("../pullRequestIntegration");
const reviewChecklist_1 = require("../reviewChecklist");
let CodeReviewService = class CodeReviewService {
    constructor(logger, context) {
        this.logger = logger;
        this.pullRequestIntegration = new pullRequestIntegration_1.PullRequestIntegration();
        this.reviewChecklist = new reviewChecklist_1.ReviewChecklist(context);
    }
    getWebviewHtml(webview, extensionUri) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'codeReview', 'codeReview.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'codeReview', 'codeReview.css'));
        return this.generateHtml(webview, scriptUri, styleUri);
    }
    async handleWebviewMessage(message) {
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
                    return await this.handleSubmitReview(message.reportId, message.results, message.summary, message.approved);
                case 'getReportHistory':
                    return this.handleGetReportHistory();
                case 'viewReport':
                    return await this.handleViewReport(message.reportId);
                case 'exportReport':
                    return await this.handleExportReport(message.reportId);
                default:
                    this.logger.warn(`Unknown command received: ${message.command}`);
                    return null;
            }
        }
        catch (error) {
            this.logger.error('Error handling webview message:', error);
            throw error;
        }
    }
    async handleRefreshPullRequests() {
        try {
            const pullRequests = await this.pullRequestIntegration.getOpenPullRequests();
            return {
                command: 'pullRequestsRefreshed',
                pullRequests
            };
        }
        catch (error) {
            this.logger.error('Failed to refresh pull requests:', error);
            throw error;
        }
    }
    // ... rest of handler methods ...
    generateHtml(webview, scriptUri, styleUri) {
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
    generateNonce() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
};
CodeReviewService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, inject(ILogger_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, Object])
], CodeReviewService);
exports.CodeReviewService = CodeReviewService;
//# sourceMappingURL=CodeReviewService.js.map