import * as vscode from 'vscode';
import { UserConfirmationService } from '../services/ui/UserConfirmationService';
import { WebviewPanelManager } from '../utils/webviewPanelManager';
import {
    ConfirmationSettings,
    getConfirmationSettingsPanel,
    getConfirmationSettingsScript,
    getConfirmationSettingsStyles
} from '../webview/confirmationSettings';

/**
 * Command handler for confirmation settings
 */
export class ConfirmationSettingsCommand {
    private readonly confirmationService: UserConfirmationService;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.confirmationService = UserConfirmationService.getInstance(context);
    }

    /**
     * Execute the command to show confirmation settings panel
     */
    public async execute(): Promise<void> {
        const panel = WebviewPanelManager.createOrShowPanel(
            'confirmationSettingsPanel',
            'Confirmation Settings',
            vscode.ViewColumn.One
        );

        panel.webview.html = this.getWebviewContent();

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'saveConfirmationSettings':
                    await this.handleSaveSettings(message.settings);
                    vscode.window.showInformationMessage('Confirmation settings updated');
                    break;

                case 'resetConfirmationSettings':
                    await this.handleResetSettings();
                    panel.webview.html = this.getWebviewContent();
                    vscode.window.showInformationMessage('Confirmation settings reset to defaults');
                    break;

                case 'resetPromptTypes':
                    await this.handleResetPromptTypes();
                    vscode.window.showInformationMessage('All prompt type settings have been reset');
                    break;
            }
        }, undefined, []);
    }

    /**
     * Generate the HTML content for the webview
     */
    private getWebviewContent(): string {
        const settings: ConfirmationSettings = {
            disableContinuePrompts: this.confirmationService.areContinuePromptsDisabled(),
            showNotificationsForLongOperations: this.confirmationService['_preferences'].notificationPreferences.showNotificationsForLongOperations,
            longOperationThresholdSeconds: Math.floor(this.confirmationService['_preferences'].notificationPreferences.longOperationThresholdMs / 1000)
        };

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation Settings</title>
            <style>
                ${getConfirmationSettingsStyles()}

                /* Additional Styles for Notifications */
                .notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 24px;
                    border-radius: 4px;
                    color: white;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 0.3s, transform 0.3s;
                }

                .notification.show {
                    opacity: 1;
                    transform: translateY(0);
                }

                .notification.info {
                    background-color: var(--vscode-notificationsInfoBackground, #007acc);
                }

                .notification.warning {
                    background-color: var(--vscode-notificationsWarningBackground, #ddb100);
                }

                .notification.error {
                    background-color: var(--vscode-notificationsErrorBackground, #d83131);
                }
            </style>
        </head>
        <body>
            ${getConfirmationSettingsPanel(settings)}

            <script>
                ${getConfirmationSettingsScript()}
            </script>
        </body>
        </html>
        `;
    }

    /**
     * Handle saving the settings from the webview
     */
    private async handleSaveSettings(settings: ConfirmationSettings): Promise<void> {
        await this.confirmationService.setDisableContinuePrompts(settings.disableContinuePrompts);
        await this.confirmationService.setShowNotificationsForLongOperations(settings.showNotificationsForLongOperations);
        await this.confirmationService.setLongOperationThreshold(settings.longOperationThresholdSeconds * 1000);
    }

    /**
     * Handle resetting settings to defaults
     */
    private async handleResetSettings(): Promise<void> {
        const defaultSettings = {
            disableContinuePrompts: false,
            showNotificationsForLongOperations: true,
            longOperationThresholdSeconds: 5
        };

        await this.handleSaveSettings(defaultSettings);
    }

    /**
     * Reset all disabled prompt types
     */
    private async handleResetPromptTypes(): Promise<void> {
        if (this.confirmationService['_preferences'].disabledPromptTypes) {
            this.confirmationService['_preferences'].disabledPromptTypes = [];
            await this.confirmationService['savePreferences']();
        }
    }
}
