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
exports.CodeCoverageService = void 0;
const vscode = __importStar(require("vscode"));
const CoverageToolService_1 = require("./services/CoverageToolService");
const CommandExecutorService_1 = require("./services/CommandExecutorService");
const CoverageReportService_1 = require("./services/CoverageReportService");
const CoverageParserService_1 = require("./services/CoverageParserService");
const CoverageThresholdService_1 = require("./services/CoverageThresholdService");
/**
 * Service for analyzing code coverage
 */
class CodeCoverageService {
    toolService;
    executor;
    reportService;
    parser;
    thresholdService;
    outputChannel;
    constructor() {
        this.toolService = new CoverageToolService_1.CoverageToolService();
        this.executor = new CommandExecutorService_1.CommandExecutorService();
        this.reportService = new CoverageReportService_1.CoverageReportService();
        this.parser = new CoverageParserService_1.CoverageParserService();
        this.thresholdService = new CoverageThresholdService_1.CoverageThresholdService();
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Code Coverage');
    }
    /**
     * Run code coverage analysis
     */
    async runCoverageAnalysis(options) {
        const workspacePath = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            return {
                success: false,
                message: 'No workspace folder found'
            };
        }
        this.outputChannel.appendLine(`Running code coverage analysis on ${workspacePath}`);
        this.outputChannel.show();
        const tool = await this.toolService.detectTool(options, workspacePath);
        if (!tool) {
            return {
                success: false,
                message: 'No code coverage tool detected'
            };
        }
        const command = options.command || this.toolService.buildCommand(tool, options);
        this.outputChannel.appendLine(`Running command: ${command}`);
        const result = await this.executor.execute(command, workspacePath, this.outputChannel);
        const reportPath = options.reportPath || this.reportService.findReport(workspacePath, tool, options.reportFormat);
        if (reportPath) {
            const coverageData = await this.parser.parse(reportPath, tool, options.reportFormat);
            if (coverageData) {
                result.codeCoverage = coverageData;
                const passes = this.thresholdService.check(coverageData, options.threshold);
                result.success = result.success && passes.success;
                result.message = passes.message;
            }
        }
        return result;
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.CodeCoverageService = CodeCoverageService;
//# sourceMappingURL=codeCoverageService.js.map