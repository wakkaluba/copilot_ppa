"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewProvider = void 0;
var themeManager_1 = require("../services/ui/themeManager");
var displaySettingsService_1 = require("../services/displaySettingsService");
// Assuming this is an existing file, we'll add theme support to it
var WebviewProvider = /** @class */ (function () {
    function WebviewProvider() {
    }
    // ...existing code...
    WebviewProvider.prototype.getCommonStyles = function () {
        // Get the current theme
        var themeManager = themeManager_1.ThemeManager.getInstance();
        var theme = themeManager.getCurrentTheme();
        var themeCss = themeManager.getThemeCss(theme);
        // Get display settings
        var displaySettingsService = displaySettingsService_1.DisplaySettingsService.getInstance();
        var displayCss = displaySettingsService.getCssVariables();
        return "\n            ".concat(themeCss, "\n            ").concat(displayCss, "\n            \n            body {\n                margin: 0;\n                padding: 0;\n                font-family: var(--vscode-font-family);\n                background-color: var(--copilot-ppa-background);\n                color: var(--copilot-ppa-foreground);\n                font-size: var(--agent-font-size, 14px);\n            }\n            \n            /* ...rest of common styles... */\n        ");
    };
    return WebviewProvider;
}());
exports.WebviewProvider = WebviewProvider;
