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
exports.registerRefactoringCommands = exports.CodeSimplifier = void 0;
const vscode = __importStar(require("vscode"));
const codeSimplifier_1 = require("./codeSimplifier");
Object.defineProperty(exports, "CodeSimplifier", { enumerable: true, get: function () { return codeSimplifier_1.CodeSimplifier; } });
const unusedCodeDetector_1 = require("./unusedCodeDetector");
function registerRefactoringCommands(context) {
    const unusedCodeDetector = new unusedCodeDetector_1.UnusedCodeDetector(context);
    // Register detect unused code command
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('localLLMAgent.refactoring.detectUnusedCode', async (editor) => {
        try {
            const diagnostics = await unusedCodeDetector.detectUnusedCode(editor);
            if (diagnostics.length === 0) {
                vscode.window.showInformationMessage('No unused code detected in the current selection or file');
            }
            else {
                vscode.window.showInformationMessage(`Found ${diagnostics.length} unused code elements. Use the Problems panel to review them or run 'Remove Unused Code' to clean up.`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error detecting unused code: ${error}`);
        }
    }));
    // Register remove unused code command
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('localLLMAgent.refactoring.removeUnusedCode', async (editor) => {
        try {
            await unusedCodeDetector.removeUnusedCode(editor);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error removing unused code: ${error}`);
        }
    }));
}
exports.registerRefactoringCommands = registerRefactoringCommands;
//# sourceMappingURL=index.js.map