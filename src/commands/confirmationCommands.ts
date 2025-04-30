import * as vscode from 'vscode';
import { UserConfirmationService } from '../services/UserConfirmationService';
import { ConfirmationSettingsPanel } from '../webviews/ConfirmationSettingsPanel';

/**
 * Register commands related to user confirmations and settings
 */
export function registerConfirmationCommands(context: vscode.ExtensionContext): void {
    // Initialize the confirmation service
    UserConfirmationService.initialize(context);

    // Register command to open confirmation settings panel
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.openConfirmationSettings', () => {
            ConfirmationSettingsPanel.createOrShow(context.extensionUri);
        })
    );

    // Register command to reset all confirmation preferences
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.resetConfirmationSettings', async () => {
            const confirmationService = UserConfirmationService.getInstance();

            // Reset all confirmation types
            await confirmationService.enableConfirmation('file');
            await confirmationService.enableConfirmation('workspace');
            await confirmationService.enableConfirmation('process');
            await confirmationService.enableConfirmation('other');

            vscode.window.showInformationMessage('All confirmation settings have been reset');
        })
    );
}
