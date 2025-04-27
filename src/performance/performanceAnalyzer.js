"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAnalyzer = void 0;
var performanceManager_1 = require("./performanceManager");
/**
 * @deprecated Use PerformanceManager from './performanceManager' instead.
 */
var PerformanceAnalyzer = /** @class */ (function () {
    function PerformanceAnalyzer(context) {
        this.manager = new performanceManager_1.PerformanceManager(context);
    }
    PerformanceAnalyzer.prototype.analyzeActiveFile = function () {
        return this.manager.analyzeCurrentFile();
    };
    PerformanceAnalyzer.prototype.analyzeWorkspace = function () {
        return this.manager.analyzeWorkspace();
    };
    PerformanceAnalyzer.prototype.showFileAnalysisReport = function (result) {
        this.manager.showFileAnalysisReport(result);
    };
    PerformanceAnalyzer.prototype.showWorkspaceAnalysisReport = function (result) {
        this.manager.showWorkspaceAnalysisReport(result);
    };
    return PerformanceAnalyzer;
}());
exports.PerformanceAnalyzer = PerformanceAnalyzer;
