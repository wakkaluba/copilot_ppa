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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticAnalysisService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const StaticAnalysisExecutor_1 = require("./services/StaticAnalysisExecutor");
let StaticAnalysisService = class StaticAnalysisService {
    constructor(logger, executor) {
        this.logger = logger;
        this.executor = executor;
        this.outputChannel = vscode.window.createOutputChannel('Static Analysis');
    }
    async runESLint(options) {
        return this.runAnalysis({ ...options, tool: 'eslint' });
    }
    async runPrettier(options) {
        return this.runAnalysis({ ...options, tool: 'prettier' });
    }
    async runAnalysis(options) {
        try {
            this.validateOptions(options);
            this.logger.info(`Running static analysis with ${options.tool || 'default'} tool`);
            const analysis = await this.executor.execute(options);
            if (analysis.issues.length > 0) {
                this.logIssues(analysis.issues);
            }
            return {
                success: analysis.issues.length === 0,
                message: `Found ${analysis.issues.length} issues`,
                suites: [{
                        id: options.tool || 'static-analysis',
                        name: 'Static Analysis',
                        tests: analysis.issues.map(issue => ({
                            id: `${issue.filePath}:${issue.line}`,
                            name: `${issue.message} (${issue.filePath}:${issue.line})`,
                            status: 'failed',
                            duration: 0,
                            error: issue.message
                        })),
                        suites: []
                    }],
                totalTests: analysis.issues.length,
                passed: 0,
                failed: analysis.issues.length,
                skipped: 0,
                duration: 0,
                timestamp: new Date(),
                staticAnalysis: analysis
            };
        }
        catch (error) {
            this.logger.error('Static analysis failed:', error);
            return this.createErrorResult(error);
        }
    }
    createErrorResult(error) {
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
    validateOptions(options) {
        if (options.tool && !this.isValidTool(options.tool)) {
            throw new Error(`Unsupported analysis tool: ${options.tool}`);
        }
    }
    isValidTool(tool) {
        return ['eslint', 'tslint', 'prettier', 'stylelint', 'sonarqube', 'custom'].includes(tool);
    }
    logIssues(issues) {
        this.outputChannel.appendLine('\n--- Static Analysis Issues ---\n');
        for (const issue of issues) {
            const location = `${issue.filePath}:${issue.line}${issue.column ? `:${issue.column}` : ''}`;
            const severity = issue.severity.toUpperCase();
            this.outputChannel.appendLine(`[${severity}] ${location} - ${issue.message}`);
            if (issue.ruleId) {
                this.outputChannel.appendLine(`  Rule: ${issue.ruleId}`);
            }
            if (issue.fix) {
                this.outputChannel.appendLine(`  Suggestion: ${issue.fix}`);
            }
            this.outputChannel.appendLine('');
        }
    }
    dispose() {
        this.outputChannel.dispose();
    }
};
exports.StaticAnalysisService = StaticAnalysisService;
exports.StaticAnalysisService = StaticAnalysisService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(StaticAnalysisExecutor_1.StaticAnalysisExecutor)),
    __metadata("design:paramtypes", [Object, StaticAnalysisExecutor_1.StaticAnalysisExecutor])
], StaticAnalysisService);
//# sourceMappingURL=staticAnalysisService.js.map