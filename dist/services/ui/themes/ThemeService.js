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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Handles VS Code theme integration and color detection
 */
class ThemeService {
    constructor(onVSCodeThemeChange) {
        this.onVSCodeThemeChange = onVSCodeThemeChange;
        this.disposables = [];
        // Watch for VS Code theme changes
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(theme => {
            this.onVSCodeThemeChange(theme.kind);
        }));
    }
    /**
     * Get colors from the current VS Code theme
     */
    getCurrentVSCodeColors() {
        const theme = vscode.window.activeColorTheme;
        const getColor = (id, fallback) => {
            const color = theme.getColor(id);
            return color ? color.toString() : fallback;
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
    /**
     * Create a theme based on the current VS Code theme
     */
    createVSCodeMatchingTheme() {
        const isLight = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light;
        return {
            id: 'vscode-theme',
            name: 'VS Code Theme',
            isBuiltIn: true,
            colors: this.getCurrentVSCodeColors(),
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                sizeInPixels: 14,
                lineHeight: 1.5,
                weight: 400,
                headingWeight: 700,
                useMonospaceForCode: true
            }
        };
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.ThemeService = ThemeService;
//# sourceMappingURL=ThemeService.js.map