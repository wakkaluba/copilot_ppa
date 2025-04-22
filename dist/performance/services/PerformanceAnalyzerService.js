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
exports.PerformanceAnalyzerService = void 0;
const vscode = __importStar(require("vscode"));
const analyzerFactory_1 = require("../analyzers/analyzerFactory");
class PerformanceAnalyzerService {
    configService;
    analyzerFactory;
    constructor(configService) {
        this.configService = configService;
        this.analyzerFactory = analyzerFactory_1.AnalyzerFactory.getInstance();
    }
    async analyzeFile(document) {
        try {
            const analyzer = this.analyzerFactory.getAnalyzer(document.fileName, this.configService.getAnalyzerOptions());
            return analyzer.analyze(document.getText(), document.fileName);
        }
        catch (error) {
            console.error(`Analysis failed for ${document.fileName}:`, error);
            return null;
        }
    }
    async analyzeWorkspace(files, progress, token) {
        const results = [];
        const increment = 100 / files.length;
        for (let i = 0; i < files.length && !token.isCancellationRequested; i++) {
            const file = files[i];
            if (!file)
                continue;
            try {
                const document = await vscode.workspace.openTextDocument(file.fsPath);
                const result = await this.analyzeFile(document);
                if (result) {
                    results.push(result);
                }
            }
            catch (error) {
                console.error(`Failed to analyze ${file.fsPath}:`, error);
            }
            progress.report({
                increment,
                message: `Analyzed ${i + 1} of ${files.length} files`
            });
        }
        return {
            fileResults: results,
            summary: this.generateSummary(results)
        };
    }
    generateSummary(results) {
        return {
            filesAnalyzed: results.length,
            totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
            criticalIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0),
            highIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'high').length, 0),
            mediumIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'medium').length, 0),
            lowIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'low').length, 0)
        };
    }
}
exports.PerformanceAnalyzerService = PerformanceAnalyzerService;
//# sourceMappingURL=PerformanceAnalyzerService.js.map