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
const repositoryManagement_1 = require("../services/repositoryManagement");
const RepositoryPanelUIService_1 = require("./services/RepositoryPanelUIService");
const RepositoryPanelMessageService_1 = require("./services/RepositoryPanelMessageService");
const RepositoryPanelStateService_1 = require("./services/RepositoryPanelStateService");
class RepositoryPanel {
    panel;
    extensionUri;
    static viewType = 'copilotPPA.repositoryPanel';
    static currentPanel;
    uiService;
    messageService;
    stateService;
    logger;
    _disposables = [];
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One;
        if (RepositoryPanel.currentPanel) {
            RepositoryPanel.currentPanel.panel.reveal(column);
            return RepositoryPanel.currentPanel;
        }
        const panel = vscode.window.createWebviewPanel(RepositoryPanel.viewType, 'Repository Management', column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'media'),
                vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist')
            ]
        });
        RepositoryPanel.currentPanel = new RepositoryPanel(panel, extensionUri);
        return RepositoryPanel.currentPanel;
    }
    constructor(panel, extensionUri) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.logger = console;
        this.uiService = new RepositoryPanelUIService_1.RepositoryPanelUIService(panel);
        this.messageService = new RepositoryPanelMessageService_1.RepositoryPanelMessageService(panel.webview);
        this.stateService = new RepositoryPanelStateService_1.RepositoryPanelStateService();
        this.setupPanel();
        this.setupEventListeners();
        this.setupStateManagement();
    }
    setupPanel() {
        try {
            this.uiService.update(this.extensionUri);
        }
        catch (error) {
            this.handleError('Failed to setup panel', error);
        }
    }
    setupEventListeners() {
        this.panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this.panel.onDidChangeViewState(() => {
            if (this.panel.visible) {
                this.uiService.update(this.extensionUri);
            }
        }, null, this._disposables);
        this.messageService.onCreateRepository(async (provider, name, description, isPrivate) => {
            try {
                const repoUrl = await repositoryManagement_1.repositoryManager.createRepository(provider, name, description, isPrivate);
                if (repoUrl) {
                    this.stateService.setLastCreatedRepo(repoUrl);
                    this.stateService.setLastProvider(provider);
                    await this.messageService.postMessage({ command: 'repoCreated', url: repoUrl });
                    await vscode.window.showInformationMessage(`Repository created: ${repoUrl}`);
                }
            }
            catch (error) {
                this.handleError('Failed to create repository', error);
            }
        });
        this.messageService.onToggleAccess((enabled) => {
            try {
                repositoryManagement_1.repositoryManager.setEnabled(enabled);
                this.stateService.setAccessEnabled(enabled);
                vscode.window.showInformationMessage(`Repository access ${enabled ? 'enabled' : 'disabled'}`);
            }
            catch (error) {
                this.handleError('Failed to toggle repository access', error);
            }
        });
    }
    setupStateManagement() {
        this.stateService.onStateChanged((state) => {
            try {
                this.messageService.postMessage({
                    command: 'stateUpdated',
                    state
                });
            }
            catch (error) {
                this.handleError('Failed to update state', error);
            }
        });
    }
    handleError(context, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`${context}: ${errorMessage}`);
        this.stateService.setErrorMessage(errorMessage);
        vscode.window.showErrorMessage(`${context}: ${errorMessage}`);
    }
    dispose() {
        RepositoryPanel.currentPanel = undefined;
        this.uiService.dispose();
        this.messageService.dispose();
        this.panel.dispose();
        this._disposables.forEach(d => d.dispose());
    }
}
exports.RepositoryPanel = RepositoryPanel;
//# sourceMappingURL=repositoryPanel.js.map