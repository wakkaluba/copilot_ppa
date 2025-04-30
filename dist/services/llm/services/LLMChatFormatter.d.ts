import { ChatMessage, ChatContext, ChatFormatOptions, LLMResponse } from '../types';
/**
 * Service for formatting chat messages, context, and responses
 */
export declare class LLMChatFormatter {
    private readonly options;
    private readonly defaultSystemPrompt;
    private readonly maxContextLength;
    constructor(options?: ChatFormatOptions);
    /**
     * Format conversation context
     */
    formatContext(messages: ChatMessage[], context?: ChatContext): string;
    /**
     * Format system prompt
     */
    private formatSystemPrompt;
    /**
     * Format context variables
     */
    private formatContextVariables;
    /**
     * Format conversation history
     */
    private formatConversationHistory;
    /**
     * Format a single message
     */
    private formatMessage;
    /**
     * Format a value for display
     */
    private formatValue;
    /**
     * Apply markdown formatting
     */
    private applyMarkdownFormatting;
    /**
     * Format LLM response
     */
    formatResponse(response: LLMResponse): string;
    /**
     * Clean and normalize markdown
     */
    private cleanMarkdown;
    /**
     * Truncate context to fit within max length
     */
    private truncateContext;
    /**
     * Extract code blocks from message
     */
    extractCodeBlocks(content: string): {
        language: string;
        code: string;
    }[];
    /**
     * Format error message
     */
    formatError(error: Error | string): string;
}
