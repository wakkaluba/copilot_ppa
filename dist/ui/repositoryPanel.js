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
exports.RepositoryPanel = void 0;
const vscode = __importStar(require("vscode"));
const RepositoryWebviewService_1 = require("./services/RepositoryWebviewService");
const themeManager_1 = require("../services/ui/themeManager");
const logger_1 = require("../utils/logger");
class RepositoryPanel {
    context;
    static instance;
    panel;
    webviewService;
    disposables = [];
    logger;
    constructor(context) {
        this.context = context;
        this.logger = logger_1.Logger.getInstance();
        this.webviewService = new RepositoryWebviewService_1.RepositoryWebviewService(themeManager_1.ThemeService.getInstance());
    }
    static getInstance(context) {
        if (!RepositoryPanel.instance) {
            RepositoryPanel.instance = new RepositoryPanel(context);
        }
        return RepositoryPanel.instance;
    }
    async show() {
        try {
            if (this.panel) {
                this.panel.reveal();
                return;
            }
            this.panel = vscode.window.createWebviewPanel('repositoryPanel', 'Repository', vscode.ViewColumn.Three, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
            });
            this.updateWebviewContent();
            this.registerMessageHandlers();
            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this.dispose();
            }, null, this.disposables);
        }
        catch (error) {
            this.logger.error('Error showing repository panel', error);
            throw error;
        }
    }
    updateWebviewContent() {
        if (!this.panel)
            return;
        try {
            this.panel.webview.html = this.webviewService.generateWebviewContent(this.panel.webview);
        }
        catch (error) {
            this.logger.error('Error updating repository panel content', error);
            this.showErrorInWebview('Failed to update panel content');
        }
    }
    registerMessageHandlers() {
        if (!this.panel)
            return;
        this.panel.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.command) {
                    case 'refreshRepository':
                        await this.refreshRepository();
                        break;
                    case 'showBranches':
                        await this.showBranches();
                        break;
                    case 'showCommits':
                        await this.showCommits();
                        break;
                    default:
                        this.logger.warn(`Unknown command received: ${message.command}`);
                }
            }
            catch (error) {
                this.logger.error('Error handling repository panel message', error);
                this.showErrorInWebview('Failed to process command');
            }
        }, undefined, this.disposables);
    }
    async refreshRepository() {
        // Implementation details
    }
    async showBranches() {
        // Implementation details
    }
    async showCommits() {
        // Implementation details
    }
    showErrorInWebview(message) {
        if (this.panel) {
            this.panel.webview.postMessage({
                type: 'showError',
                message
            });
        }
    }
    dispose() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        RepositoryPanel.instance = undefined;
    }
}
exports.RepositoryPanel = RepositoryPanel;
//# sourceMappingURL=repositoryPanel.js.map