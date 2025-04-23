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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeReviewService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const pullRequestIntegration_1 = require("../pullRequestIntegration");
const reviewChecklist_1 = require("../reviewChecklist");
let CodeReviewService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CodeReviewService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CodeReviewService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        pullRequestIntegration;
        reviewChecklist;
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
    return CodeReviewService = _classThis;
})();
exports.CodeReviewService = CodeReviewService;
//# sourceMappingURL=CodeReviewService.js.map