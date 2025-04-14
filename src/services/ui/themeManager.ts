import * as vscode from 'vscode';

/**
 * Theme definition interface
 */
export interface Theme {
    /**
     * Unique ID for the theme
     */
    id: string;
    
    /**
     * Display name for the theme
     */
    name: string;
    
    /**
     * Whether this is a built-in theme
     */
    isBuiltIn: boolean;
    
    /**
     * Color variables for the theme
     */
    colors: ThemeColors;
    
    /**
     * Font settings
     */
    font: FontSettings;
}

/**
 * Theme colors definition
 */
export interface ThemeColors {
    /**
     * Primary color for actions, buttons, etc.
     */
    primary: string;
    
    /**
     * Secondary color for less emphasized elements
     */
    secondary: string;
    
    /**
     * Background color for main panels
     */
    background: string;
    
    /**
     * Foreground color for text
     */
    foreground: string;
    
    /**
     * Background color for the agent's messages
     */
    agentMessageBackground: string;
    
    /**
     * Text color for the agent's messages
     */
    agentMessageForeground: string;
    
    /**
     * Background color for the user's messages
     */
    userMessageBackground: string;
    
    /**
     * Text color for the user's messages
     */
    userMessageForeground: string;
    
    /**
     * Color for system messages and notifications
     */
    systemMessage: string;
    
    /**
     * Color for errors and warnings
     */
    error: string;
    
    /**
     * Color for success messages
     */
    success: string;
    
    /**
     * Border color
     */
    border: string;
}

/**
 * Font settings for the UI
 */
export interface FontSettings {
    /**
     * Font family
     */
    family: string;
    
    /**
     * Base font size in pixels
     */
    sizeInPixels: number;
    
    /**
     * Line height as a multiplier
     */
    lineHeight: number;
    
    /**
     * Font weight for normal text
     */
    weight: string | number;
    
    /**
     * Font weight for headings
     */
    headingWeight: string | number;
    
    /**
     * Use monospace font for code blocks
     */
    useMonospaceForCode: boolean;
}

/**
 * UI layout options
 */
export interface UILayoutOptions {
    /**
     * Position of the chat input field
     */
    chatInputPosition: 'bottom' | 'top';
    
    /**
     * Show timestamps on messages
     */
    showTimestamps: boolean;
    
    /**
     * Show avatar icons for messages
     */
    showAvatars: boolean;
    
    /**
     * Compact mode for messages
     */
    compactMode: boolean;
    
    /**
     * Expand code blocks by default
     */
    expandCodeBlocks: boolean;
    
    /**
     * Wrap long lines in chat
     */
    wordWrap: boolean;
}

/**
 * Manager for UI themes and customization
 */
export class ThemeManager {
    private themes: Map<string, Theme> = new Map();
    private activeThemeId: string = 'default';
    private customSettings: UILayoutOptions;
    
    constructor(private context: vscode.ExtensionContext) {
        // Initialize with default themes
        this.registerDefaultThemes();
        
        // Load saved theme preference
        this.activeThemeId = context.globalState.get('copilotPPA.activeTheme', 'default');
        
        // Load custom UI settings
        this.customSettings = context.globalState.get<UILayoutOptions>('copilotPPA.uiLayoutOptions', {
            chatInputPosition: 'bottom',
            showTimestamps: true,
            showAvatars: true,
            compactMode: false,
            expandCodeBlocks: true,
            wordWrap: true
        });
        
        // Watch for VS Code theme changes to update themes if needed
        vscode.window.onDidChangeActiveColorTheme(this.handleVSCodeThemeChange, this);
    }
    
    /**
     * Get all available themes
     */
    public getThemes(): Theme[] {
        return Array.from(this.themes.values());
    }
    
    /**
     * Get a theme by ID
     */
    public getTheme(id: string): Theme | undefined {
        return this.themes.get(id);
    }
    
    /**
     * Get the active theme
     */
    public getActiveTheme(): Theme {
        return this.themes.get(this.activeThemeId) || this.themes.get('default')!;
    }
    
    /**
     * Set the active theme
     */
    public setActiveTheme(id: string): boolean {
        if (!this.themes.has(id)) {
            return false;
        }
        
        this.activeThemeId = id;
        this.context.globalState.update('copilotPPA.activeTheme', id);
        this.notifyThemeChange();
        return true;
    }
    
