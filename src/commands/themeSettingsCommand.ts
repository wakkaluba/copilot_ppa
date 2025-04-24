import * as vscode from 'vscode';
import { ThemeManager, Theme } from '../services/themeManager';
import { WebviewPanelManager } from '../webview/webviewPanelManager';
import { ThemeSettingsHtmlProvider } from '../ui/ThemeSettingsHtmlProvider';
import { ThemeEditorHtmlProvider } from '../ui/ThemeEditorHtmlProvider';

export class ThemeSettingsCommand {
    public static readonly commandId = 'copilotPPA.openThemeSettings';
    public static readonly createThemeCommandId = 'copilotPPA.createCustomTheme';
    
    private themeManager: ThemeManager;
    
    constructor(context: vscode.ExtensionContext) {
        this.themeManager = ThemeManager.getInstance(context);
    }
    
    public register(): vscode.Disposable[] {
        return [
            vscode.commands.registerCommand(ThemeSettingsCommand.commandId, () => {
                this.openThemeSettings();
            }),
            vscode.commands.registerCommand(ThemeSettingsCommand.createThemeCommandId, () => {
                this.createCustomTheme();
            })
        ];
    }
    
    private openThemeSettings(): void {
        const panel = WebviewPanelManager.createOrShowPanel(
            'themeSettings',
            'Theme Settings',
            vscode.ViewColumn.One
        );
        const currentTheme = this.themeManager.getCurrentTheme();
        const allThemes = this.themeManager.getAllThemes();
        panel.webview.html = ThemeSettingsHtmlProvider.getSettingsHtml(currentTheme, allThemes);
        panel.webview.onDidReceiveMessage(
            msg => this.handleSettingsMessage(msg, panel),
            undefined,
            []
        );
    }

    private async createCustomTheme(baseThemeId?: string): Promise<void> {
        // Get base theme
        let baseTheme: Theme;
        if (baseThemeId) {
            const themes = this.themeManager.getAllThemes();
            baseTheme = themes.find(t => t.id === baseThemeId) || this.themeManager.getCurrentTheme();
        } else {
            baseTheme = this.themeManager.getCurrentTheme();
        }
        
        // Show input for theme name
        const themeName = await vscode.window.showInputBox({
            prompt: 'Enter a name for your custom theme',
            placeHolder: 'My Custom Theme',
            value: `${baseTheme.name} (Custom)`
        });
        
        if (!themeName) {
            return; // User cancelled
        }
        
        // Create a new theme ID
        const themeId = `custom_${Date.now()}`;
        
        // Create a new theme based on the base theme
        const newTheme: Theme = {
            ...baseTheme,
            id: themeId,
            name: themeName
        };
        
        try {
            await this.themeManager.addCustomTheme(newTheme);
            vscode.window.showInformationMessage(`Custom theme "${themeName}" created`);
            
            // Open the theme editor
            await this.editCustomTheme(themeId);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create custom theme: ${error.message}`);
        }
    }
    
    private async editCustomTheme(themeId: string): Promise<void> {
        const theme = this.themeManager.getAllThemes().find(t => t.id === themeId);
        if (!theme) {
            vscode.window.showErrorMessage(`Theme with ID ${themeId} not found`);
            return;
        }
        const panel = WebviewPanelManager.createOrShowPanel(
            'themeEditor',
            `Edit Theme: ${theme.name}`,
            vscode.ViewColumn.One
        );
        panel.webview.html = ThemeEditorHtmlProvider.getEditorHtml(theme);
        panel.webview.onDidReceiveMessage(
            msg => this.handleEditorMessage(msg, themeId, panel),
            undefined,
            []
        );
    }

    private handleSettingsMessage(message: any, panel: vscode.WebviewPanel) {
        switch (message.command) {
            case 'selectTheme':
                this.themeManager.setTheme(message.themeId);
                break;
            case 'createTheme':
                this.createCustomTheme(message.baseThemeId);
                break;
            case 'editTheme':
                this.editCustomTheme(message.themeId);
                break;
            case 'deleteTheme':
                this.themeManager.deleteCustomTheme(message.themeId)
                    .then(() => panel.webview.html = ThemeSettingsHtmlProvider.getSettingsHtml(this.themeManager.getCurrentTheme(), this.themeManager.getAllThemes()));
                break;
        }
    }

    private handleEditorMessage(message: any, themeId: string, panel: vscode.WebviewPanel) {
        switch (message.command) {
            case 'updateTheme':
                this.themeManager.updateCustomTheme(themeId, message.data)
                    .then(() => panel.webview.html = ThemeEditorHtmlProvider.getEditorHtml(this.themeManager.getAllThemes().find(t => t.id === themeId)));
                break;
            case 'previewTheme':
                this.themeManager.setTheme(themeId);
                break;
            case 'applyTheme':
                this.themeManager.setTheme(themeId);
                break;
        }
    }
}
