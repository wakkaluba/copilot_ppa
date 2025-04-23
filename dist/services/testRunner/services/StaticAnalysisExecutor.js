"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticAnalysisExecutor = void 0;
const child_process_1 = require("child_process");
const inversify_1 = require("inversify");
let StaticAnalysisExecutor = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var StaticAnalysisExecutor = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            StaticAnalysisExecutor = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        outputChannel;
        constructor(logger, outputChannel) {
            this.logger = logger;
            this.outputChannel = outputChannel;
        }
        async execute(options) {
            try {
                const tool = this.resolveTool(options);
                const command = this.buildCommand(tool, options);
                const result = await this.executeCommand(command, options.path);
                return this.processResult(result, tool);
            }
            catch (error) {
                this.logger.error('Static analysis execution failed:', error);
                throw error;
            }
        }
        resolveTool(options) {
            return options.tool || 'eslint';
        }
        buildCommand(tool, options) {
            switch (tool) {
                case 'eslint':
                    return `eslint ${options.files?.join(' ') || '.'} -f json`;
                case 'prettier':
                    return `prettier --check ${options.files?.join(' ') || '.'}`;
                case 'stylelint':
                    return `stylelint ${options.files?.join(' ') || '**/*.css'} --formatter json`;
                case 'sonarqube':
                    return `sonar-scanner ${this.buildSonarOptions(options)}`;
                default:
                    throw new Error(`Unsupported static analysis tool: ${tool}`);
            }
        }
        buildSonarOptions(options) {
            const config = options.config || {};
            return Object.entries(config)
                .map(([key, value]) => `-D${key}=${value}`)
                .join(' ');
        }
        async executeCommand(command, path) {
            return new Promise((resolve, reject) => {
                (0, child_process_1.execSync)(command, { cwd: path, encoding: 'utf8' }, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(stdout);
                    }
                });
            });
        }
        processResult(output, tool) {
            try {
                switch (tool) {
                    case 'eslint':
                        return this.processESLintOutput(output);
                    case 'prettier':
                        return this.processPrettierOutput(output);
                    case 'stylelint':
                        return this.processStylelintOutput(output);
                    case 'sonarqube':
                        return this.processSonarQubeOutput(output);
                    default:
                        throw new Error(`Unsupported tool: ${tool}`);
                }
            }
            catch (error) {
                this.logger.error(`Error processing ${tool} output:`, error);
                throw error;
            }
        }
        processESLintOutput(output) {
            const results = JSON.parse(output);
            const issues = results.flatMap((result) => result.messages.map((msg) => ({
                filePath: result.filePath,
                line: msg.line,
                column: msg.column,
                message: msg.message,
                ruleId: msg.ruleId || 'unknown',
                severity: msg.severity === 2 ? 'error' : 'warning',
                fix: msg.fix
            })));
            return {
                raw: output,
                issueCount: issues.length,
                issues
            };
        }
        processPrettierOutput(output) {
            // Prettier outputs nothing if files are formatted correctly
            const issues = output.split('\n')
                .filter(line => line.trim())
                .map(line => ({
                filePath: line.trim(),
                line: 1,
                column: 1,
                message: 'File is not properly formatted',
                ruleId: 'prettier/format',
                severity: 'warning'
            }));
            return {
                raw: output,
                issueCount: issues.length,
                issues
            };
        }
        processStylelintOutput(output) {
            const results = JSON.parse(output);
            const issues = results.flatMap((result) => result.warnings.map((warning) => ({
                filePath: result.source,
                line: warning.line,
                column: warning.column,
                message: warning.text,
                ruleId: warning.rule,
                severity: warning.severity
            })));
            return {
                raw: output,
                issueCount: issues.length,
                issues
            };
        }
        processSonarQubeOutput(output) {
            const results = JSON.parse(output);
            const issues = results.issues.map((issue) => ({
                filePath: issue.component,
                line: issue.line,
                column: issue.textRange?.startLine || 1,
                message: issue.message,
                ruleId: issue.rule,
                severity: issue.severity,
                category: issue.type
            }));
            return {
                raw: output,
                issueCount: issues.length,
                issues
            };
        }
        dispose() {
            // Nothing to dispose
        }
    };
    return StaticAnalysisExecutor = _classThis;
})();
exports.StaticAnalysisExecutor = StaticAnalysisExecutor;
//# sourceMappingURL=StaticAnalysisExecutor.js.map