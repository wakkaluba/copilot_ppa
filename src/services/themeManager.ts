import * as vscode from 'vscode';
import { EventEmitter } from 'events';

export interface Theme {
    id: string;
    name: string;
    type: 'light' | 'dark' | 'high-contrast';
    colors: Record<string, string>;
    iconTheme?: string;
}

export class ThemeManager extends EventEmitter implements vscode.Disposable {
    private currentTheme: Theme | undefined;
    private customThemes: Map<string, Theme> = new Map();
    private disposables: vscode.Disposable[] = [];
    private context: vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext) {
        super();
        this.context = context;
        
        // Load current theme
        this.detectCurrentTheme();
        
        // Listen for theme changes
        this.disposables.push(
            vscode.window.onDidChangeActiveColorTheme(e => {
                this.detectCurrentTheme();
                this.emit('themeChanged', this.currentTheme);
            })
        );
        
        // Load custom themes
        this.loadCustomThemes();
    }
    
    /**
     * Get the current VS Code theme
     */
    getCurrentTheme(): Theme | undefined {
        return this.currentTheme;
    }
    
    /**
     * Get a specific theme by ID
     */
    getTheme(id: string): Theme | undefined {
        return this.customThemes.get(id);
    }
    
    /**
     * Get all available themes
     */
    getAllThemes(): Theme[] {
        return Array.from(this.customThemes.values());
    }
    
    /**
     * Register a custom theme
     */
    registerTheme(theme: Theme): boolean {
        if (this.customThemes.has(theme.id)) {
            return false;
        }
        
        this.customThemes.set(theme.id, theme);
        this.saveCustomThemes();
        this.emit('themeAdded', theme);
        
        return true;
    }
    
    /**
     * Update a custom theme
     */
    updateTheme(id: string, updates: Partial<Theme>): boolean {
        const theme = this.customThemes.get(id);
        if (!theme) {
            return false;
        }
        
        const updatedTheme: Theme = {
            ...theme,
            ...updates,
            id // Ensure ID doesn't change
        };
        
        this.customThemes.set(id, updatedTheme);
        this.saveCustomThemes();
        this.emit('themeUpdated', updatedTheme);
        
        return true;
    }
    
    /**
     * Remove a custom theme
     */
    removeTheme(id: string): boolean {
        if (!this.customThemes.has(id)) {
            return false;
        }
        
        this.customThemes.delete(id);
        this.saveCustomThemes();
        this.emit('themeRemoved', id);
        
        return true;
    }
    
    /**
     * Get a specific color from the current theme
     */
    getColor(colorName: string): string | undefined {
        if (!this.currentTheme) {
            return undefined;
        }
        
        return this.currentTheme.colors[colorName];
    }
    
    /**
     * Get the type of the current theme
     */
    getThemeType(): 'light' | 'dark' | 'high-contrast' | undefined {
        return this.currentTheme?.type;
    }
    
    /**
     * Check if the current theme is a dark theme
     */
    isDarkTheme(): boolean {
        return this.currentTheme?.type === 'dark' || this.currentTheme?.type === 'high-contrast';
    }
    
    /**
     * Detect the current VS Code theme
     */
    private detectCurrentTheme(): void {
        const colorTheme = vscode.window.activeColorTheme;
        
        const themeType: 'light' | 'dark' | 'high-contrast' = 
            colorTheme.kind === vscode.ColorThemeKind.Light ? 'light' :
            colorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'high-contrast';
        
        // Create a theme object from the VS Code theme
        const theme: Theme = {
            id: colorTheme.id,
            name: colorTheme.label || colorTheme.id,
            type: themeType,
            colors: this.extractThemeColors()
        };
        
        this.currentTheme = theme;
    }
    
    /**
     * Extract colors from current VS Code theme
     */
    private extractThemeColors(): Record<string, string> {
        const colors: Record<string, string> = {};
        
        // Extract common colors from VS Code
        const colorIds = [
            'editor.background',
            'editor.foreground',
            'activityBar.background',
            'activityBar.foreground',
            'sideBar.background',
            'sideBar.foreground',
            'statusBar.background',
            'statusBar.foreground',
            'tab.activeBackground',
            'tab.inactiveBackground',
            'tab.activeForeground',
            'tab.inactiveForeground',
            'button.background',
            'button.foreground',
            'button.hoverBackground',
            'list.activeSelectionBackground',
            'list.activeSelectionForeground'
        ];
        
        colorIds.forEach(id => {
            const color = vscode.window.activeColorTheme.getColor(id);
            if (color) {
                colors[id] = `#${color.rgba.r.toString(16).padStart(2, '0')}${color.rgba.g.toString(16).padStart(2, '0')}${color.rgba.b.toString(16).padStart(2, '0')}`;
            }
        });
        
        return colors;
    }
    
    /**
     * Load custom themes from storage
     */
    private loadCustomThemes(): void {
        const themes = this.context.globalState.get<Theme[]>('customThemes', []);
        themes.forEach(theme => {
            this.customThemes.set(theme.id, theme);
        });
    }
    
    /**
     * Save custom themes to storage
     */
    private saveCustomThemes(): void {
        const themes = Array.from(this.customThemes.values());
        this.context.globalState.update('customThemes', themes);
    }
    
    dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.removeAllListeners();
    }
}
