import * as vscode from 'vscode';
import { Theme, ThemeColors, FontSettings, UILayoutOptions, ThemeChangeEvent, UIOptionsChangeEvent, IThemeService } from './themes/interfaces';
import { defaultThemes } from './themes/defaults';
import { CSSGenerator } from './themes/cssGenerator';
import { inject, injectable } from 'inversify';

/**
 * Manager for UI themes and customization
 */
@injectable()
export class ThemeManager implements IThemeService {
    private static instance: ThemeManager;
    private readonly themes: Map<string, Theme> = new Map();
    private activeThemeId: string;
    private customSettings: UILayoutOptions;
    private readonly disposables: vscode.Disposable[] = [];

    private readonly _onThemeChanged = new vscode.EventEmitter<ThemeChangeEvent>();
    private readonly _onUIOptionsChanged = new vscode.EventEmitter<UIOptionsChangeEvent>();

    public readonly onThemeChanged = this._onThemeChanged.event;
    public readonly onUIOptionsChanged = this._onUIOptionsChanged.event;

    constructor(
        @inject('ExtensionContext') private readonly context: vscode.ExtensionContext,
        @inject('ThemeStorage') private readonly storage: IThemeStorage
    ) {
        // Initialize with default themes
        this.registerDefaultThemes();
        
        // Load saved theme preference
        this.activeThemeId = this.loadThemePreference();
        
        // Load custom UI settings
        this.customSettings = this.loadUISettings();
        
        // Watch for VS Code theme changes
        this.setupVSCodeThemeWatcher();
    }

    public static getInstance(context?: vscode.ExtensionContext): ThemeManager {
        if (!ThemeManager.instance) {
            if (!context) {
                throw new Error('Context is required when first initializing ThemeManager');
            }
            ThemeManager.instance = new ThemeManager(context);
        }
        return ThemeManager.instance;
    }

    private loadThemePreference(): string {
        return this.context.globalState.get('copilotPPA.activeTheme', 'default');
    }

    private loadUISettings(): UILayoutOptions {
        return this.context.globalState.get<UILayoutOptions>('copilotPPA.uiLayoutOptions', {
            chatInputPosition: 'bottom',
            showTimestamps: true,
            showAvatars: true,
            compactMode: false,
            expandCodeBlocks: true,
            wordWrap: true
        });
    }

    private setupVSCodeThemeWatcher(): void {
        vscode.window.onDidChangeActiveColorTheme(this.handleVSCodeThemeChange, this);
    }

    private handleVSCodeThemeChange(colorTheme: vscode.ColorTheme): void {
        // Auto-switch between light and dark themes based on VS Code theme
        if (this.activeThemeId === 'default' || this.activeThemeId === 'dark') {
            const newThemeId = colorTheme.kind === vscode.ColorThemeKind.Light ? 'default' : 'dark';
            if (newThemeId !== this.activeThemeId) {
                this.setActiveTheme(newThemeId);
            }
        }
    }

    public getThemes(): Theme[] {
        return Array.from(this.themes.values());
    }
    
    public getTheme(id: string): Theme | undefined {
        return this.themes.get(id);
    }
    
    public getActiveTheme(): Theme {
        return this.themes.get(this.activeThemeId) || this.themes.get('default')!;
    }
    
    public setActiveTheme(id: string): boolean {
        if (!this.themes.has(id)) {
            return false;
        }
        
        const previousTheme = this.getActiveTheme();
        this.activeThemeId = id;
        void this.context.globalState.update('copilotPPA.activeTheme', id);
        
        this._onThemeChanged.fire({
            theme: this.getActiveTheme(),
            previous: previousTheme
        });
        
        return true;
    }
    
    public registerTheme(theme: Theme): void {
        this.themes.set(theme.id, theme);
    }
    
    public createCustomTheme(name: string, baseThemeId: string, customizations: Partial<ThemeColors & FontSettings>): Theme | undefined {
        const baseTheme = this.getTheme(baseThemeId);
        if (!baseTheme) {
            return undefined;
        }
        
        const id = `custom-${Date.now()}`;
        const newTheme: Theme = {
            id,
            name,
            type: baseTheme.type,
            isBuiltIn: false,
            colors: { ...baseTheme.colors },
            font: { ...baseTheme.font }
        };
        
        // Apply customizations
        Object.entries(customizations).forEach(([key, value]) => {
            if (key in newTheme.colors) {
                (newTheme.colors as any)[key] = value;
            } else if (key in newTheme.font) {
                (newTheme.font as any)[key] = value;
            }
        });
        
        this.registerTheme(newTheme);
        void this.saveCustomThemes();
        
        return newTheme;
    }
    
