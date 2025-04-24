import * as vscode from 'vscode';
import { UISettingsWebviewService, UISettingsTab } from './services/UISettingsWebviewService';
import { ThemeService } from '../services/ui/themeManager';
import { Logger } from '../utils/logger';

export class UISettingsPanel implements vscode.Disposable {
    private static instance: UISettingsPanel;
    private readonly logger: Logger;
    private readonly webviewService: UISettingsWebviewService;
    private panel?: vscode.WebviewPanel;
    private readonly disposables: vscode.Disposable[] = [];

    private constructor(private readonly context: vscode.ExtensionContext) {
        this.logger = Logger.getInstance();
        this.webviewService = new UISettingsWebviewService(ThemeService.getInstance());
    }

    public static getInstance(context: vscode.ExtensionContext): UISettingsPanel {
        if (!UISettingsPanel.instance) {
            UISettingsPanel.instance = new UISettingsPanel(context);
        }
        return UISettingsPanel.instance;
    }

    public async show(): Promise<void> {
        try {
            if (this.panel) {
                this.panel.reveal();
                return;
            }

            this.panel = vscode.window.createWebviewPanel(
                'uiSettingsPanel',
                'Settings',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
                }
            );

            const tabs: UISettingsTab[] = [
                {
                    id: 'general',
                    label: 'General',
                    content: this.getGeneralSettingsContent()
                },
                {
                    id: 'advanced',
                    label: 'Advanced',
                    content: this.getAdvancedSettingsContent()
                }
            ];

            this.panel.webview.html = this.webviewService.generateWebviewContent(tabs);

            this.registerMessageHandlers();

            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this.dispose();
            }, null, this.disposables);

        } catch (error) {
            this.logger.error('Error showing UI settings panel', error);
            throw error;
        }
    }

    private registerMessageHandlers(): void {
        if (!this.panel) return;

        this.panel.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.command) {
                    case 'tabChanged':
                        await this.handleTabChange(message.tab);
                        break;
                    case 'updateSetting':
                        await this.handleSettingUpdate(message.key, message.value);
                        break;
                    default:
                        this.logger.warn(`Unknown message command: ${message.command}`);
                }
            } catch (error) {
                this.logger.error('Error handling settings panel message', error);
                this.showErrorMessage('Failed to process command');
            }
        }, undefined, this.disposables);
    }

    public selectTab(tabName: string): void {
        if (!this.panel?.visible) return;

        try {
            this.panel.webview.postMessage({
                command: 'selectTab',
                tab: tabName
            });
        } catch (error) {
            this.logger.error('Error selecting tab', error);
            this.showErrorMessage('Failed to switch tab');
        }
    }

    private showErrorMessage(message: string): void {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'showError',
                message
            });
        }
    }

    private getGeneralSettingsContent(): string {
        return `
            <div class="setting-group">
                <h2>General Settings</h2>
                <div class="setting-item">
                    <label for="theme">Theme</label>
                    <select id="theme">
                        <option value="system">System Default</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label for="language">Language</label>
                    <select id="language">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </select>
                </div>
            </div>
        `;
    }

    private getAdvancedSettingsContent(): string {
        return `
            <div class="setting-group">
                <h2>Advanced Settings</h2>
                <div class="setting-item">
                    <label for="caching">Enable Caching</label>
                    <input type="checkbox" id="caching" />
                </div>
                <div class="setting-item">
                    <label for="logging">Logging Level</label>
                    <select id="logging">
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                    </select>
                </div>
            </div>
        `;
    }

    private async handleTabChange(tab: string): Promise<void> {
        // Implementation for tab change handling
    }

    private async handleSettingUpdate(key: string, value: string | boolean | number): Promise<void> {
        // Implementation for setting update handling
    }

    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }

        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        UISettingsPanel.instance = undefined;
    }
}