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
exports.DependencyGraphViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const DependencyGraphService_1 = require("../services/dependencyGraph/DependencyGraphService");
const DependencyGraphRenderer_1 = require("./renderers/DependencyGraphRenderer");
const LoggerService_1 = require("../services/LoggerService");
/**
 * Provides interactive dependency graph visualization
 */
class DependencyGraphViewProvider {
    constructor(context) {
        this.disposables = [];
        this.graphService = new DependencyGraphService_1.DependencyGraphService();
        this.renderer = new DependencyGraphRenderer_1.DependencyGraphRenderer();
        this.logger = LoggerService_1.LoggerService.getInstance();
        this.registerEventHandlers(context);
    }
    /**
     * Creates and shows the dependency graph panel
     */
    async show(workspaceRoot) {
        try {
            const panel = this.createWebviewPanel();
            const dependencies = await this.graphService.analyzeDependencies(workspaceRoot);
            panel.webview.html = this.renderer.render(dependencies);
            this.setupMessageHandling(panel);
            this.disposables.push(panel);
        }
        catch (error) {
            this.handleError('Failed to show dependency graph', error);
        }
    }
    /**
     * Updates the graph when dependencies change
     */
    async update(panel, workspaceRoot) {
        try {
            const dependencies = await this.graphService.analyzeDependencies(workspaceRoot);
            panel.webview.html = this.renderer.render(dependencies);
        }
        catch (error) {
            this.handleError('Failed to update dependency graph', error);
        }
    }
    /**
     * Cleans up resources
     */
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        this.graphService.dispose();
    }
    createWebviewPanel() {
        return vscode.window.createWebviewPanel(DependencyGraphViewProvider.viewType, 'Dependency Graph', vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [this.getLocalResourceRoot()]
        });
    }
    setupMessageHandling(panel) {
        panel.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.command) {
                    case 'refresh':
                        await this.update(panel, message.workspaceRoot);
                        break;
                    case 'exportSvg':
                        await this.exportGraph(message.data);
                        break;
                    default:
                        this.logger.warn(`Unknown command: ${message.command}`);
                }
            }
            catch (error) {
                this.handleError(`Failed to handle message: ${message.command}`, error);
            }
        }, null, this.disposables);
    }
    registerEventHandlers(context) {
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(e => this.handleDocumentChange(e)), vscode.workspace.onDidChangeWorkspaceFolders(() => this.handleWorkspaceChange()));
    }
    async handleDocumentChange(e) {
        if (this.shouldUpdateOnChange(e.document)) {
            await this.notifyDependencyChange();
        }
    }
    async handleWorkspaceChange() {
        await this.notifyDependencyChange();
    }
    shouldUpdateOnChange(document) {
        const relevantFiles = ['.ts', '.js', '.json', '.yaml', '.yml'];
        return relevantFiles.some(ext => document.fileName.endsWith(ext));
    }
    async notifyDependencyChange() {
        try {
            await vscode.commands.executeCommand('dependencyGraph.refresh');
        }
        catch (error) {
            this.handleError('Failed to notify dependency change', error);
        }
    }
    async exportGraph(svgData) {
        try {
            const uri = await vscode.window.showSaveDialog({
                filters: { 'SVG files': ['svg'] }
            });
            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(svgData));
                vscode.window.showInformationMessage('Dependency graph exported successfully');
            }
        }
        catch (error) {
            this.handleError('Failed to export graph', error);
        }
    }
    getLocalResourceRoot() {
        return vscode.Uri.joinPath(vscode.Uri.file(__dirname), 'media');
    }
    handleError(message, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`DependencyGraphView: ${message}`, errorMessage);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
    }
}
exports.DependencyGraphViewProvider = DependencyGraphViewProvider;
DependencyGraphViewProvider.viewType = 'dependencyGraph.view';
//# sourceMappingURL=dependencyGraphView.js.map