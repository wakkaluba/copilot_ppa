"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSGenerator = void 0;
/**
 * Generates CSS variables and styles from themes and layout options
 */
var CSSGenerator = /** @class */ (function () {
    function CSSGenerator() {
    }
    /**
     * Generate CSS variables for a theme
     */
    CSSGenerator.generateThemeCSS = function (theme) {
        return "\n            :root {\n                --copilot-primary: ".concat(theme.colors.primary, ";\n                --copilot-secondary: ").concat(theme.colors.secondary, ";\n                --copilot-background: ").concat(theme.colors.background, ";\n                --copilot-foreground: ").concat(theme.colors.foreground, ";\n                --copilot-agent-message-bg: ").concat(theme.colors.agentMessageBackground, ";\n                --copilot-agent-message-fg: ").concat(theme.colors.agentMessageForeground, ";\n                --copilot-user-message-bg: ").concat(theme.colors.userMessageBackground, ";\n                --copilot-user-message-fg: ").concat(theme.colors.userMessageForeground, ";\n                --copilot-system-message: ").concat(theme.colors.systemMessage, ";\n                --copilot-error: ").concat(theme.colors.error, ";\n                --copilot-success: ").concat(theme.colors.success, ";\n                --copilot-border: ").concat(theme.colors.border, ";\n                --copilot-button-bg: ").concat(theme.colors.buttonBackground, ";\n                --copilot-button-fg: ").concat(theme.colors.buttonForeground, ";\n                --copilot-button-hover-bg: ").concat(theme.colors.buttonHoverBackground, ";\n                --copilot-input-bg: ").concat(theme.colors.inputBackground, ";\n                --copilot-input-fg: ").concat(theme.colors.inputForeground, ";\n                --copilot-input-border: ").concat(theme.colors.inputBorder, ";\n\n                --copilot-font-family: ").concat(theme.font.family, ";\n                --copilot-font-size: ").concat(theme.font.sizeInPixels, "px;\n                --copilot-line-height: ").concat(theme.font.lineHeight, ";\n                --copilot-font-weight: ").concat(theme.font.weight, ";\n                --copilot-heading-weight: ").concat(theme.font.headingWeight, ";\n                --copilot-code-font-family: ").concat(theme.font.useMonospaceForCode ?
            'var(--vscode-editor-font-family)' : 'inherit', ";\n            }\n        ");
    };
    /**
     * Generate CSS based on UI layout options
     */
    CSSGenerator.generateLayoutCSS = function (options) {
        return "\n            .copilot-container {\n                flex-direction: ".concat(options.chatInputPosition === 'top' ? 'column-reverse' : 'column', ";\n            }\n            \n            .copilot-message {\n                padding: ").concat(options.compactMode ? '6px 8px' : '12px 16px', ";\n                margin: ").concat(options.compactMode ? '4px 0' : '8px 0', ";\n            }\n            \n            .copilot-timestamp {\n                display: ").concat(options.showTimestamps ? 'block' : 'none', ";\n            }\n            \n            .copilot-avatar {\n                display: ").concat(options.showAvatars ? 'flex' : 'none', ";\n            }\n            \n            .copilot-code-block {\n                max-height: ").concat(options.expandCodeBlocks ? 'none' : '200px', ";\n            }\n            \n            .copilot-chat-content {\n                white-space: ").concat(options.wordWrap ? 'pre-wrap' : 'pre', ";\n            }\n\n            .copilot-message pre {\n                font-family: var(--copilot-code-font-family);\n            }\n        ");
    };
    return CSSGenerator;
}());
exports.CSSGenerator = CSSGenerator;
