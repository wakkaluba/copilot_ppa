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
exports.RefactoringTools = void 0;
const vscode = __importStar(require("vscode"));
const CodeSimplificationService_1 = require("./services/CodeSimplificationService");
const UnusedCodeAnalyzerService_1 = require("./services/UnusedCodeAnalyzerService");
const CodeDiffService_1 = require("./services/CodeDiffService");
const RefactoringOutputService_1 = require("./services/RefactoringOutputService");
const LLMRefactoringService_1 = require("./services/LLMRefactoringService");
const eventEmitter_1 = require("../common/eventEmitter");
/**
 * Provides refactoring tools for code improvements
 */
class RefactoringTools extends eventEmitter_1.EventEmitter {
    simplificationService;
    unusedCodeAnalyzer;
    diffService;
    outputService;
    llmService;
    constructor() {
        super();
        this.simplificationService = new CodeSimplificationService_1.CodeSimplificationService();
        this.unusedCodeAnalyzer = new UnusedCodeAnalyzerService_1.UnusedCodeAnalyzerService();
        this.diffService = new CodeDiffService_1.CodeDiffService();
        this.outputService = new RefactoringOutputService_1.RefactoringOutputService();
        this.llmService = new LLMRefactoringService_1.LLMRefactoringService();
    }
    /**
     * Initialize the refactoring tools
     */
    async initialize() {
        await Promise.all([
            this.simplificationService.initialize(),
            this.unusedCodeAnalyzer.initialize(),
            this.llmService.initialize()
        ]);
    }
    /**
     * Simplify code in the current editor
     */
    async simplifyCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        try {
            this.outputService.startOperation('Analyzing code for simplification...');
            const { text, selection } = await this.simplificationService.getEditorContent(editor);
            const simplifiedCode = await this.simplificationService.simplifyCode(text, editor.document.languageId);
            await this.showAndApplyChanges(editor.document.uri, text, simplifiedCode, selection.isEmpty ? "Entire File" : "Selected Code", 'Apply the simplified code?');
            this.outputService.logSuccess('Code successfully simplified');
        }
        catch (error) {
            this.outputService.logError('Error simplifying code:', error);
        }
    }
    /**
     * Remove unused code (dead code) in the current editor
     */
    async removeUnusedCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        try {
            this.outputService.startOperation('Analyzing code to detect unused elements...');
            const cleanedCode = await this.unusedCodeAnalyzer.removeUnusedCode(editor.document.getText(), editor.document.languageId);
            await this.showAndApplyChanges(editor.document.uri, editor.document.getText(), cleanedCode, "Entire File (Unused Code Removed)", 'Apply the code with unused elements removed?');
            this.outputService.logSuccess('Unused code successfully removed');
        }
        catch (error) {
            this.outputService.logError('Error removing unused code:', error);
        }
    }
    /**
     * Refactor code using LLM in the current editor
     * @param instructions Instructions for the refactoring
     */
    async refactorWithLLM(instructions) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        try {
            this.outputService.startOperation('Processing code with LLM...');
            const { text, selection } = await this.simplificationService.getEditorContent(editor);
            const refactoredCode = await this.llmService.refactorCode(text, editor.document.languageId, instructions);
            await this.showAndApplyChanges(editor.document.uri, text, refactoredCode, "LLM Refactoring", 'Apply the LLM refactored code?');
            this.outputService.logSuccess('Code successfully refactored');
        }
        catch (error) {
            this.outputService.logError('Error during LLM refactoring:', error);
        }
    }
    /**
     * Show diff and apply changes if user confirms
     * @param uri Document URI
     * @param originalCode Original code
     * @param newCode New code
     * @param title Diff title
     * @param prompt Confirmation prompt
     */
    async showAndApplyChanges(uri, originalCode, newCode, title, prompt) {
        if (originalCode === newCode) {
            this.outputService.logSuccess('No changes needed, code is already optimized');
            return;
        }
        await this.diffService.showDiff(uri, originalCode, newCode, title);
        const shouldReplace = await vscode.window.showInformationMessage(prompt, 'Replace', 'Cancel');
        if (shouldReplace === 'Replace') {
            const document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document);
            await editor.edit(editBuilder => {
                const range = new vscode.Range(0, 0, document.lineCount, 0);
                editBuilder.replace(range, newCode);
            });
        }
    }
    /**
     * Dispose resources
     */
    dispose() {
        super.dispose(); // Call base class dispose to clean up event listeners
    }
}
exports.RefactoringTools = RefactoringTools;
//# sourceMappingURL=refactoringTools.js.map