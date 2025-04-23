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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticAnalysisService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
let StaticAnalysisService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var StaticAnalysisService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            StaticAnalysisService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        executor;
        outputChannel;
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
    return StaticAnalysisService = _classThis;
})();
exports.StaticAnalysisService = StaticAnalysisService;
//# sourceMappingURL=staticAnalysisService.js.map