    public deleteCustomTheme(id: string): boolean {
        const theme = this.getTheme(id);
        if (!theme || theme.isBuiltIn) {
            return false;
        }
        
        const success = this.themes.delete(id);
        
        // Switch to default if the deleted theme was active
        if (success && this.activeThemeId === id) {
            this.setActiveTheme('default');
        }
        
        void this.saveCustomThemes();
        return success;
    }
    
    public getUILayoutOptions(): UILayoutOptions {
        return { ...this.customSettings };
    }
    
    public updateUILayoutOptions(options: Partial<UILayoutOptions>): UILayoutOptions {
        const previousOptions = { ...this.customSettings };
        this.customSettings = { ...this.customSettings, ...options };
        void this.context.globalState.update('copilotPPA.uiLayoutOptions', this.customSettings);
        
        this._onUIOptionsChanged.fire({
            options: this.customSettings,
            previous: previousOptions
        });
        
        return this.customSettings;
    }

    private registerDefaultThemes(): void {
        // Register all default themes
        defaultThemes.forEach(theme => this.registerTheme(theme));
        
        // Load any saved custom themes
        void this.loadCustomThemes();
    }

    private async loadCustomThemes(): Promise<void> {
        const customThemes = this.context.globalState.get<Theme[]>('copilotPPA.customThemes', []);
        customThemes.forEach(theme => this.registerTheme(theme));
    }

    private async saveCustomThemes(): Promise<void> {
        const customThemes = this.getThemes().filter(theme => !theme.isBuiltIn);
        await this.context.globalState.update('copilotPPA.customThemes', customThemes);
    }

    public getThemeCSS(): string {
        return CSSGenerator.generateThemeCSS(this.getActiveTheme());
    }
    
    public getUILayoutCSS(): string {
        return CSSGenerator.generateLayoutCSS(this.customSettings);
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}

// Singleton instance
let themeManager: ThemeManager | undefined;

/**
 * Initialize the theme manager
 */
export function initializeThemeManager(context: vscode.ExtensionContext): ThemeManager {
    themeManager = ThemeManager.getInstance(context);
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

export class ThemeService {
    private static instance: ThemeService;
    
    private constructor() {}

    public static getInstance(): ThemeService {
        if (!ThemeService.instance) {
            ThemeService.instance = new ThemeService();
        }
        return ThemeService.instance;
    }

    public getCurrentTheme(): ThemeColors {
        const colorTheme = vscode.window.activeColorTheme;
        const isDark = colorTheme.kind === vscode.ColorThemeKind.Dark;

        return {
            primary: isDark ? '#0098ff' : '#007acc',
            secondary: isDark ? '#abb2bf' : '#6c757d',
            background: isDark ? '#282c34' : '#ffffff',
            foreground: isDark ? '#abb2bf' : '#333333',
            agentMessageBackground: isDark ? '#2c313c' : '#f1f8ff',
            agentMessageForeground: isDark ? '#abb2bf' : '#333333',
            userMessageBackground: isDark ? '#3b4048' : '#e9ecef',
            userMessageForeground: isDark ? '#abb2bf' : '#333333',
            systemMessage: isDark ? '#7f848e' : '#6c757d',
            error: isDark ? '#e06c75' : '#dc3545',
            success: isDark ? '#98c379' : '#28a745',
            border: isDark ? '#3e4452' : '#dee2e6',
            buttonBackground: isDark ? '#0098ff' : '#007acc',
            buttonForeground: isDark ? '#ffffff' : '#ffffff',
            buttonHoverBackground: isDark ? '#007acc' : '#005fa3',
            inputBackground: isDark ? '#3b4048' : '#ffffff',
            inputForeground: isDark ? '#abb2bf' : '#333333',
            inputBorder: isDark ? '#4b5261' : '#ced4da'
        };
    }
}
