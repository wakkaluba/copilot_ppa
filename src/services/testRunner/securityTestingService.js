"use strict";
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
exports.SecurityTestingService = void 0;
var vscode = require("vscode");
var SecurityToolService_1 = require("./services/SecurityToolService");
var CommandExecutorService_1 = require("./services/CommandExecutorService");
var SecurityResultParserService_1 = require("./services/SecurityResultParserService");
var SecurityFilterService_1 = require("./services/SecurityFilterService");
var SecuritySummaryService_1 = require("./services/SecuritySummaryService");
/**
 * Service for performing security testing
 */
var SecurityTestingService = /** @class */ (function () {
    function SecurityTestingService() {
        this.toolService = new SecurityToolService_1.SecurityToolService();
        this.executor = new CommandExecutorService_1.CommandExecutorService();
        this.parser = new SecurityResultParserService_1.SecurityResultParserService();
        this.filter = new SecurityFilterService_1.SecurityFilterService();
        this.summary = new SecuritySummaryService_1.SecuritySummaryService();
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Security Testing');
    }
    /**
     * Run security testing
     */
    SecurityTestingService.prototype.runSecurityTest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace, tool, cmd, result, vulnerabilities, filtered, passes;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        workspace = options.path || ((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath);
                        if (!workspace) {
                            return [2 /*return*/, { success: false, message: 'No workspace folder found' }];
                        }
                        this.outputChannel.appendLine("Running security test on ".concat(workspace));
                        this.outputChannel.show();
                        return [4 /*yield*/, this.toolService.detectTool(options, workspace)];
                    case 1:
                        tool = _b.sent();
                        if (!tool) {
                            return [2 /*return*/, { success: false, message: 'No security testing tool detected' }];
                        }
                        cmd = options.command || this.toolService.buildCommand(tool, options);
                        this.outputChannel.appendLine("Running command: ".concat(cmd));
                        return [4 /*yield*/, this.executor.execute(cmd, workspace, this.outputChannel)];
                    case 2:
                        result = _b.sent();
                        return [4 /*yield*/, this.parser.parseResults(result, tool)];
                    case 3:
                        vulnerabilities = _b.sent();
                        filtered = this.filter.apply(vulnerabilities, options);
                        result.securityTest = {
                            vulnerabilities: filtered,
                            summary: this.summary.generate(filtered)
                        };
                        passes = options.threshold === undefined || filtered.length <= options.threshold;
                        result.success = !options.failOnVulnerabilities || filtered.length === 0 || passes;
                        result.message = this.summary.createMessage(filtered, options, passes);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Clean up resources
     */
    SecurityTestingService.prototype.dispose = function () {
        this.outputChannel.dispose();
    };
    return SecurityTestingService;
}());
exports.SecurityTestingService = SecurityTestingService;
