"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignImprovementSuggester = void 0;
const LanguageDesignAnalyzer_1 = require("./services/LanguageDesignAnalyzer");
const ArchitectureAnalysisService_1 = require("./services/ArchitectureAnalysisService");
const DesignDiagnosticService_1 = require("./services/DesignDiagnosticService");
class DesignImprovementSuggester {
    constructor(context) {
        this.languageAnalyzer = new LanguageDesignAnalyzer_1.LanguageDesignAnalyzer();
        this.architectureService = new ArchitectureAnalysisService_1.ArchitectureAnalysisService();
        this.diagnosticService = new DesignDiagnosticService_1.DesignDiagnosticService(context);
    }
    /**
     * Analyzes a file for potential design improvements
     */
    async analyzeDesign(document) {
        const issues = await this.languageAnalyzer.analyze(document);
        this.diagnosticService.report(document, issues);
        return issues;
    }
    /**
     * Analyzes a workspace for architectural patterns and improvements
     */
    async analyzeWorkspaceArchitecture() {
        const issues = await this.architectureService.analyzeWorkspace();
        return issues;
    }
    /**
     * Suggests architectural patterns based on project analysis
     */
    suggestArchitecturalPatterns(codebase) {
        return this.architectureService.suggestPatterns(codebase);
    }
}
exports.DesignImprovementSuggester = DesignImprovementSuggester;
//# sourceMappingURL=designImprovementSuggester.js.map