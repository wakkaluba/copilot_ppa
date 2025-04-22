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
exports.VisualizationCommandService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class VisualizationCommandService {
    context;
    errorHandler;
    constructor(context, errorHandler) {
        this.context = context;
        this.errorHandler = errorHandler;
    }
    async showMetrics() {
        try {
            const panel = await this.createWebviewPanel('metrics', 'PPA Metrics Dashboard');
            panel.webview.html = await this.getMetricsDashboardHtml();
            await vscode.window.showInformationMessage('Metrics dashboard opened');
        }
        catch (error) {
            this.errorHandler.handle('Failed to show metrics', error);
        }
    }
    async showMemoryVisualization() {
        try {
            const panel = await this.createWebviewPanel('memoryVisualization', 'Memory Usage Visualization');
            const templatePath = path.join(this.context.extensionPath, 'src', 'webview', 'templates', 'memoryVisualization.html');
            const template = await vscode.workspace.fs.readFile(vscode.Uri.file(templatePath));
            panel.webview.html = template.toString();
        }
        catch (error) {
            this.errorHandler.handle('Failed to show memory visualization', error);
        }
    }
    async showPerformanceMetrics() {
        try {
            const panel = await this.createWebviewPanel('performanceMetrics', 'Performance Metrics');
            panel.webview.html = await this.getPerformanceMetricsHtml();
            await vscode.window.showInformationMessage('Performance metrics opened');
        }
        catch (error) {
            this.errorHandler.handle('Failed to show performance metrics', error);
        }
    }
    async exportMetrics() {
        try {
            // TODO: Implement metrics export functionality
            const exportPath = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('metrics_export.json'),
                filters: {
                    'JSON files': ['json'],
                    'All files': ['*']
                }
            });
            if (exportPath) {
                // TODO: Collect and export metrics
                await vscode.window.showInformationMessage('Metrics exported successfully');
            }
        }
        catch (error) {
            this.errorHandler.handle('Failed to export metrics', error);
        }
    }
    async createWebviewPanel(viewType, title) {
        return vscode.window.createWebviewPanel(viewType, title, vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, 'media')),
                vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'webview', 'templates'))
            ]
        });
    }
    async getMetricsDashboardHtml() {
        const templatePath = path.join(this.context.extensionPath, 'src', 'webview', 'templates', 'metricsDashboard.html');
        const template = await vscode.workspace.fs.readFile(vscode.Uri.file(templatePath));
        return template.toString();
    }
    async getPerformanceMetricsHtml() {
        const templatePath = path.join(this.context.extensionPath, 'src', 'webview', 'templates', 'performanceMetrics.html');
        const template = await vscode.workspace.fs.readFile(vscode.Uri.file(templatePath));
        return template.toString();
    }
}
exports.VisualizationCommandService = VisualizationCommandService;
//# sourceMappingURL=VisualizationCommandService.js.map