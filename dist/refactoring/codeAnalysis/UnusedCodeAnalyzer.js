"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnusedCodeAnalyzer = void 0;
const BaseCodeAnalyzer_1 = require("../codeAnalysis/BaseCodeAnalyzer");
const TypeScriptAnalyzer_1 = require("./TypeScriptAnalyzer");
const JavaScriptAnalyzer_1 = require("./JavaScriptAnalyzer");
class UnusedCodeAnalyzer extends BaseCodeAnalyzer_1.BaseCodeAnalyzer {
    constructor() {
        super(...arguments);
        this.languageAnalyzers = new Map();
    }
    /**
     * Analyzes a document for unused code
     */
    async analyze(document, selection) {
        const analyzer = this.getLanguageAnalyzer(document);
        const diagnostics = await analyzer.findUnusedCode(document, selection);
        this.updateDiagnostics(document, diagnostics);
        return diagnostics;
    }
    /**
     * Gets the appropriate language-specific analyzer
     */
    getLanguageAnalyzer(document) {
        const extension = document.uri.fsPath.split('.').pop()?.toLowerCase();
        let analyzer = this.languageAnalyzers.get(extension || '');
        if (!analyzer) {
            analyzer = this.createAnalyzer(extension);
            this.languageAnalyzers.set(extension || '', analyzer);
        }
        return analyzer;
    }
    createAnalyzer(extension) {
        switch (extension) {
            case 'ts':
            case 'tsx':
                return new TypeScriptAnalyzer_1.TypeScriptAnalyzer();
            case 'js':
            case 'jsx':
                return new JavaScriptAnalyzer_1.JavaScriptAnalyzer();
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    }
    dispose() {
        super.dispose();
        this.languageAnalyzers.clear();
    }
}
exports.UnusedCodeAnalyzer = UnusedCodeAnalyzer;
//# sourceMappingURL=UnusedCodeAnalyzer.js.map