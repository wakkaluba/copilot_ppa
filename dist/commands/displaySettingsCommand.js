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
exports.DisplaySettingsCommand = void 0;
const vscode = __importStar(require("vscode"));
const displaySettingsService_1 = require("../services/displaySettingsService");
const webviewPanelManager_1 = require("../webview/webviewPanelManager");
class DisplaySettingsCommand {
    constructor() {
        this.displaySettingsService = displaySettingsService_1.DisplaySettingsService.getInstance();
    }
    register() {
        return vscode.commands.registerCommand(DisplaySettingsCommand.commandId, () => {
            this.execute();
        });
    }
    async execute() {
        const panel = webviewPanelManager_1.WebviewPanelManager.createOrShowPanel('displaySettingsPanel', 'Display Settings', vscode.ViewColumn.One);
        panel.webview.html = this.getWebviewContent();
        panel.webview.onDidReceiveMessage(async (message) => {
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
        }, undefined, []);
    }
    async handleUpdateSettings(settings) {
        for (const [key, value] of Object.entries(settings)) {
            await this.displaySettingsService.updateSetting(key, value);
        }
    }
    async handleResetSettings() {
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
            await this.displaySettingsService.updateSetting(key, value);
        }
    }
    getWebviewContent() {
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
exports.DisplaySettingsCommand = DisplaySettingsCommand;
DisplaySettingsCommand.commandId = 'copilotPPA.openDisplaySettings';
//# sourceMappingURL=displaySettingsCommand.js.map