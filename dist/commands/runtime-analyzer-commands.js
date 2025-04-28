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
exports.registerRuntimeAnalyzerCommands = registerRuntimeAnalyzerCommands;
const vscode = __importStar(require("vscode"));
const runtime_analyzer_1 = require("../runtime-analyzer");
/**
 * Register runtime analyzer commands with VS Code
 */
function registerRuntimeAnalyzerCommands(context) {
    // Start recording runtime metrics
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.startRecording', () => {
        runtime_analyzer_1.runtimeAnalyzer.startRecording();
        vscode.window.showInformationMessage('Runtime analysis recording started');
    }));
    // Stop recording runtime metrics
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.stopRecording', () => {
        runtime_analyzer_1.runtimeAnalyzer.stopRecording();
        vscode.window.showInformationMessage('Runtime analysis recording stopped');
    }));
    // Export runtime analysis results
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.exportResults', async () => {
        const options = {
            defaultUri: vscode.Uri.file('runtime-analysis-results.json'),
            filters: {
                'JSON files': ['json'],
                'All files': ['*']
            }
        };
        const uri = await vscode.window.showSaveDialog(options);
        if (uri) {
            runtime_analyzer_1.runtimeAnalyzer.exportResults(uri.fsPath);
        }
    }));
    // Visualize runtime analysis results
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.visualize', () => {
        runtime_analyzer_1.runtimeAnalyzer.visualizeResults();
    }));
    // Add runtime analyzer markers to selected code
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.addMarkers', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('No code selected');
            return;
        }
        const markerId = await vscode.window.showInputBox({
            prompt: 'Enter a marker ID for this code section',
            placeHolder: 'e.g., functionName, processData, etc.'
        });
        if (!markerId) {
            return;
        }
        const selectedText = editor.document.getText(selection);
        const indentation = getIndentation(editor.document, selection.start.line);
        // Create marked code
        const markedCode = `${indentation}// START performance marker: ${markerId}
${indentation}runtimeAnalyzer.markStart('${markerId}');
${selectedText}
${indentation}runtimeAnalyzer.markEnd('${markerId}');
${indentation}// END performance marker: ${markerId}`;
        // Replace the selection with marked code
        editor.edit(editBuilder => {
            editBuilder.replace(selection, markedCode);
        }).then(success => {
            if (success) {
                vscode.window.showInformationMessage(`Runtime analyzer markers added for "${markerId}"`);
            }
        });
    }));
}
/**
 * Get the indentation at a specific line
 */
function getIndentation(document, lineNumber) {
    const line = document.lineAt(lineNumber);
    const text = line.text;
    const indentMatch = text.match(/^(\s*)/);
    return indentMatch ? indentMatch[1] : '';
}
//# sourceMappingURL=runtime-analyzer-commands.js.map