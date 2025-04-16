"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewProvider = void 0;
const themeManager_1 = require("../services/themeManager");
const displaySettingsService_1 = require("../services/displaySettingsService");
// Assuming this is an existing file, we'll add theme support to it
class WebviewProvider {
    // ...existing code...
    getCommonStyles() {
        // Get the current theme
        const themeManager = themeManager_1.ThemeManager.getInstance();
        const theme = themeManager.getCurrentTheme();
        const themeCss = themeManager.getThemeCss(theme);
        // Get display settings
        const displaySettingsService = displaySettingsService_1.DisplaySettingsService.getInstance();
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
}
exports.WebviewProvider = WebviewProvider;
//# sourceMappingURL=webviewProvider.js.map