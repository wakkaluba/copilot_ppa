"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAnalyzer = void 0;
const performanceManager_1 = require("./performanceManager");
/**
 * @deprecated Use PerformanceManager from './performanceManager' instead.
 */
class PerformanceAnalyzer {
    constructor(context) {
        this.manager = new performanceManager_1.PerformanceManager(context);
    }
    analyzeActiveFile() {
        return this.manager.analyzeCurrentFile();
    }
    analyzeWorkspace() {
        return this.manager.analyzeWorkspace();
    }
    showFileAnalysisReport(result) {
        this.manager.showFileAnalysisReport(result);
    }
    showWorkspaceAnalysisReport(result) {
        this.manager.showWorkspaceAnalysisReport(result);
    }
}
exports.PerformanceAnalyzer = PerformanceAnalyzer;
//# sourceMappingURL=performanceAnalyzer.js.map