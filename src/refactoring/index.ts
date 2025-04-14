import * as vscode from 'vscode';
import { CodeSimplifier } from './codeSimplifier';
import { UnusedCodeDetector } from './unusedCodeDetector';

// Export refactoring tools
export {
    CodeSimplifier
};

export function registerRefactoringCommands(context: vscode.ExtensionContext): void {
    const unusedCodeDetector = new UnusedCodeDetector(context);
    
    // Register detect unused code command
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('localLLMAgent.refactoring.detectUnusedCode', async (editor) => {
            try {
                const diagnostics = await unusedCodeDetector.detectUnusedCode(editor);
                
                if (diagnostics.length === 0) {
                    vscode.window.showInformationMessage('No unused code detected in the current selection or file');
                } else {
                    vscode.window.showInformationMessage(`Found ${diagnostics.length} unused code elements. Use the Problems panel to review them or run 'Remove Unused Code' to clean up.`);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error detecting unused code: ${error}`);
            }
        })
    );
    
    // Register remove unused code command
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('localLLMAgent.refactoring.removeUnusedCode', async (editor) => {
            try {
                await unusedCodeDetector.removeUnusedCode(editor);
            } catch (error) {
                vscode.window.showErrorMessage(`Error removing unused code: ${error}`);
            }
        })
    );
}
