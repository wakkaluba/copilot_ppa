import {
    ChatMessage,
    ChatContext,
    ChatFormatOptions,
    LLMResponse,
    ChatError
} from '../types';

/**
 * Service for formatting chat messages, context, and responses
 */
export class LLMChatFormatter {
    private readonly options: ChatFormatOptions;
    private readonly defaultSystemPrompt = 'You are a helpful AI assistant.';
    private readonly maxContextLength = 4096;

    constructor(options: ChatFormatOptions = {}) {
        this.options = {
            systemPromptPrefix: options.systemPromptPrefix || this.defaultSystemPrompt,
            maxContextMessages: options.maxContextMessages || 10,
            useMarkdown: options.useMarkdown ?? true,
            preserveFormatting: options.preserveFormatting ?? true,
            ...options
        };
    }

    /**
     * Format conversation context
     */
    public formatContext(
        messages: ChatMessage[],
        context: ChatContext = {}
    ): string {
        try {
            let formatted = '';

            // Add system prompt
            const systemPrompt = this.formatSystemPrompt(context);
            if (systemPrompt) {
                formatted += systemPrompt + '\n\n';
            }

            // Add context variables
            const contextVars = this.formatContextVariables(context);
            if (contextVars) {
                formatted += contextVars + '\n\n';
            }

            // Add conversation history
            const history = this.formatConversationHistory(messages);
            if (history) {
                formatted += history;
            }

            // Ensure we don't exceed max context length
            if (formatted.length > this.maxContextLength) {
                formatted = this.truncateContext(formatted);
            }

            return formatted.trim();

        } catch (error) {
            throw new ChatError(
                'Failed to format context',
                undefined,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Format system prompt
     */
    private formatSystemPrompt(context: ChatContext): string {
        let prompt = this.options.systemPromptPrefix;

        if (context.systemInstructions) {
            prompt += '\n' + context.systemInstructions;
        }

        if (context.userPreferences) {
            prompt += '\nUser preferences:';
            for (const [key, value] of Object.entries(context.userPreferences)) {
                prompt += `\n- ${key}: ${value}`;
            }
        }

        return prompt;
    }

    /**
     * Format context variables
     */
    private formatContextVariables(context: ChatContext): string {
        if (!context.variables || Object.keys(context.variables).length === 0) {
            return '';
        }

        let formatted = 'Current context:';
        for (const [key, value] of Object.entries(context.variables)) {
            formatted += `\n${key}: ${this.formatValue(value)}`;
        }

        return formatted;
    }

    /**
     * Format conversation history
     */
    private formatConversationHistory(messages: ChatMessage[]): string {
        if (messages.length === 0) {return '';}

        // Get most recent messages up to maxContextMessages
        const recentMessages = messages
            .slice(-this.options.maxContextMessages)
            .map(msg => this.formatMessage(msg))
            .join('\n\n');

        return recentMessages;
    }

    /**
     * Format a single message
     */
    private formatMessage(message: ChatMessage): string {
        const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);
        let formatted = `${role}: ${message.content}`;

        if (this.options.useMarkdown) {
            formatted = this.applyMarkdownFormatting(formatted, message);
        }

        return formatted;
    }

    /**
     * Format a value for display
     */
    private formatValue(value: unknown): string {
        if (typeof value === 'string') {
            return value;
        }
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    /**
     * Apply markdown formatting
     */
    private applyMarkdownFormatting(text: string, message: ChatMessage): string {
        if (!this.options.useMarkdown) {return text;}

        let formatted = text;

        // Add code block formatting
        if (message.metadata?.isCode) {
            const lang = message.metadata.language || '';
            formatted = `\`\`\`${lang}\n${formatted}\n\`\`\``;
        }

        // Add quote formatting for system messages
        if (message.role === 'system') {
            formatted = '> ' + formatted.replace(/\n/g, '\n> ');
        }

        return formatted;
    }

    /**
     * Format LLM response
     */
    public formatResponse(response: LLMResponse): string {
        try {
            let content = response.content;

            // Apply formatting if needed
            if (this.options.useMarkdown && !this.options.preserveFormatting) {
                content = this.cleanMarkdown(content);
            }

            return content;

        } catch (error) {
            throw new ChatError(
                'Failed to format response',
                undefined,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Clean and normalize markdown
     */
    private cleanMarkdown(content: string): string {
        return content
            // Normalize line endings
            .replace(/\r\n/g, '\n')
            // Remove extra blank lines
            .replace(/\n{3,}/g, '\n\n')
            // Fix code block formatting
            .replace(/```(\w*)\s*\n/g, '```$1\n')
            .replace(/\n\s*```/g, '\n```')
            // Fix list formatting
            .replace(/^\s*[-*+]\s*/gm, '- ')
            .trim();
    }

    /**
     * Truncate context to fit within max length
     */
    private truncateContext(context: string): string {
        // Keep system prompt and most recent messages
        const parts = context.split('\n\n');
        const systemPrompt = parts[0];
        const contextVars = parts[1];
        
        let remaining = this.maxContextLength - 
            (systemPrompt.length + contextVars.length + 4); // 4 for \n\n separators

        const messages = parts.slice(2);
        const keptMessages: string[] = [];
        
        // Add messages from most recent until we hit the limit
        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if (message.length + 2 <= remaining) { // 2 for \n\n separator
                keptMessages.unshift(message);
                remaining -= message.length + 2;
            } else {
                break;
            }
        }

        return [systemPrompt, contextVars, ...keptMessages].join('\n\n');
    }

    /**
     * Extract code blocks from message
     */
    public extractCodeBlocks(content: string): { language: string; code: string }[] {
        const blocks: { language: string; code: string }[] = [];
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;

        let match;
        while ((match = codeBlockRegex.exec(content)) !== null) {
            blocks.push({
                language: match[1] || 'text',
                code: match[2].trim()
            });
        }

        return blocks;
    }

    /**
     * Format error message
     */
    public formatError(error: Error | string): string {
        const message = typeof error === 'string' ? error : error.message;
        return this.options.useMarkdown ?
            `**Error**: ${message}` :
            `Error: ${message}`;
    }
}