"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeComplexityAnalyzer = void 0;
const CodeComplexityService_1 = require("../services/codeAnalysis/CodeComplexityService");
class CodeComplexityAnalyzer {
    service;
    constructor() {
        this.service = new CodeComplexityService_1.CodeComplexityService();
    }
    async analyzeFile(filePath) {
        return this.service.analyzeFile(filePath);
    }
    async analyzeWorkspace(workspaceFolder) {
        return this.service.analyzeWorkspace(workspaceFolder);
    }
    generateComplexityReport(results) {
        return this.service.generateComplexityReport(results);
    }
    visualizeComplexity(editor, result) {
        return this.service.visualizeComplexity(editor, result);
    }
}
exports.CodeComplexityAnalyzer = CodeComplexityAnalyzer;
//# sourceMappingURL=codeComplexityAnalyzer.js.map