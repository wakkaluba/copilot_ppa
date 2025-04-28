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
exports.SecurityTestingService = void 0;
const vscode = __importStar(require("vscode"));
const SecurityToolService_1 = require("./services/SecurityToolService");
const CommandExecutorService_1 = require("./services/CommandExecutorService");
const SecurityResultParserService_1 = require("./services/SecurityResultParserService");
const SecurityFilterService_1 = require("./services/SecurityFilterService");
const SecuritySummaryService_1 = require("./services/SecuritySummaryService");
/**
 * Service for performing security testing
 */
class SecurityTestingService {
    constructor() {
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
    async runSecurityTest(options) {
        const workspace = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspace) {
            return { success: false, message: 'No workspace folder found' };
        }
        this.outputChannel.appendLine(`Running security test on ${workspace}`);
        this.outputChannel.show();
        const tool = await this.toolService.detectTool(options, workspace);
        if (!tool) {
            return { success: false, message: 'No security testing tool detected' };
        }
        const cmd = options.command || this.toolService.buildCommand(tool, options);
        this.outputChannel.appendLine(`Running command: ${cmd}`);
        const result = await this.executor.execute(cmd, workspace, this.outputChannel);
        const vulnerabilities = await this.parser.parseResults(result, tool);
        const filtered = this.filter.apply(vulnerabilities, options);
        result.securityTest = {
            vulnerabilities: filtered,
            summary: this.summary.generate(filtered)
        };
        const passes = options.threshold === undefined || filtered.length <= options.threshold;
        result.success = !options.failOnVulnerabilities || filtered.length === 0 || passes;
        result.message = this.summary.createMessage(filtered, options, passes);
        return result;
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.SecurityTestingService = SecurityTestingService;
//# sourceMappingURL=securityTestingService.js.map