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
exports.StaticAnalysisExecutor = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const inversify_1 = require("inversify");
let StaticAnalysisExecutor = class StaticAnalysisExecutor {
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
exports.StaticAnalysisExecutor = StaticAnalysisExecutor;
exports.StaticAnalysisExecutor = StaticAnalysisExecutor = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __param(1, (0, inversify_1.inject)('OutputChannel')),
    __metadata("design:paramtypes", [Object, Object])
], StaticAnalysisExecutor);
//# sourceMappingURL=StaticAnalysisExecutor.js.map