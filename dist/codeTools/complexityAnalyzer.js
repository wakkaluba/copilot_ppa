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
exports.ComplexityAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const JavaScriptComplexityService_1 = require("./services/JavaScriptComplexityService");
const PythonComplexityService_1 = require("./services/PythonComplexityService");
const ComplexityReportService_1 = require("./services/ComplexityReportService");
/**
 * Analyzes code complexity using various tools
 */
class ComplexityAnalyzer {
    jsService;
    pyService;
    reportService;
    constructor() {
        this.jsService = new JavaScriptComplexityService_1.JavaScriptComplexityService();
        this.pyService = new PythonComplexityService_1.PythonComplexityService();
        this.reportService = new ComplexityReportService_1.ComplexityReportService();
    }
    /**
     * Analyze the complexity of the current file
     */
    async analyzeFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        const document = editor.document;
        const filePath = document.uri.fsPath;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
        if (!workspaceFolder) {
            vscode.window.showWarningMessage('File must be part of a workspace');
            return;
        }
        await document.save();
        const ext = path.extname(filePath);
        let reportData;
        if (/\.jsx?$|\.tsx?$/.test(ext)) {
            reportData = await this.jsService.analyze(filePath, workspaceFolder);
        }
        else if (/\.py$/.test(ext)) {
            reportData = await this.pyService.analyze(filePath, workspaceFolder);
        }
        else {
            vscode.window.showInformationMessage(`No complexity analyzer configured for ${ext} files`);
            return;
        }
        const html = this.reportService.renderReport(filePath, reportData);
        const panel = vscode.window.createWebviewPanel('complexityReport', `Complexity: ${path.basename(filePath)}`, vscode.ViewColumn.Beside, { enableScripts: true });
        panel.webview.html = html;
    }
    /**
     * Dispose resources
     */
    dispose() {
        this.reportService.dispose();
    }
}
exports.ComplexityAnalyzer = ComplexityAnalyzer;
//# sourceMappingURL=complexityAnalyzer.js.map