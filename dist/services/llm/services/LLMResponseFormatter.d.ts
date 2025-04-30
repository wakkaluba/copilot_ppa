import { LLMResponse, LLMResponseFormat, LLMResponseOptions } from '../types';
/**
 * Service for formatting and processing LLM responses
 */
export declare class LLMResponseFormatter {
    /**
     * Format a raw LLM response
     */
    format(rawResponse: unknown, options?: LLMResponseOptions): LLMResponse;
    /**
     * Format response content based on format type
     */
    private formatContent;
    /**
     * Extract content from response object
     */
    private extractContentFromObject;
    /**
     * Apply formatting based on context
     */
    private applyFormatting;
    /**
     * Format as plain text
     */
    private formatAsText;
    /**
     * Format as JSON
     */
    private formatAsJson;
    /**
     * Format as Markdown
     */
    private formatAsMarkdown;
    /**
     * Format as code
     */
    private formatAsCode;
    /**
     * Extract token usage information
     */
    private extractTokenUsage;
    /**
     * Create formatted response object
     */
    private createResponse;
    /**
     * Validate response format
     */
    validateFormat(format: string): format is LLMResponseFormat;
    /**
     * Stream response chunks
     */
    streamResponse(responseStream: AsyncIterableIterator<unknown>, options?: LLMResponseOptions): AsyncIterableIterator<LLMResponse>;
}
