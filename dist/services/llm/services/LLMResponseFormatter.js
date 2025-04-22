"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMResponseFormatter = void 0;
const types_1 = require("../types");
/**
 * Service for formatting and processing LLM responses
 */
class LLMResponseFormatter {
    /**
     * Format a raw LLM response
     */
    format(rawResponse, options = {}) {
        try {
            const context = {
                format: options.format || 'text',
                maxLength: options.maxLength,
                includeMetadata: options.includeMetadata ?? true,
                preserveFormatting: options.preserveFormatting
            };
            const content = this.formatContent(rawResponse, context);
            const usage = this.extractTokenUsage(rawResponse);
            return this.createResponse(content, usage, options);
        }
        catch (error) {
            throw new types_1.LLMResponseError('Failed to format response', error instanceof Error ? error : undefined);
        }
    }
    /**
     * Format response content based on format type
     */
    formatContent(rawResponse, context) {
        let content = '';
        if (typeof rawResponse === 'string') {
            content = rawResponse;
        }
        else if (typeof rawResponse === 'object' && rawResponse !== null) {
            content = this.extractContentFromObject(rawResponse);
        }
        else {
            content = String(rawResponse);
        }
        return this.applyFormatting(content, context);
    }
    /**
     * Extract content from response object
     */
    extractContentFromObject(obj) {
        // Handle different response structures
        if ('text' in obj) {
            return String(obj.text);
        }
        if ('content' in obj) {
            return String(obj.content);
        }
        if ('message' in obj) {
            return String(obj.message);
        }
        if ('choices' in obj && Array.isArray(obj.choices)) {
            return obj.choices.map(choice => typeof choice === 'string' ? choice :
                typeof choice === 'object' && choice ?
                    String(choice.text || choice.content || choice.message || '') :
                    '').join('\n').trim();
        }
        return JSON.stringify(obj);
    }
    /**
     * Apply formatting based on context
     */
    applyFormatting(content, context) {
        let formatted = content;
        // Apply format-specific formatting
        switch (context.format) {
            case 'text':
                formatted = this.formatAsText(formatted, context);
                break;
            case 'json':
                formatted = this.formatAsJson(formatted, context);
                break;
            case 'markdown':
                formatted = this.formatAsMarkdown(formatted, context);
                break;
            case 'code':
                formatted = this.formatAsCode(formatted, context);
                break;
        }
        // Apply length limit if specified
        if (context.maxLength && formatted.length > context.maxLength) {
            formatted = formatted.slice(0, context.maxLength) + '...';
        }
        return formatted;
    }
    /**
     * Format as plain text
     */
    formatAsText(content, context) {
        if (!context.preserveFormatting) {
            // Normalize whitespace
            return content
                .replace(/\r\n/g, '\n')
                .replace(/\s+/g, ' ')
                .trim();
        }
        return content;
    }
    /**
     * Format as JSON
     */
    formatAsJson(content, context) {
        try {
            // If content is already JSON string, parse and re-stringify
            const parsed = JSON.parse(content);
            return JSON.stringify(parsed, null, context.preserveFormatting ? 2 : 0);
        }
        catch {
            // If not valid JSON, try to convert to JSON
            return JSON.stringify({ content }, null, context.preserveFormatting ? 2 : 0);
        }
    }
    /**
     * Format as Markdown
     */
    formatAsMarkdown(content, context) {
        if (!context.preserveFormatting) {
            // Basic Markdown cleanup
            return content
                .replace(/\r\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        }
        return content;
    }
    /**
     * Format as code
     */
    formatAsCode(content, context) {
        if (!context.preserveFormatting) {
            // Basic code formatting
            return content
                .replace(/\r\n/g, '\n')
                .replace(/\t/g, '    ')
                .replace(/[ \t]+$/gm, '')
                .trim();
        }
        return content;
    }
    /**
     * Extract token usage information
     */
    extractTokenUsage(rawResponse) {
        if (typeof rawResponse === 'object' && rawResponse && 'usage' in rawResponse) {
            const usage = rawResponse.usage;
            if (typeof usage === 'object' && usage) {
                return {
                    promptTokens: usage.prompt_tokens || 0,
                    completionTokens: usage.completion_tokens || 0,
                    totalTokens: usage.total_tokens || 0
                };
            }
        }
        return undefined;
    }
    /**
     * Create formatted response object
     */
    createResponse(content, usage, options = {}) {
        const response = {
            content,
            format: options.format || 'text',
            timestamp: Date.now()
        };
        if (options.includeMetadata !== false) {
            response.metadata = {
                formatVersion: '1.0',
                contentLength: content.length,
                usage
            };
        }
        return response;
    }
    /**
     * Validate response format
     */
    validateFormat(format) {
        return ['text', 'json', 'markdown', 'code'].includes(format);
    }
    /**
     * Stream response chunks
     */
    async *streamResponse(responseStream, options = {}) {
        let buffer = '';
        for await (const chunk of responseStream) {
            buffer += this.formatContent(chunk, {
                format: options.format || 'text',
                preserveFormatting: true
            });
            yield this.createResponse(buffer, undefined, options);
        }
        // Final formatted response
        yield this.format(buffer, options);
    }
}
exports.LLMResponseFormatter = LLMResponseFormatter;
//# sourceMappingURL=LLMResponseFormatter.js.map