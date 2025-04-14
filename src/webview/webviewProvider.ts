import * as vscode from 'vscode';
import { ThemeManager } from '../services/themeManager';
import { DisplaySettingsService } from '../services/displaySettingsService';

// Assuming this is an existing file, we'll add theme support to it
export class WebviewProvider {
    // ...existing code...

    protected getCommonStyles(): string {
        // Get the current theme
        const themeManager = ThemeManager.getInstance();
        const theme = themeManager.getCurrentTheme();
        const themeCss = themeManager.getThemeCss(theme);
        
        // Get display settings
        const displaySettingsService = DisplaySettingsService.getInstance();
        const displayCss = displaySettingsService.getCssVariables();
        
        return `
            ${themeCss}
            ${displayCss}
            
            body {
                margin: 0;
                padding: 0;
                font-family: var(--vscode-font-family);
                background-color: var(--copilot-ppa-background);
                color: var(--copilot-ppa-foreground);
                font-size: var(--agent-font-size, 14px);
            }
            
            /* ...rest of common styles... */
        `;
    }

    // ...existing code...
}