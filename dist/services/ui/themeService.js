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
exports.ThemeService = void 0;
const vscode = __importStar(require("vscode"));
class ThemeService {
    _currentTheme;
    disposables = [];
    constructor() {
        this._currentTheme = this.detectCurrentTheme();
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(() => {
            this._currentTheme = this.detectCurrentTheme();
        }));
    }
    detectCurrentTheme() {
        const theme = vscode.window.activeColorTheme;
        if (theme.kind === vscode.ColorThemeKind.Light) {
            return 'light';
        }
        else if (theme.kind === vscode.ColorThemeKind.Dark) {
            return 'dark';
        }
        else {
            return 'high-contrast';
        }
    }
    get currentTheme() {
        return this._currentTheme;
    }
    getCurrentVSCodeColors() {
        const getColor = (colorId, fallback) => {
            const color = vscode.workspace.getConfiguration('workbench').get(`colorCustomizations.${colorId}`);
            if (color) {
                return color;
            }
            // Fallback to default theme colors
            return this._currentTheme === 'dark' ? {
                'button.background': '#0098ff',
                'descriptionForeground': '#abb2bf',
                'editor.background': '#282c34',
                'editor.foreground': '#abb2bf',
                'editorWidget.background': '#2c313c',
                'editorWidget.foreground': '#abb2bf',
                'input.background': '#3b4048',
                'input.foreground': '#abb2bf',
                'errorForeground': '#e06c75',
                'notificationsSuccessIcon.foreground': '#98c379',
                'input.border': '#3e4452',
                'button.foreground': '#ffffff',
                'button.hoverBackground': '#007acc'
            }[colorId] || fallback : {
                'button.background': '#007acc',
                'descriptionForeground': '#717171',
                'editor.background': '#ffffff',
                'editor.foreground': '#333333',
                'editorWidget.background': '#f3f3f3',
                'editorWidget.foreground': '#333333',
                'input.background': '#ffffff',
                'input.foreground': '#333333',
                'errorForeground': '#dc3545',
                'notificationsSuccessIcon.foreground': '#28a745',
                'input.border': '#cecece',
                'button.foreground': '#ffffff',
                'button.hoverBackground': '#005fa3'
            }[colorId] || fallback;
        };
        return {
            primary: getColor('button.background', '#007acc'),
            secondary: getColor('descriptionForeground', '#717171'),
            background: getColor('editor.background', '#ffffff'),
            foreground: getColor('editor.foreground', '#333333'),
            agentMessageBackground: getColor('editorWidget.background', '#f3f3f3'),
            agentMessageForeground: getColor('editorWidget.foreground', '#333333'),
            userMessageBackground: getColor('input.background', '#ffffff'),
            userMessageForeground: getColor('input.foreground', '#333333'),
            systemMessage: getColor('descriptionForeground', '#717171'),
            error: getColor('errorForeground', '#dc3545'),
            success: getColor('notificationsSuccessIcon.foreground', '#28a745'),
            border: getColor('input.border', '#cecece'),
            buttonBackground: getColor('button.background', '#007acc'),
            buttonForeground: getColor('button.foreground', '#ffffff'),
            buttonHoverBackground: getColor('button.hoverBackground', '#005fa3'),
            inputBackground: getColor('input.background', '#ffffff'),
            inputForeground: getColor('input.foreground', '#333333'),
            inputBorder: getColor('input.border', '#cecece')
        };
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.ThemeService = ThemeService;
//# sourceMappingURL=themeService.js.map