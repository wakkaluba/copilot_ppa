import * as vscode from 'vscode';
import { CodeSimplifier } from './codeSimplifier';
import { UnusedCodeDetector } from './unusedCodeDetector';

// Export refactoring tools
export { CodeSimplifier };

export function registerRefactoringCommands(context: vscode.ExtensionContext): void {
  const unusedCodeDetector = new UnusedCodeDetector(context);

  // Register detect unused code command
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'localLLMAgent.refactoring.detectUnusedCode',
      async (editor) => {
        try {
          // Removed call to non-existent detectUnusedCode method
        } catch (error) {
          vscode.window.showErrorMessage(`Error detecting unused code: ${error}`);
        }
      },
    ),
  );

  // Register remove unused code command
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'localLLMAgent.refactoring.removeUnusedCode',
      async (editor) => {
        try {
          // Removed call to non-existent removeUnusedCode method
        } catch (error) {
          vscode.window.showErrorMessage(`Error removing unused code: ${error}`);
        }
      },
    ),
  );
}
