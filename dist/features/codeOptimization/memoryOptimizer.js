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
exports.MemoryOptimizer = void 0;
const vscode = __importStar(require("vscode"));
const StaticMemoryAnalyzer_1 = require("./memoryAnalyzer/StaticMemoryAnalyzer");
const LLMMemoryAnalyzer_1 = require("./memoryAnalyzer/LLMMemoryAnalyzer");
const MemoryCacheService_1 = require("./memoryAnalyzer/MemoryCacheService");
const MemoryDiagnosticCollector_1 = require("./memoryAnalyzer/MemoryDiagnosticCollector");
const MemoryReportGenerator_1 = require("./memoryAnalyzer/MemoryReportGenerator");
class MemoryOptimizer {
    staticAnalyzer;
    llmAnalyzer;
    cacheService;
    diagnosticCollector;
    reportGenerator;
    constructor(context, llmService) {
        this.staticAnalyzer = new StaticMemoryAnalyzer_1.StaticMemoryAnalyzer();
        this.llmAnalyzer = new LLMMemoryAnalyzer_1.LLMMemoryAnalyzer(llmService);
        this.cacheService = new MemoryCacheService_1.MemoryCacheService();
        this.diagnosticCollector = new MemoryDiagnosticCollector_1.MemoryDiagnosticCollector(context);
        this.reportGenerator = new MemoryReportGenerator_1.MemoryReportGenerator(context);
        context.subscriptions.push(vscode.commands.registerCommand('vscode-local-llm-agent.analyzeMemoryUsage', this.analyzeCurrentFile.bind(this)), vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspaceMemory', this.analyzeWorkspace.bind(this)), vscode.commands.registerCommand('vscode-local-llm-agent.findMemoryLeaks', this.findMemoryLeaks.bind(this)), this.diagnosticCollector);
    }
    dispose() {
        this.diagnosticCollector.dispose();
        this.cacheService.clear();
    }
    async analyzeCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return [];
        }
        const document = editor.document;
        return this.analyzeFile(document.uri);
    }
    async analyzeFile(fileUri) {
        const content = (await vscode.workspace.openTextDocument(fileUri)).getText();
        const cached = this.cacheService.get(content);
        let issues = cached || [];
        if (!cached) {
            const staticIssues = await this.staticAnalyzer.analyze(content);
            const llmIssues = await this.llmAnalyzer.analyze(content);
            issues = [...staticIssues, ...llmIssues];
            this.cacheService.store(content, issues);
        }
        this.diagnosticCollector.collect(fileUri, issues);
        return issues;
    }
    async analyzeWorkspace() {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }
        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing workspace memory usage',
            cancellable: true
        }, async (progress, token) => {
            const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,c,cpp}', '**/node_modules/**');
            let processedFiles = 0;
            const totalFiles = files.length;
            let allIssues = [];
            for (const file of files) {
                if (token.isCancellationRequested) {
                    break;
                }
                const issues = await this.analyzeFile(file);
                allIssues = [...allIssues, ...issues];
                processedFiles++;
                progress.report({
                    increment: (100 / totalFiles),
                    message: `Processed ${processedFiles} of ${totalFiles} files`
                });
            }
            this.reportGenerator.generate(allIssues);
        });
    }
    async findMemoryLeaks() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return;
        }
        const fileUri = editor.document.uri;
        const issues = await this.analyzeFile(fileUri);
    }
}
exports.MemoryOptimizer = MemoryOptimizer;
//# sourceMappingURL=memoryOptimizer.js.map