import * as vscode from 'vscode';
import { Theme, ThemeColors, FontSettings } from './ui/themes/interfaces';
import { ThemeManager as UIThemeManager } from './ui/themeManager';

/**
 * @deprecated Use ThemeManager from './ui/themeManager' instead.
 * This file will be removed in a future release.
 */
export class ThemeManager implements vscode.Disposable {
    private static instance: ThemeManager;

    private constructor(_context: vscode.ExtensionContext) {
        console.warn('ThemeManager is deprecated. Use ThemeManager from ./ui/themeManager instead.');
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

    public getCurrentTheme(): Theme {
        return UIThemeManager.getInstance().getActiveTheme();
    }

    public dispose(): void {
        // Nothing to dispose
    }
}

// Re-export types and interfaces from the new location
export { Theme, ThemeColors, FontSettings } from './ui/themes/interfaces';
