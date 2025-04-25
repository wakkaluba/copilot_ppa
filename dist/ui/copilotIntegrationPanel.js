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
exports.CopilotIntegrationPanel = void 0;
const vscode = __importStar(require("vscode"));
const CopilotWebviewContentService_1 = require("./services/CopilotWebviewContentService");
const CopilotWebviewStateManager_1 = require("./services/CopilotWebviewStateManager");
const CopilotConnectionManager_1 = require("./services/CopilotConnectionManager");
const CopilotWebviewMessageHandler_1 = require("./services/CopilotWebviewMessageHandler");
const themeManager_1 = require("../services/ui/themeManager");
/**
 * Panel that provides a webview interface for Copilot and LLM interactions
 */
class CopilotIntegrationPanel {
    context;
    static instance;
    panel;
    contentService;
    stateManager;
    connectionManager;
    messageHandler;
    disposables = [];
    logger;
    constructor(context) {
        this.context = context;
        this.logger = logger_1.Logger.getInstance();
        this.contentService = new CopilotWebviewContentService_1.CopilotWebviewContentService(themeManager_1.ThemeService.getInstance());
        this.stateManager = new CopilotWebviewStateManager_1.CopilotWebviewStateManager();
        this.connectionManager = new CopilotConnectionManager_1.CopilotConnectionManager();
        this.messageHandler = new CopilotWebviewMessageHandler_1.CopilotWebviewMessageHandler(this.stateManager, this.connectionManager, this.logger);
        this.setupListeners();
    }
    static getInstance(context) {
        if (!CopilotIntegrationPanel.instance) {
            CopilotIntegrationPanel.instance = new CopilotIntegrationPanel(context);
        }
        return CopilotIntegrationPanel.instance;
    }
    setupListeners() {
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(() => this.updateWebviewContent()), this.stateManager.onStateChanged(() => this.updateWebviewContent()), this.connectionManager.onConnectionChanged(() => this.updateWebviewContent()));
    }
    async show() {
        try {
            if (this.panel) {
                this.panel.reveal();
                return;
            }
            this.panel = vscode.window.createWebviewPanel('copilotIntegration', 'AI Assistant', vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
            });
            await this.connectionManager.initialize();
            this.registerWebviewHandlers();
            this.updateWebviewContent();
            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this.dispose();
            });
        }
        catch (error) {
            this.logger.error('Error showing Copilot integration panel', error);
            throw this.connectionManager.wrapError('Failed to show integration panel', error);
        }
    }
    registerWebviewHandlers() {
        if (!this.panel) {
            return;
        }
        this.panel.webview.onDidReceiveMessage(async (message) => {
            try {
                const response = await this.messageHandler.handleMessage(message);
                if (response && this.panel) {
                    this.panel.webview.postMessage(response);
                }
            }
            catch (error) {
                this.logger.error('Error handling webview message', error);
                this.showErrorInWebview(error);
            }
        }, undefined, this.disposables);
    }
    updateWebviewContent() {
        if (!this.panel) {
            return;
        }
        try {
            const stylesUri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'copilot-integration.css'));
            this.panel.webview.html = this.contentService.generateWebviewContent(stylesUri, this.stateManager.getState(), this.connectionManager.isConnected(), this.panel.webview);
        }
        catch (error) {
            this.logger.error('Error updating webview content', error);
            this.showErrorInWebview(error);
        }
    }
    showErrorInWebview(error) {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'showError',
                text: `Error: ${this.connectionManager.getErrorMessage(error)}`
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
        this.stateManager.dispose();
        this.connectionManager.dispose();
        this.messageHandler.dispose();
        CopilotIntegrationPanel.instance = undefined;
    }
}
exports.CopilotIntegrationPanel = CopilotIntegrationPanel;
//# sourceMappingURL=copilotIntegrationPanel.js.map