    /**
     * Register a new theme
     */
    public registerTheme(theme: Theme): void {
        this.themes.set(theme.id, theme);
    }
    
    /**
     * Create a custom theme based on an existing one
     */
    public createCustomTheme(name: string, baseThemeId: string, customizations: Partial<ThemeColors & FontSettings>): Theme | undefined {
        const baseTheme = this.getTheme(baseThemeId);
        if (!baseTheme) {
            return undefined;
        }
        
        const id = `custom-${Date.now()}`;
        const newTheme: Theme = {
            id,
            name,
            isBuiltIn: false,
            colors: { ...baseTheme.colors },
            font: { ...baseTheme.font }
        };
        
        // Apply customizations
        for (const [key, value] of Object.entries(customizations)) {
            if (key in newTheme.colors) {
                (newTheme.colors as any)[key] = value;
            } else if (key in newTheme.font) {
                (newTheme.font as any)[key] = value;
            }
        }
        
        this.registerTheme(newTheme);
        
        // Save custom themes to storage
        this.saveCustomThemes();
        
        return newTheme;
    }
    
    /**
     * Delete a custom theme
     */
    public deleteCustomTheme(id: string): boolean {
        const theme = this.getTheme(id);
        if (!theme || theme.isBuiltIn) {
            return false;
        }
        
        const success = this.themes.delete(id);
        
        // If the deleted theme was active, switch to default
        if (success && this.activeThemeId === id) {
            this.setActiveTheme('default');
        }
        
        // Save updated custom themes
        this.saveCustomThemes();
        
        return success;
    }
    
    /**
     * Get the UI layout options
     */
    public getUILayoutOptions(): UILayoutOptions {
        return { ...this.customSettings };
    }
    
    /**
     * Update UI layout options
     */
    public updateUILayoutOptions(options: Partial<UILayoutOptions>): UILayoutOptions {
        this.customSettings = { ...this.customSettings, ...options };
        this.context.globalState.update('copilotPPA.uiLayoutOptions', this.customSettings);
        this.notifyUIOptionsChange();
        return this.customSettings;
    }
    
    /**
     * Get CSS variables for the current theme
     */
    public getThemeCSS(): string {
        const theme = this.getActiveTheme();
        
        return `
            :root {
                --copilot-primary: ${theme.colors.primary};
                --copilot-secondary: ${theme.colors.secondary};
                --copilot-background: ${theme.colors.background};
                --copilot-foreground: ${theme.colors.foreground};
                --copilot-agent-message-bg: ${theme.colors.agentMessageBackground};
                --copilot-agent-message-fg: ${theme.colors.agentMessageForeground};
                --copilot-user-message-bg: ${theme.colors.userMessageBackground};
                --copilot-user-message-fg: ${theme.colors.userMessageForeground};
                --copilot-system-message: ${theme.colors.systemMessage};
                --copilot-error: ${theme.colors.error};
                --copilot-success: ${theme.colors.success};
                --copilot-border: ${theme.colors.border};
                
                --copilot-font-family: ${theme.font.family};
                --copilot-font-size: ${theme.font.sizeInPixels}px;
                --copilot-line-height: ${theme.font.lineHeight};
                --copilot-font-weight: ${theme.font.weight};
                --copilot-heading-weight: ${theme.font.headingWeight};
            }
        `;
    }
    
    /**
     * Get CSS for UI layout options
     */
    public getUILayoutCSS(): string {
        const options = this.getUILayoutOptions();
        
        return `
            .copilot-container {
                flex-direction: ${options.chatInputPosition === 'top' ? 'column-reverse' : 'column'};
            }
            
            .copilot-message {
                padding: ${options.compactMode ? '6px 8px' : '12px 16px'};
                margin: ${options.compactMode ? '4px 0' : '8px 0'};
            }
            
            .copilot-timestamp {
                display: ${options.showTimestamps ? 'block' : 'none'};
            }
            
            .copilot-avatar {
                display: ${options.showAvatars ? 'flex' : 'none'};
            }
            
            .copilot-code-block {
                max-height: ${options.expandCodeBlocks ? 'none' : '200px'};
            }
            
            .copilot-chat-content {
                white-space: ${options.wordWrap ? 'pre-wrap' : 'pre'};
            }
        `;
    }
    
