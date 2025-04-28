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
/**
 * Handles VS Code theme integration and color detection
 */
class ThemeService {
    constructor() {
        this.disposables = [];
        // Listen for VS Code theme changes
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(() => {
            this.getCurrentVSCodeColors();
        }));
    }
    /**
     * Get colors from the current VS Code theme
     */
    getCurrentVSCodeColors() {
        const getColor = (id, lightFallback, darkFallback) => {
            const color = vscode.workspace.getConfiguration().get(`workbench.colorCustomizations.${id}`);
            if (color) {
                return color;
            }
            return vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? darkFallback : lightFallback;
        };
        return {
            primary: getColor('button.background', '#007acc', '#0098ff'),
            secondary: getColor('descriptionForeground', '#717171', '#abb2bf'),
            background: getColor('editor.background', '#ffffff', '#282c34'),
            foreground: getColor('editor.foreground', '#333333', '#abb2bf'),
            agentMessageBackground: getColor('editorWidget.background', '#f3f3f3', '#2c313c'),
            agentMessageForeground: getColor('editorWidget.foreground', '#333333', '#abb2bf'),
            userMessageBackground: getColor('input.background', '#ffffff', '#3b4048'),
            userMessageForeground: getColor('input.foreground', '#333333', '#abb2bf'),
            systemMessage: getColor('descriptionForeground', '#717171', '#7f848e'),
            error: getColor('errorForeground', '#dc3545', '#e06c75'),
            success: getColor('notificationsSuccessIcon.foreground', '#28a745', '#98c379'),
            border: getColor('input.border', '#cecece', '#3e4452'),
            buttonBackground: getColor('button.background', '#007acc', '#0098ff'),
            buttonForeground: getColor('button.foreground', '#ffffff', '#ffffff'),
            buttonHoverBackground: getColor('button.hoverBackground', '#005fa3', '#007acc'),
            inputBackground: getColor('input.background', '#ffffff', '#1e2227'),
            inputForeground: getColor('input.foreground', '#333333', '#abb2bf'),
            inputBorder: getColor('input.border', '#cecece', '#3e4452')
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
            type: isLight ? 'light' : 'dark',
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