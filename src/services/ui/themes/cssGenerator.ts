import { Theme, UILayoutOptions } from './interfaces';

/**
 * Generates CSS variables and styles from themes and layout options
 */
export class CSSGenerator {
    /**
     * Generate CSS variables for a theme
     */
    static generateThemeCSS(theme: Theme): string {
        return `
            :root {
                --copilot-primary: ${theme.colors.primary};
                --copilot-secondary: ${theme.colors.secondary};
                --copilot-background: ${theme.colors.background};
                --copilot-foreground: ${theme.colors.foreground};
                --copilot-agent-message-bg: ${theme.colors.agentMessageBackground};
                --copilot-agent-message-fg: ${theme.colors.agentMessageForeground};
                --copilot-user-message-bg: ${theme.colors.userMessageBackground};
                --copilot-user-message-fg: ${theme.colors.userMessageForeground};
                --copilot-system-message: ${theme.colors.systemMessage};
                --copilot-error: ${theme.colors.error};
                --copilot-success: ${theme.colors.success};
                --copilot-border: ${theme.colors.border};
                --copilot-button-bg: ${theme.colors.buttonBackground};
                --copilot-button-fg: ${theme.colors.buttonForeground};
                --copilot-button-hover-bg: ${theme.colors.buttonHoverBackground};
                --copilot-input-bg: ${theme.colors.inputBackground};
                --copilot-input-fg: ${theme.colors.inputForeground};
                --copilot-input-border: ${theme.colors.inputBorder};

                --copilot-font-family: ${theme.font.family};
                --copilot-font-size: ${theme.font.sizeInPixels}px;
                --copilot-line-height: ${theme.font.lineHeight};
                --copilot-font-weight: ${theme.font.weight};
                --copilot-heading-weight: ${theme.font.headingWeight};
                --copilot-code-font-family: ${theme.font.useMonospaceForCode ? 
                    'var(--vscode-editor-font-family)' : 'inherit'};
            }
        `;
    }

    /**
     * Generate CSS based on UI layout options
     */
    static generateLayoutCSS(options: UILayoutOptions): string {
        return `
            .copilot-container {
                flex-direction: ${options.chatInputPosition === 'top' ? 'column-reverse' : 'column'};
            }
            
            .copilot-message {
                padding: ${options.compactMode ? '6px 8px' : '12px 16px'};
                margin: ${options.compactMode ? '4px 0' : '8px 0'};
            }
            
            .copilot-timestamp {
                display: ${options.showTimestamps ? 'block' : 'none'};
            }
            
            .copilot-avatar {
                display: ${options.showAvatars ? 'flex' : 'none'};
            }
            
            .copilot-code-block {
                max-height: ${options.expandCodeBlocks ? 'none' : '200px'};
            }
            
            .copilot-chat-content {
                white-space: ${options.wordWrap ? 'pre-wrap' : 'pre'};
            }

            .copilot-message pre {
                font-family: var(--copilot-code-font-family);
            }
        `;
    }
}