    /**
     * Register default built-in themes
     */
    private registerDefaultThemes(): void {
        // Default light theme
        this.registerTheme({
            id: 'default',
            name: 'Default Light',
            isBuiltIn: true,
            colors: {
                primary: '#007acc',
                secondary: '#6c757d',
                background: '#ffffff',
                foreground: '#333333',
                agentMessageBackground: '#f1f8ff',
                agentMessageForeground: '#333333',
                userMessageBackground: '#e9ecef',
                userMessageForeground: '#333333',
                systemMessage: '#6c757d',
                error: '#dc3545',
                success: '#28a745',
                border: '#dee2e6'
            },
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 14,
                lineHeight: 1.5,
                weight: 400,
                headingWeight: 700,
                useMonospaceForCode: true
            }
        });
        
        // Dark theme
        this.registerTheme({
            id: 'dark',
            name: 'Default Dark',
            isBuiltIn: true,
            colors: {
                primary: '#0098ff',
                secondary: '#abb2bf',
                background: '#282c34',
                foreground: '#abb2bf',
                agentMessageBackground: '#2c313c',
                agentMessageForeground: '#abb2bf',
                userMessageBackground: '#3b4048',
                userMessageForeground: '#abb2bf',
                systemMessage: '#7f848e',
                error: '#e06c75',
                success: '#98c379',
                border: '#3e4452'
            },
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 14,
                lineHeight: 1.5,
                weight: 400,
                headingWeight: 700,
                useMonospaceForCode: true
            }
        });
        
        // High Contrast theme
        this.registerTheme({
            id: 'high-contrast',
            name: 'High Contrast',
            isBuiltIn: true,
            colors: {
                primary: '#1aebff',
                secondary: '#ffffff',
                background: '#000000',
                foreground: '#ffffff',
                agentMessageBackground: '#1e1e1e',
                agentMessageForeground: '#ffffff',
                userMessageBackground: '#0e0e0e',
                userMessageForeground: '#ffffff',
                systemMessage: '#d4d4d4',
                error: '#f48771',
                success: '#89d185',
                border: '#6b6b6b'
            },
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 16,
                lineHeight: 1.6,
                weight: 500,
                headingWeight: 800,
                useMonospaceForCode: true
            }
        });
        
        // Load any saved custom themes
        this.loadCustomThemes();
    }
    
    /**
     * Handle VS Code theme changes
     */
    private handleVSCodeThemeChange(colorTheme: vscode.ColorTheme): void {
        // Auto-switch between light and dark themes based on VS Code theme
        if (this.activeThemeId === 'default' || this.activeThemeId === 'dark') {
            const newThemeId = colorTheme.kind === vscode.ColorThemeKind.Light ? 'default' : 'dark';
            if (newThemeId !== this.activeThemeId) {
                this.setActiveTheme(newThemeId);
            }
        }
    }
    
    /**
     * Notify about theme changes
     */
    private notifyThemeChange(): void {
        vscode.commands.executeCommand('copilotPPA.themeChanged', this.getActiveTheme());
    }
    
    /**
     * Notify about UI option changes
     */
    private notifyUIOptionsChange(): void {
        vscode.commands.executeCommand('copilotPPA.uiOptionsChanged', this.getUILayoutOptions());
    }
    
    /**
     * Save custom themes to storage
     */
    private saveCustomThemes(): void {
        const customThemes = Array.from(this.themes.values()).filter(theme => !theme.isBuiltIn);
        this.context.globalState.update('copilotPPA.customThemes', customThemes);
    }
    
    /**
     * Load custom themes from storage
     */
    private loadCustomThemes(): void {
        const customThemes = this.context.globalState.get<Theme[]>('copilotPPA.customThemes', []);
        for (const theme of customThemes) {
            this.registerTheme(theme);
        }
    }
}

// Singleton instance
let themeManager: ThemeManager | undefined;

/**
 * Initialize the theme manager
 */
export function initializeThemeManager(context: vscode.ExtensionContext): ThemeManager {
    themeManager = new ThemeManager(context);
    return themeManager;
}

/**
 * Get the theme manager instance
 */
export function getThemeManager(): ThemeManager {
    if (!themeManager) {
        throw new Error('Theme Manager not initialized');
    }
    return themeManager;
}
