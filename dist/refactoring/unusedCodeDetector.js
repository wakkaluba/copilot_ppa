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
exports.UnusedCodeDetector = void 0;
const vscode = __importStar(require("vscode"));
const UnusedCodeAnalyzer_1 = require("./codeAnalysis/UnusedCodeAnalyzer");
class UnusedCodeDetector {
    analyzer;
    constructor(context) {
        this.analyzer = new UnusedCodeAnalyzer_1.UnusedCodeAnalyzer();
        context.subscriptions.push(this);
    }
    /**
     * Analyzes the current file or selection to detect unused code
     */
    async detectUnusedCode(editor) {
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return [];
        }
        try {
            return await this.analyzer.analyze(editor.document, editor.selection);
        }
        catch (error) {
            console.error('Error during unused code detection:', error);
            vscode.window.showErrorMessage(`Error analyzing file: ${error}`);
            return [];
        }
    }
    /**
     * Remove all unused code from the current document
     */
    async removeUnusedCode(editor) {
        const diagnostics = await this.detectUnusedCode(editor);
        if (!diagnostics.length) {
            return;
        }
        const edit = new vscode.WorkspaceEdit();
        // Apply deletions in reverse order to avoid position shifting
        for (const diagnostic of [...diagnostics].reverse()) {
            edit.delete(editor.document.uri, diagnostic.range);
        }
        await vscode.workspace.applyEdit(edit);
    }
    dispose() {
        this.analyzer.dispose();
    }
}
exports.UnusedCodeDetector = UnusedCodeDetector;
//# sourceMappingURL=unusedCodeDetector.js.map