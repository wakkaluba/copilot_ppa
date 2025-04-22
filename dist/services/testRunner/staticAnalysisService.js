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
exports.StaticAnalysisService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const StaticAnalysisServiceImpl_1 = require("../../services/testRunner/services/StaticAnalysisServiceImpl");
/**
 * Service for performing static code analysis
 */
class StaticAnalysisService {
    service;
    logger;
    outputChannel;
    constructor(logger) {
        this.logger = logger;
        this.outputChannel = vscode.window.createOutputChannel('Static Analysis');
        this.service = new StaticAnalysisServiceImpl_1.StaticAnalysisServiceImpl(this.logger, this.outputChannel);
    }
    /**
     * Run ESLint analysis
     */
    async runESLint(options) {
        try {
            this.logger.debug('Running ESLint analysis');
            return await this.service.runESLint(options);
        }
        catch (error) {
            this.logger.error('ESLint analysis failed:', error);
            return {
                success: false,
                message: `ESLint analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                suites: [],
                totalTests: 0,
                passed: 0,
                failed: 1,
                skipped: 0,
                duration: 0,
                timestamp: new Date()
            };
        }
    }
    /**
     * Run Prettier analysis
     */
    async runPrettier(options) {
        try {
            this.logger.debug('Running Prettier analysis');
            return await this.service.runPrettier(options);
        }
        catch (error) {
            this.logger.error('Prettier analysis failed:', error);
            return {
                success: false,
                message: `Prettier analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                suites: [],
                totalTests: 0,
                passed: 0,
                failed: 1,
                skipped: 0,
                duration: 0,
                timestamp: new Date()
            };
        }
    }
    /**
     * Run static analysis with specified tool
     */
    async runAnalysis(options) {
        try {
            this.validateOptions(options);
            this.logger.info(`Running static analysis with ${options.tool || 'default'} tool`);
            const result = await this.service.runAnalysis(options);
            if (result.staticAnalysis?.issues?.length > 0) {
                this.logIssues(result.staticAnalysis.issues);
            }
            return result;
        }
        catch (error) {
            this.logger.error('Static analysis failed:', error);
            return {
                success: false,
                message: `Static analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                suites: [],
                totalTests: 0,
                passed: 0,
                failed: 1,
                skipped: 0,
                duration: 0,
                timestamp: new Date()
            };
        }
    }
    /**
     * Validate analysis options
     */
    validateOptions(options) {
        if (options.tool && !this.isValidTool(options.tool)) {
            throw new Error(`Unsupported analysis tool: ${options.tool}`);
        }
        if (options.path && !path.isAbsolute(options.path)) {
            options.path = path.resolve(options.path);
        }
        if (options.configPath && !path.isAbsolute(options.configPath)) {
            options.configPath = path.resolve(options.configPath);
        }
    }
    /**
     * Check if tool is supported
     */
    isValidTool(tool) {
        return ['eslint', 'tslint', 'prettier', 'stylelint', 'sonarqube', 'custom'].includes(tool);
    }
    /**
     * Log analysis issues
     */
    logIssues(issues) {
        this.outputChannel.appendLine('\n--- Static Analysis Issues ---\n');
        for (const issue of issues) {
            const location = `${issue.filePath}:${issue.line}${issue.column ? `:${issue.column}` : ''}`;
            const severity = issue.severity.toUpperCase();
            this.outputChannel.appendLine(`[${severity}] ${location} - ${issue.message}`);
            if (issue.rule) {
                this.outputChannel.appendLine(`  Rule: ${issue.rule}`);
            }
            if (issue.fix) {
                this.outputChannel.appendLine(`  Suggestion: ${issue.fix}`);
            }
            this.outputChannel.appendLine('');
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.outputChannel.dispose();
        this.service.dispose();
    }
}
exports.StaticAnalysisService = StaticAnalysisService;
//# sourceMappingURL=staticAnalysisService.js.map