import * as vscode from 'vscode';
import { ThemeManager, Theme } from '../services/themeManager';
import { WebviewPanelManager } from '../webview/webviewPanelManager';

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
        
        panel.webview.html = this.getThemeSettingsHtml();
        
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'selectTheme':
                        await this.themeManager.setTheme(message.themeId);
                        break;
                    case 'createTheme':
                        await this.createCustomTheme(message.baseThemeId);
                        break;
                    case 'editTheme':
                        await this.editCustomTheme(message.themeId);
                        break;
                    case 'deleteTheme':
                        try {
                            await this.themeManager.deleteCustomTheme(message.themeId);
                            // Update the webview after deletion
                            panel.webview.html = this.getThemeSettingsHtml();
                            vscode.window.showInformationMessage('Theme deleted successfully');
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to delete theme: ${error.message}`);
                        }
                        break;
                }
            },
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
        const themes = this.themeManager.getAllThemes();
        const theme = themes.find(t => t.id === themeId);
        
        if (!theme) {
            vscode.window.showErrorMessage(`Theme with ID ${themeId} not found`);
            return;
        }
        
        const panel = WebviewPanelManager.createOrShowPanel(
            'themeEditor',
            `Edit Theme: ${theme.name}`,
            vscode.ViewColumn.One
        );
        
        panel.webview.html = this.getThemeEditorHtml(theme);
        
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'updateTheme':
                        try {
                            await this.themeManager.updateCustomTheme(themeId, {
                                name: message.name,
                                colors: message.colors
                            });
                            
                            // Update the webview to reflect changes
                            const updatedTheme = this.themeManager.getAllThemes().find(t => t.id === themeId);
                            if (updatedTheme) {
                                panel.webview.html = this.getThemeEditorHtml(updatedTheme);
                            }
                            
                            vscode.window.showInformationMessage(`Theme "${message.name}" updated successfully`);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to update theme: ${error.message}`);
                        }
                        break;
                    case 'previewTheme':
                        // Apply theme temporarily for preview without saving
                        await this.themeManager.setTheme(themeId);
                        break;
                    case 'applyTheme':
                        // Apply and save as current theme
                        await this.themeManager.setTheme(themeId);
                        vscode.window.showInformationMessage(`Theme "${theme.name}" applied`);
                        break;
                }
            },
            undefined,
            []
        );
    }
    
    private getThemeSettingsHtml(): string {
        const currentTheme = this.themeManager.getCurrentTheme();
        const allThemes = this.themeManager.getAllThemes();
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Theme Settings</title>
            <style>
                body {
                    padding: 16px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                
                h1, h2, h3 {
                    font-weight: normal;
                    margin-top: 24px;
                    margin-bottom: 16px;
                }
                
                .themes-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                    margin-top: 24px;
                }
                
                .theme-card {
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .theme-preview {
                    height: 120px;
                    position: relative;
                }
                
                .preview-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 0;
                }
                
                .preview-elements {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                
                .preview-header {
                    background-color: var(--preview-primary-background);
                    color: var(--preview-primary-foreground);
                    padding: 4px 8px;
                    border-radius: 2px;
                }
                
                .preview-messages {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .preview-message {
                    padding: 4px 8px;
                    border-radius: 2px;
                    font-size: 10px;
                }
                
                .preview-user-message {
                    background-color: var(--preview-user-message-background);
                    color: var(--preview-user-message-foreground);
                    align-self: flex-end;
                    max-width: 80%;
                }
                
                .preview-assistant-message {
                    background-color: var(--preview-assistant-message-background);
                    color: var(--preview-assistant-message-foreground);
                    align-self: flex-start;
                    max-width: 80%;
                }
                
                .preview-footer {
                    background-color: var(--preview-secondary-background);
                    color: var(--preview-secondary-foreground);
                    padding: 4px 8px;
                    border-radius: 2px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .preview-button {
                    background-color: var(--preview-accent-background);
                    color: var(--preview-accent-foreground);
                    border: none;
                    border-radius: 2px;
                    padding: 2px 4px;
                    font-size: 8px;
                }
                
                .theme-info {
                    padding: 12px;
                }
                
                .theme-title {
                    font-weight: bold;
                    margin: 0 0 8px 0;
                }
                
                .theme-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }
                
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 2px;
                    cursor: pointer;
                }
                
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .action-button {
                    padding: 4px 8px;
                    font-size: 12px;
                }
                
                .create-theme-button {
                    margin-top: 24px;
                }
                
                .built-in-heading, .custom-heading {
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 8px;
                    margin-top: 32px;
                }
                
                .selected-indicator {
                    display: inline-block;
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    margin-left: 8px;
                }
            </style>
        </head>
        <body>
            <h1>Theme Settings</h1>
            <p>Customize the appearance of the Copilot PPA interface by selecting or creating a theme.</p>
            
            <h2 class="built-in-heading">Built-in Themes</h2>
            <div class="themes-container">
                ${allThemes
                    .filter(theme => !theme.id.startsWith('custom_'))
                    .map(theme => this.renderThemeCard(theme, theme.id === currentTheme.id))
                    .join('')}
            </div>
            
            <h2 class="custom-heading">Custom Themes</h2>
            <div class="themes-container">
                ${allThemes
                    .filter(theme => theme.id.startsWith('custom_'))
                    .map(theme => this.renderThemeCard(theme, theme.id === currentTheme.id, true))
                    .join('') || '<p>No custom themes created yet.</p>'}
            </div>
            
            <button class="create-theme-button" id="create-theme-btn">Create Custom Theme</button>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                document.addEventListener('DOMContentLoaded', () => {
                    setupEventListeners();
                });
                
                function setupEventListeners() {
                    // Select theme buttons
                    document.querySelectorAll('.select-theme-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            const themeId = button.dataset.themeId;
                            vscode.postMessage({
                                command: 'selectTheme',
                                themeId
                            });
                        });
                    });
                    
                    // Edit theme buttons
                    document.querySelectorAll('.edit-theme-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            const themeId = button.dataset.themeId;
                            vscode.postMessage({
                                command: 'editTheme',
                                themeId
                            });
                        });
                    });
                    
                    // Delete theme buttons
                    document.querySelectorAll('.delete-theme-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            const themeId = button.dataset.themeId;
                            const themeName = button.dataset.themeName;
                            
                            if (confirm(\`Are you sure you want to delete the theme "\${themeName}"?\`)) {
                                vscode.postMessage({
                                    command: 'deleteTheme',
                                    themeId
                                });
                            }
                        });
                    });
                    
                    // Create theme button
                    document.getElementById('create-theme-btn').addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'createTheme'
                        });
                    });
                    
                    // Clone theme buttons
                    document.querySelectorAll('.clone-theme-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            const themeId = button.dataset.themeId;
                            vscode.postMessage({
                                command: 'createTheme',
                                baseThemeId: themeId
                            });
                        });
                    });
                }
            </script>
        </body>
        </html>
        `;
    }
    
    private renderThemeCard(theme: Theme, isSelected: boolean, isCustom: boolean = false): string {
        const { colors } = theme;
        
        return `
        <div class="theme-card">
            <div class="theme-preview">
                <style>
                    .preview-${theme.id} {
                        --preview-background: ${colors.background};
                        --preview-foreground: ${colors.foreground};
                        --preview-primary-background: ${colors.primaryBackground};
                        --preview-primary-foreground: ${colors.primaryForeground};
                        --preview-secondary-background: ${colors.secondaryBackground};
                        --preview-secondary-foreground: ${colors.secondaryForeground};
                        --preview-accent-background: ${colors.accentBackground};
                        --preview-accent-foreground: ${colors.accentForeground};
                        --preview-border-color: ${colors.borderColor};
                        --preview-user-message-background: ${colors.userMessageBackground};
                        --preview-user-message-foreground: ${colors.userMessageForeground};
                        --preview-assistant-message-background: ${colors.assistantMessageBackground};
                        --preview-assistant-message-foreground: ${colors.assistantMessageForeground};
                    }
                </style>
                <div class="preview-background preview-${theme.id}" style="background-color: ${colors.background};"></div>
                <div class="preview-elements preview-${theme.id}">
                    <div class="preview-header">Copilot PPA</div>
                    <div class="preview-messages">
                        <div class="preview-message preview-user-message">Hello, can you help me?</div>
                        <div class="preview-message preview-assistant-message">Yes, I'm here to assist you!</div>
                    </div>
                    <div class="preview-footer">
                        <span>Input</span>
                        <button class="preview-button">Send</button>
                    </div>
                </div>
            </div>
            <div class="theme-info">
                <div class="theme-title">
                    ${theme.name}
                    ${isSelected ? '<span class="selected-indicator">Active</span>' : ''}
                </div>
                <div class="theme-description">${theme.type} theme</div>
                <div class="theme-actions">
                    ${isSelected ? 
                        '<button class="action-button select-theme-btn" disabled>Active</button>' : 
                        `<button class="action-button select-theme-btn" data-theme-id="${theme.id}">Select</button>`}
                    
                    ${isCustom ? 
                        `<button class="action-button edit-theme-btn" data-theme-id="${theme.id}">Edit</button>
                        <button class="action-button delete-theme-btn" data-theme-id="${theme.id}" data-theme-name="${theme.name}">Delete</button>` : 
                        `<button class="action-button clone-theme-btn" data-theme-id="${theme.id}">Clone</button>`}
                </div>
            </div>
        </div>
        `;
    }
    
    private getThemeEditorHtml(theme: Theme): string {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Edit Theme: ${theme.name}</title>
            <style>
                body {
                    padding: 16px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                
                h1, h2, h3 {
                    font-weight: normal;
                    margin-top: 24px;
                    margin-bottom: 16px;
                }
                
                .theme-editor {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                
                .theme-preview {
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    padding: 16px;
                    height: 300px;
                    position: relative;
                }
                
                .preview-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .preview-header {
                    background-color: var(--preview-primary-background);
                    color: var(--preview-primary-foreground);
                    padding: 8px 16px;
                    border-bottom: 1px solid var(--preview-border-color);
                }
                
                .preview-content {
                    flex-grow: 1;
                    background-color: var(--preview-background);
                    color: var(--preview-foreground);
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .preview-message {
                    padding: 8px 12px;
                    border-radius: 4px;
                    max-width: 80%;
                }
                
                .preview-user-message {
                    background-color: var(--preview-user-message-background);
                    color: var(--preview-user-message-foreground);
                    align-self: flex-end;
                }
                
                .preview-assistant-message {
                    background-color: var(--preview-assistant-message-background);
                    color: var(--preview-assistant-message-foreground);
                    align-self: flex-start;
                }
                
                .preview-system-message {
                    background-color: var(--preview-system-message-background);
                    color: var(--preview-system-message-foreground);
                    align-self: center;
                    font-style: italic;
                }
                
                .preview-code-block {
                    background-color: var(--preview-code-block-background);
                    color: var(--preview-code-block-foreground);
                    padding: 8px;
                    border-radius: 4px;
                    font-family: monospace;
                }
                
                .preview-footer {
                    background-color: var(--preview-secondary-background);
                    color: var(--preview-secondary-foreground);
                    padding: 8px 16px;
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    border-top: 1px solid var(--preview-border-color);
                }
                
                .preview-input {
                    flex-grow: 1;
                    background-color: var(--preview-background);
                    color: var(--preview-foreground);
                    border: 1px solid var(--preview-border-color);
                    padding: 6px 12px;
                    border-radius: 4px;
                }
                
                .preview-button {
                    background-color: var(--preview-accent-background);
                    color: var(--preview-accent-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                }
                
                .color-settings {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 16px;
                }
                
                .color-group {
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    padding: 16px;
                }
                
                .color-group h3 {
                    margin-top: 0;
                    margin-bottom: 16px;
                }
                
                .color-setting {
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .color-setting label {
                    flex-grow: 1;
                    margin-right: 8px;
                }
                
                .color-setting input[type="color"] {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .theme-name-input {
                    width: 100%;
                    padding: 8px;
                    font-size: 16px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 4px;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                    justify-content: flex-end;
                }
                
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .preview-action-buttons {
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                }
            </style>
        </head>
        <body>
            <h1>Edit Theme: ${theme.name}</h1>
            
            <div class="theme-editor">
                <div>
                    <label for="theme-name">Theme Name:</label>
                    <input type="text" id="theme-name" class="theme-name-input" value="${theme.name}">
                </div>
                
                <div class="theme-preview">
                    <style id="preview-styles">
                        :root {
                            --preview-background: ${theme.colors.background};
                            --preview-foreground: ${theme.colors.foreground};
                            --preview-primary-background: ${theme.colors.primaryBackground};
                            --preview-primary-foreground: ${theme.colors.primaryForeground};
                            --preview-secondary-background: ${theme.colors.secondaryBackground};
                            --preview-secondary-foreground: ${theme.colors.secondaryForeground};
                            --preview-accent-background: ${theme.colors.accentBackground};
                            --preview-accent-foreground: ${theme.colors.accentForeground};
                            --preview-border-color: ${theme.colors.borderColor};
                            --preview-user-message-background: ${theme.colors.userMessageBackground};
                            --preview-user-message-foreground: ${theme.colors.userMessageForeground};
                            --preview-assistant-message-background: ${theme.colors.assistantMessageBackground};
                            --preview-assistant-message-foreground: ${theme.colors.assistantMessageForeground};
                            --preview-system-message-background: ${theme.colors.systemMessageBackground};
                            --preview-system-message-foreground: ${theme.colors.systemMessageForeground};
                            --preview-code-block-background: ${theme.colors.codeBlockBackground};
                            --preview-code-block-foreground: ${theme.colors.codeBlockForeground};
                        }
                    </style>
                    
                    <div class="preview-action-buttons">
                        <button id="preview-theme-btn">Preview in App</button>
                        <button id="apply-theme-btn">Apply Theme</button>
                    </div>
                    
                    <div class="preview-container">
                        <div class="preview-header">
                            Copilot PPA Agent
                        </div>
                        <div class="preview-content">
                            <div class="preview-message preview-system-message">
                                How can I help you today?
                            </div>
                            <div class="preview-message preview-user-message">
                                Can you explain how promises work in JavaScript?
                            </div>
                            <div class="preview-message preview-assistant-message">
                                Promises in JavaScript are objects that represent the eventual completion (or failure) of an asynchronous operation. Here's a simple example:
                                <div class="preview-code-block">
const myPromise = new Promise((resolve, reject) => {
  // Async operation
  setTimeout(() => {
    resolve('Operation completed!');
  }, 1000);
});

myPromise.then(result => {
  console.log(result);
});
                                </div>
                            </div>
                        </div>
                        <div class="preview-footer">
                            <input type="text" class="preview-input" placeholder="Type a message...">
                            <button class="preview-button">Send</button>
                        </div>
                    </div>
                </div>
                
                <div class="color-settings">
                    <div class="color-group">
                        <h3>Basic Colors</h3>
                        <div class="color-setting">
                            <label for="background">Background</label>
                            <input type="color" id="background" value="${theme.colors.background}">
                        </div>
                        <div class="color-setting">
                            <label for="foreground">Foreground</label>
                            <input type="color" id="foreground" value="${theme.colors.foreground}">
                        </div>
                        <div class="color-setting">
                            <label for="border-color">Border Color</label>
                            <input type="color" id="border-color" value="${theme.colors.borderColor}">
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <h3>Primary Elements</h3>
                        <div class="color-setting">
                            <label for="primary-background">Primary Background</label>
                            <input type="color" id="primary-background" value="${theme.colors.primaryBackground}">
                        </div>
                        <div class="color-setting">
                            <label for="primary-foreground">Primary Foreground</label>
                            <input type="color" id="primary-foreground" value="${theme.colors.primaryForeground}">
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <h3>Secondary Elements</h3>
                        <div class="color-setting">
                            <label for="secondary-background">Secondary Background</label>
                            <input type="color" id="secondary-background" value="${theme.colors.secondaryBackground}">
                        </div>
                        <div class="color-setting">
                            <label for="secondary-foreground">Secondary Foreground</label>
                            <input type="color" id="secondary-foreground" value="${theme.colors.secondaryForeground}">
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <h3>Accent Colors</h3>
                        <div class="color-setting">
                            <label for="accent-background">Accent Background</label>
                            <input type="color" id="accent-background" value="${theme.colors.accentBackground}">
                        </div>
                        <div class="color-setting">
                            <label for="accent-foreground">Accent Foreground</label>
                            <input type="color" id="accent-foreground" value="${theme.colors.accentForeground}">
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <h3>Message Colors: User</h3>
                        <div class="color-setting">
                            <label for="user-message-background">User Message Background</label>
                            <input type="color" id="user-message-background" value="${theme.colors.userMessageBackground}">
                        </div>
                        <div class="color-setting">
                            <label for="user-message-foreground">User Message Foreground</label>
                            <input type="color" id="user-message-foreground" value="${theme.colors.userMessageForeground}">
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <h3>Message Colors: Assistant</h3>
                        <div class="color-setting">
                            <label for="assistant-message-background">Assistant Message Background</label>
                            <input type="color" id="assistant-message-background" value="${theme.colors.assistantMessageBackground}">
                        </div>
                        <div class="color-setting">
                            <label for="assistant-message-foreground">Assistant Message Foreground</label>
                            <input type="color" id="assistant-message-foreground" value="${theme.colors.assistantMessageForeground}">
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <h3>Message Colors: System</h3>
                        <div class="color-setting">
                            <label for="system-message-background">System Message Background</label>
                            <input type="color" id="system-message-background" value="${theme.colors.systemMessageBackground}">
                        </div>
                        <div class="color-setting">
                            <label for="system-message-foreground">System Message Foreground</label>
                            <input type="color" id="system-message-foreground" value="${theme.colors.systemMessageForeground}">
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <h3>Code Block Colors</h3>
                        <div class="color-setting">
                            <label for="code-block-background">Code Block Background</label>
                            <input type="color" id="code-block-background" value="${theme.colors.codeBlockBackground}">
                        </div>
                        <div class="color-setting">
                            <label for="code-block-foreground">Code Block Foreground</label>
                            <input type="color" id="code-block-foreground" value="${theme.colors.codeBlockForeground}">
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <h3>Status Colors</h3>
                        <div class="color-setting">
                            <label for="error-color">Error Color</label>
                            <input type="color" id="error-color" value="${theme.colors.errorColor}">
                        </div>
                        <div class="color-setting">
                            <label for="warning-color">Warning Color</label>
                            <input type="color" id="warning-color" value="${theme.colors.warningColor}">
                        </div>
                        <div class="color-setting">
                            <label for="success-color">Success Color</label>
                            <input type="color" id="success-color" value="${theme.colors.successColor}">
                        </div>
                        <div class="color-setting">
                            <label for="link-color">Link Color</label>
                            <input type="color" id="link-color" value="${theme.colors.linkColor}">
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button id="save-theme-btn">Save Theme</button>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                const colorInputs = document.querySelectorAll('input[type="color"]');
                const previewStyles = document.getElementById('preview-styles');
                
                document.addEventListener('DOMContentLoaded', () => {
                    setupEventListeners();
                });
                
                function setupEventListeners() {
                    // Update preview when colors change
                    colorInputs.forEach(input => {
                        input.addEventListener('input', updatePreview);
                    });
                    
                    // Preview theme in app
                    document.getElementById('preview-theme-btn').addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'previewTheme'
                        });
                    });
                    
                    // Apply theme
                    document.getElementById('apply-theme-btn').addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'applyTheme'
                        });
                    });
                    
                    // Save theme
                    document.getElementById('save-theme-btn').addEventListener('click', saveTheme);
                }
                
                function updatePreview() {
                    const cssVars = [
                        '--preview-background: ' + document.getElementById('background').value,
                        '--preview-foreground: ' + document.getElementById('foreground').value,
                        '--preview-primary-background: ' + document.getElementById('primary-background').value,
                        '--preview-primary-foreground: ' + document.getElementById('primary-foreground').value,
                        '--preview-secondary-background: ' + document.getElementById('secondary-background').value,
                        '--preview-secondary-foreground: ' + document.getElementById('secondary-foreground').value,
                        '--preview-accent-background: ' + document.getElementById('accent-background').value,
                        '--preview-accent-foreground: ' + document.getElementById('accent-foreground').value,
                        '--preview-border-color: ' + document.getElementById('border-color').value,
                        '--preview-user-message-background: ' + document.getElementById('user-message-background').value,
                        '--preview-user-message-foreground: ' + document.getElementById('user-message-foreground').value,
                        '--preview-assistant-message-background: ' + document.getElementById('assistant-message-background').value,
                        '--preview-assistant-message-foreground: ' + document.getElementById('assistant-message-foreground').value,
                        '--preview-system-message-background: ' + document.getElementById('system-message-background').value,
                        '--preview-system-message-foreground: ' + document.getElementById('system-message-foreground').value,
                        '--preview-code-block-background: ' + document.getElementById('code-block-background').value,
                        '--preview-code-block-foreground: ' + document.getElementById('code-block-foreground').value
                    ];
                    
                    previewStyles.textContent = ':root {' + cssVars.join('; ') + '}';
                }
                
                function saveTheme() {
                    const name = document.getElementById('theme-name').value.trim();
                    
                    if (!name) {
                        alert('Please enter a theme name');
                        return;
                    }
                    
                    const colors = {
                        background: document.getElementById('background').value,
                        foreground: document.getElementById('foreground').value,
                        primaryBackground: document.getElementById('primary-background').value,
                        primaryForeground: document.getElementById('primary-foreground').value,
                        secondaryBackground: document.getElementById('secondary-background').value,
                        secondaryForeground: document.getElementById('secondary-foreground').value,
                        accentBackground: document.getElementById('accent-background').value,
                        accentForeground: document.getElementById('accent-foreground').value,
                        borderColor: document.getElementById('border-color').value,
                        errorColor: document.getElementById('error-color').value,
                        warningColor: document.getElementById('warning-color').value,
                        successColor: document.getElementById('success-color').value,
                        linkColor: document.getElementById('link-color').value,
                        userMessageBackground: document.getElementById('user-message-background').value,
                        userMessageForeground: document.getElementById('user-message-foreground').value,
                        assistantMessageBackground: document.getElementById('assistant-message-background').value,
                        assistantMessageForeground: document.getElementById('assistant-message-foreground').value,
                        systemMessageBackground: document.getElementById('system-message-background').value,
                        systemMessageForeground: document.getElementById('system-message-foreground').value,
                        codeBlockBackground: document.getElementById('code-block-background').value,
                        codeBlockForeground: document.getElementById('code-block-foreground').value
                    };
                    
                    vscode.postMessage({
                        command: 'updateTheme',
                        name,
                        colors
                    });
                }
            </script>
        </body>
        </html>
        `;
    }
}
