"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticAnalysisExecutor = void 0;
var vscode = require("vscode");
var child_process_1 = require("child_process");
var inversify_1 = require("inversify");
var StaticAnalysisExecutor = /** @class */ (function () {
    function StaticAnalysisExecutor(logger, outputChannel) {
        this.logger = logger;
        this.outputChannel = outputChannel;
    }
    StaticAnalysisExecutor.prototype.execute = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tool, command, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        tool = this.resolveTool(options);
                        command = this.buildCommand(tool, options);
                        return [4 /*yield*/, this.executeCommand(command, options.path)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this.processResult(result, tool)];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Static analysis execution failed:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StaticAnalysisExecutor.prototype.resolveTool = function (options) {
        return options.tool || 'eslint';
    };
    StaticAnalysisExecutor.prototype.buildCommand = function (tool, options) {
        var _a, _b, _c;
        switch (tool) {
            case 'eslint':
                return "eslint ".concat(((_a = options.files) === null || _a === void 0 ? void 0 : _a.join(' ')) || '.', " -f json");
            case 'prettier':
                return "prettier --check ".concat(((_b = options.files) === null || _b === void 0 ? void 0 : _b.join(' ')) || '.');
            case 'stylelint':
                return "stylelint ".concat(((_c = options.files) === null || _c === void 0 ? void 0 : _c.join(' ')) || '**/*.css', " --formatter json");
            case 'sonarqube':
                return "sonar-scanner ".concat(this.buildSonarOptions(options));
            default:
                throw new Error("Unsupported static analysis tool: ".concat(tool));
        }
    };
    StaticAnalysisExecutor.prototype.buildSonarOptions = function (options) {
        var config = options.config || {};
        return Object.entries(config)
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return "-D".concat(key, "=").concat(value);
        })
            .join(' ');
    };
    StaticAnalysisExecutor.prototype.executeCommand = function (command, path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        (0, child_process_1.execSync)(command, { cwd: path, encoding: 'utf8' }, function (error, stdout, stderr) {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve(stdout);
                            }
                        });
                    })];
            });
        });
    };
    StaticAnalysisExecutor.prototype.processResult = function (output, tool) {
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
                    throw new Error("Unsupported tool: ".concat(tool));
            }
        }
        catch (error) {
            this.logger.error("Error processing ".concat(tool, " output:"), error);
            throw error;
        }
    };
    StaticAnalysisExecutor.prototype.processESLintOutput = function (output) {
        var results = JSON.parse(output);
        var issues = results.flatMap(function (result) {
            return result.messages.map(function (msg) { return ({
                filePath: result.filePath,
                line: msg.line,
                column: msg.column,
                message: msg.message,
                ruleId: msg.ruleId || 'unknown',
                severity: msg.severity === 2 ? 'error' : 'warning',
                fix: msg.fix
            }); });
        });
        return {
            raw: output,
            issueCount: issues.length,
            issues: issues
        };
    };
    StaticAnalysisExecutor.prototype.processPrettierOutput = function (output) {
        // Prettier outputs nothing if files are formatted correctly
        var issues = output.split('\n')
            .filter(function (line) { return line.trim(); })
            .map(function (line) { return ({
            filePath: line.trim(),
            line: 1,
            column: 1,
            message: 'File is not properly formatted',
            ruleId: 'prettier/format',
            severity: 'warning'
        }); });
        return {
            raw: output,
            issueCount: issues.length,
            issues: issues
        };
    };
    StaticAnalysisExecutor.prototype.processStylelintOutput = function (output) {
        var results = JSON.parse(output);
        var issues = results.flatMap(function (result) {
            return result.warnings.map(function (warning) { return ({
                filePath: result.source,
                line: warning.line,
                column: warning.column,
                message: warning.text,
                ruleId: warning.rule,
                severity: warning.severity
            }); });
        });
        return {
            raw: output,
            issueCount: issues.length,
            issues: issues
        };
    };
    StaticAnalysisExecutor.prototype.processSonarQubeOutput = function (output) {
        var results = JSON.parse(output);
        var issues = results.issues.map(function (issue) {
            var _a;
            return ({
                filePath: issue.component,
                line: issue.line,
                column: ((_a = issue.textRange) === null || _a === void 0 ? void 0 : _a.startLine) || 1,
                message: issue.message,
                ruleId: issue.rule,
                severity: issue.severity,
                category: issue.type
            });
        });
        return {
            raw: output,
            issueCount: issues.length,
            issues: issues
        };
    };
    StaticAnalysisExecutor.prototype.dispose = function () {
        // Nothing to dispose
    };
    StaticAnalysisExecutor = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
        __param(1, (0, inversify_1.inject)('OutputChannel')),
        __metadata("design:paramtypes", [Object, Object])
    ], StaticAnalysisExecutor);
    return StaticAnalysisExecutor;
}());
exports.StaticAnalysisExecutor = StaticAnalysisExecutor;
