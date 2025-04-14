import * as vscode from 'vscode';
import { DisplaySettingsService } from '../services/displaySettingsService';
import { WebviewPanelManager } from '../webview/webviewPanelManager';

export class DisplaySettingsCommand {
    public static readonly commandId = 'copilotPPA.openDisplaySettings';
    
    private displaySettingsService: DisplaySettingsService;
    
    constructor() {
        this.displaySettingsService = DisplaySettingsService.getInstance();
    }
    
    public register(): vscode.Disposable {
        return vscode.commands.registerCommand(DisplaySettingsCommand.commandId, () => {
            this.execute();
        });
    }
    
    private async execute(): Promise<void> {
        const panel = WebviewPanelManager.createOrShowPanel(
            'displaySettingsPanel',
            'Display Settings',
            vscode.ViewColumn.One
        );
        
        panel.webview.html = this.getWebviewContent();
        
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'updateDisplaySettings':
                        await this.handleUpdateSettings(message.settings);
                        vscode.window.showInformationMessage('Display settings updated');
                        break;
                    case 'resetDisplaySettings':
                        await this.handleResetSettings();
                        panel.webview.html = this.getWebviewContent();
                        vscode.window.showInformationMessage('Display settings reset to defaults');
                        break;
                }
            },
            undefined,
            []
        );
    }
    
    private async handleUpdateSettings(settings: any): Promise<void> {
        for (const [key, value] of Object.entries(settings)) {
            await this.displaySettingsService.updateSetting(
                key as any, 
                value as any
            );
        }
    }
    
    private async handleResetSettings(): Promise<void> {
        const defaultSettings = {
            fontSize: 14,
            messageSpacing: 12,
            codeBlockTheme: 'default',
            userMessageColor: '#569cd6',
            agentMessageColor: '#4ec9b0',
            timestampDisplay: true,
            compactMode: false
        };
        
        for (const [key, value] of Object.entries(defaultSettings)) {
            await this.displaySettingsService.updateSetting(
                key as any, 
                value as any
            );
        }
    }
    
    private getWebviewContent(): string {
        const currentSettings = this.displaySettingsService.getSettings();
        
        // Import the display settings UI components
        const { getDisplaySettingsPanel } = require('../webview/displaySettings');
        const { getDisplaySettingsStyles } = require('../webview/displaySettings');
        const { getDisplaySettingsScript } = require('../webview/displaySettings');
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Display Settings</title>
            <style>
                ${getDisplaySettingsStyles()}
                body {
                    padding: 0;
                    margin: 0;
                }
            </style>
        </head>
        <body>
            ${getDisplaySettingsPanel(currentSettings)}
            <script>
                const vscode = acquireVsCodeApi();
                ${getDisplaySettingsScript()}
            </script>
        </body>
        </html>
        `;
    }
}
