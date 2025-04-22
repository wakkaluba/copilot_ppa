"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplaySettingsService = void 0;
const vscode = __importStar(require("vscode"));
class DisplaySettingsService {
    themeManager;
    context;
    _onSettingsChanged = new vscode.EventEmitter();
    onSettingsChanged = this._onSettingsChanged.event;
    constructor(themeManager, context) {
        this.themeManager = themeManager;
        this.context = context;
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.display')) {
                this._onSettingsChanged.fire(this.getSettings());
            }
        });
        // Listen for theme changes
        this.themeManager.onThemeChanged(() => {
            this._onSettingsChanged.fire(this.getSettings());
        });
    }
    getSettings() {
        const config = vscode.workspace.getConfiguration('copilot-ppa.display');
        const theme = this.themeManager.getCurrentTheme();
        return {
            fontSize: config.get('fontSize', 14),
            fontFamily: config.get('fontFamily', 'var(--vscode-editor-font-family)'),
            lineHeight: config.get('lineHeight', 1.5),
            maxWidth: config.get('maxWidth', '800px'),
            padding: config.get('padding', '1rem'),
            theme: theme.type,
            colors: {
                background: theme.components.background,
                foreground: theme.components.foreground,
                primary: theme.components.primary,
                secondary: theme.components.secondary,
                accent: theme.components.accent,
                error: theme.components.error
            }
        };
    }
    async updateSetting(setting, value) {
        const config = vscode.workspace.getConfiguration('copilot-ppa.display');
        await config.update(setting, value, vscode.ConfigurationTarget.Global);
        this._onSettingsChanged.fire(this.getSettings());
    }
    applySettingsToElement(element) {
        const settings = this.getSettings();
        element.style.setProperty('--font-size', `${settings.fontSize}px`);
        element.style.setProperty('--font-family', settings.fontFamily);
        element.style.setProperty('--line-height', settings.lineHeight.toString());
        element.style.setProperty('--max-width', settings.maxWidth);
        element.style.setProperty('--padding', settings.padding);
        Object.entries(settings.colors).forEach(([key, value]) => {
            element.style.setProperty(`--color-${key}`, value);
        });
    }
    getCssVariables() {
        const settings = this.getSettings();
        let css = `
            :root {
                --font-size: ${settings.fontSize}px;
                --font-family: ${settings.fontFamily};
                --line-height: ${settings.lineHeight};
                --max-width: ${settings.maxWidth};
                --padding: ${settings.padding};
        `;
        Object.entries(settings.colors).forEach(([key, value]) => {
            css += `\n                --color-${key}: ${value};`;
        });
        css += '\n            }';
        return css;
    }
    dispose() {
        this._onSettingsChanged.dispose();
    }
}
exports.DisplaySettingsService = DisplaySettingsService;
//# sourceMappingURL=displaySettingsService.js.map