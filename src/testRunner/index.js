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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTestReportingCommands = registerTestReportingCommands;
var vscode = require("vscode");
var testReporting_1 = require("./testReporting");
__exportStar(require("./testTypes"), exports);
__exportStar(require("./testReporting"), exports);
/**
 * Register commands for test reporting and trend analysis
 */
function registerTestReportingCommands(context) {
    // Create test reporter instance
    var testReporter = new testReporting_1.TestReporter(context);
    // Register command to show test trends
    context.subscriptions.push(vscode.commands.registerCommand('localLlmAgent.showTestTrends', function () {
        testReporter.showHistoricalTrends();
    }));
    // Register command to export test results
    context.subscriptions.push(vscode.commands.registerCommand('localLlmAgent.exportTestResults', function (testResults) {
        testReporter.exportTestResults(testResults);
    }));
    return testReporter;
}
