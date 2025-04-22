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
exports.CodeEditorManager = void 0;
const vscode = __importStar(require("vscode"));
const codeExecutor_1 = require("./services/codeExecutor");
const codeNavigator_1 = require("./services/codeNavigator");
const codeLinker_1 = require("./services/codeLinker");
/**
 * Manages code editing functionality through specialized services
 */
class CodeEditorManager {
    executor;
    navigator;
    linker;
    disposables = [];
    constructor(context) {
        this.executor = new codeExecutor_1.CodeExecutorService();
        this.navigator = new codeNavigator_1.CodeNavigatorService();
        this.linker = new codeLinker_1.CodeLinkerService();
        this.registerCommands(context);
    }
    registerCommands(context) {
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.executeCode', () => this.executeSelectedCode()), vscode.commands.registerCommand('copilot-ppa.showOverview', () => this.showCodeOverview()), vscode.commands.registerCommand('copilot-ppa.findReferences', () => this.findReferences()), vscode.commands.registerCommand('copilot-ppa.createLink', () => this.createCodeLink()), vscode.commands.registerCommand('copilot-ppa.navigateLink', () => this.navigateCodeLink()));
        context.subscriptions.push(...this.disposables);
    }
    // ICodeExecutor implementation
    async executeSelectedCode() {
        try {
            await this.executor.executeSelectedCode();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to execute code: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // ICodeNavigator implementation
    async showCodeOverview() {
        try {
            await this.navigator.showCodeOverview();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to show code overview: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findReferences() {
        try {
            await this.navigator.findReferences();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to find references: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // ICodeLinker implementation
    async createCodeLink() {
        try {
            await this.linker.createCodeLink();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create code link: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async navigateCodeLink() {
        try {
            await this.linker.navigateCodeLink();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to navigate code link: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        // Dispose services
        if (this.executor instanceof vscode.Disposable) {
            this.executor.dispose();
        }
        if (this.navigator instanceof vscode.Disposable) {
            this.navigator.dispose();
        }
        if (this.linker instanceof vscode.Disposable) {
            this.linker.dispose();
        }
    }
}
exports.CodeEditorManager = CodeEditorManager;
//# sourceMappingURL=codeEditorManager.js.map