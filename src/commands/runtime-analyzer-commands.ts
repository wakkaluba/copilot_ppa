import * as vscode from 'vscode';
import { runtimeAnalyzer } from '../runtime-analyzer';

/**
 * Register runtime analyzer commands with VS Code
 */
export function registerRuntimeAnalyzerCommands(context: vscode.ExtensionContext): void {
    // Start recording runtime metrics
    context.subscriptions.push(
        vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.startRecording', () => {
            runtimeAnalyzer.startRecording();
            vscode.window.showInformationMessage('Runtime analysis recording started');
        })
    );

    // Stop recording runtime metrics
    context.subscriptions.push(
        vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.stopRecording', () => {
            runtimeAnalyzer.stopRecording();
            vscode.window.showInformationMessage('Runtime analysis recording stopped');
        })
    );

    // Export runtime analysis results
    context.subscriptions.push(
        vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.exportResults', async () => {
            const options: vscode.SaveDialogOptions = {
                defaultUri: vscode.Uri.file('runtime-analysis-results.json'),
                filters: {
                    'JSON files': ['json'],
                    'All files': ['*']
                }
            };

            const uri = await vscode.window.showSaveDialog(options);
            if (uri) {
                runtimeAnalyzer.exportResults(uri.fsPath);
            }
        })
    );

    // Visualize runtime analysis results
    context.subscriptions.push(
        vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.visualize', () => {
            runtimeAnalyzer.visualizeResults();
        })
    );

    // Add runtime analyzer markers to selected code
    context.subscriptions.push(
        vscode.commands.registerCommand('localLLMAgent.runtimeAnalyzer.addMarkers', async () => {
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
            const markedCode = 
`${indentation}// START performance marker: ${markerId}
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
        })
    );
}

/**
 * Get the indentation at a specific line
 */
function getIndentation(document: vscode.TextDocument, lineNumber: number): string {
    const line = document.lineAt(lineNumber);
    const text = line.text;
    const indentMatch = text.match(/^(\s*)/);
    return indentMatch ? indentMatch[1] : '';
}
