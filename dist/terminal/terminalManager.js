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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalManager = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
const ShellService_1 = require("./services/ShellService");
const CommandExecutorService_1 = require("./services/CommandExecutorService");
const TerminalLifecycleService_1 = require("./services/TerminalLifecycleService");
class TerminalManager {
    constructor() {
        this.shellService = new ShellService_1.ShellService();
        this.commandExecutor = new CommandExecutorService_1.CommandExecutorService();
        this.lifecycleService = new TerminalLifecycleService_1.TerminalLifecycleService();
        vscode.window.onDidCloseTerminal(terminal => {
            this.lifecycleService.handleTerminalClose(terminal);
        });
    }
    createTerminal(name, shellType) {
        const options = {
            name,
            shellPath: this.shellService.getShellPath(shellType),
            shellArgs: this.shellService.getShellArgs(shellType),
            cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
        };
        return this.lifecycleService.createTerminal(name, options);
    }
    showTerminal(name, shellType) {
        this.lifecycleService.showTerminal(name, () => this.createTerminal(name, shellType));
    }
    async executeCommand(command, terminalName) {
        const terminal = this.lifecycleService.getTerminal(terminalName);
        await this.commandExecutor.executeInTerminal(terminal, command);
    }
    async executeCommandWithOutput(command, shellType = types_1.TerminalShellType.VSCodeDefault) {
        return this.commandExecutor.executeWithOutput(command, shellType);
    }
    getActiveTerminals() {
        return this.lifecycleService.getActiveTerminals();
    }
    closeTerminal(name) {
        this.lifecycleService.closeTerminal(name);
    }
    closeAllTerminals() {
        this.lifecycleService.closeAllTerminals();
    }
}
exports.TerminalManager = TerminalManager;
//# sourceMappingURL=terminalManager.js.map