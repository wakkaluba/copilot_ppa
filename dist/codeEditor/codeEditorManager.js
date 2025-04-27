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
exports.CodeEditorManager = void 0;
const vscode = __importStar(require("vscode"));
const codeExecutor_1 = require("./services/codeExecutor");
const codeNavigator_1 = require("./services/codeNavigator");
const codeLinker_1 = require("./services/codeLinker");
/**
 * Manages code editing functionality through specialized services
 */
class CodeEditorManager {
    constructor(context) {
        this.disposables = [];
        this._onEditorStateChange = new vscode.EventEmitter();
        this.metrics = new Map();
        this.executor = new codeExecutor_1.CodeExecutorService();
        this.navigator = new codeNavigator_1.CodeNavigatorService();
        this.linker = new codeLinker_1.CodeLinkerService();
        this.registerCommands(context);
        this.initializeMetrics();
    }
    static getInstance(context) {
        if (!CodeEditorManager.instance) {
            CodeEditorManager.instance = new CodeEditorManager(context);
        }
        return CodeEditorManager.instance;
    }
    initializeMetrics() {
        this.metrics.set('executions', 0);
        this.metrics.set('navigations', 0);
        this.metrics.set('links', 0);
        this.metrics.set('errors', 0);
    }
    registerCommands(context) {
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.executeCode', () => this.executeSelectedCode()), vscode.commands.registerCommand('copilot-ppa.showOverview', () => this.showCodeOverview()), vscode.commands.registerCommand('copilot-ppa.findReferences', () => this.findReferences()), vscode.commands.registerCommand('copilot-ppa.createLink', () => this.createCodeLink()), vscode.commands.registerCommand('copilot-ppa.navigateLink', () => this.navigateCodeLink()));
        context.subscriptions.push(...this.disposables);
    }
    // ICodeExecutor implementation
    async executeSelectedCode() {
        try {
            this._onEditorStateChange.fire();
            this.metrics.set('executions', (this.metrics.get('executions') || 0) + 1);
            await this.executor.executeSelectedCode();
            vscode.commands.executeCommand('setContext', 'copilot-ppa:hasActiveExecution', true);
        }
        catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to execute code: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // ICodeNavigator implementation
    async showCodeOverview() {
        try {
            this._onEditorStateChange.fire();
            this.metrics.set('navigations', (this.metrics.get('navigations') || 0) + 1);
            await this.navigator.showCodeOverview();
        }
        catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to show code overview: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findReferences() {
        try {
            this._onEditorStateChange.fire();
            this.metrics.set('navigations', (this.metrics.get('navigations') || 0) + 1);
            await this.navigator.findReferences();
        }
        catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to find references: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Reference search failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // ICodeLinker implementation
    async createCodeLink() {
        try {
            this._onEditorStateChange.fire();
            this.metrics.set('links', (this.metrics.get('links') || 0) + 1);
            await this.linker.createCodeLink();
        }
        catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to create code link: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Link creation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async navigateCodeLink() {
        try {
            this._onEditorStateChange.fire();
            this.metrics.set('navigations', (this.metrics.get('navigations') || 0) + 1);
            await this.linker.navigateCodeLink();
        }
        catch (error) {
            this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
            vscode.window.showErrorMessage(`Failed to navigate code link: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`Link navigation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    getMetrics() {
        return new Map(this.metrics);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this._onEditorStateChange.dispose();
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