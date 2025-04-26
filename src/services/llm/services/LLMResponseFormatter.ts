import {
    LLMResponse,
    LLMResponseFormat,
    LLMResponseOptions,
    LLMResponseError,
    TokenUsage
} from '../types';

interface FormattingContext {
    format: LLMResponseFormat;
    maxLength?: number;
    includeMetadata?: boolean;
    preserveFormatting?: boolean;
}

/**
 * Service for formatting and processing LLM responses
 */
export class LLMResponseFormatter {
    /**
     * Format a raw LLM response
     */
    public format(
        rawResponse: unknown,
        options: LLMResponseOptions = {}
    ): LLMResponse {
        try {
            const context: FormattingContext = {
                format: options.format || 'text',
                maxLength: options.maxLength,
                includeMetadata: options.includeMetadata ?? true,
                preserveFormatting: options.preserveFormatting
            };

            const content = this.formatContent(rawResponse, context);
            const usage = this.extractTokenUsage(rawResponse);
            
            return this.createResponse(content, usage, options);
        } catch (error) {
            throw new LLMResponseError(
                'Failed to format response',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Format response content based on format type
     */
    private formatContent(
        rawResponse: unknown,
        context: FormattingContext
    ): string {
        let content = '';

        if (typeof rawResponse === 'string') {
            content = rawResponse;
        } else if (typeof rawResponse === 'object' && rawResponse !== null) {
            content = this.extractContentFromObject(rawResponse);
        } else {
            content = String(rawResponse);
        }

        return this.applyFormatting(content, context);
    }

    /**
     * Extract content from response object
     */
    private extractContentFromObject(obj: Record<string, unknown>): string {
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
            return obj.choices.map(choice => 
                typeof choice === 'string' ? choice : 
                typeof choice === 'object' && choice ? 
                    String(choice.text || choice.content || choice.message || '') : 
                    ''
            ).join('\n').trim();
        }
        
        return JSON.stringify(obj);
    }

    /**
     * Apply formatting based on context
     */
    private applyFormatting(content: string, context: FormattingContext): string {
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
    private formatAsText(content: string, context: FormattingContext): string {
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
    private formatAsJson(content: string, context: FormattingContext): string {
        try {
            // If content is already JSON string, parse and re-stringify
            const parsed = JSON.parse(content);
            return JSON.stringify(parsed, null, context.preserveFormatting ? 2 : 0);
        } catch {
            // If not valid JSON, try to convert to JSON
            return JSON.stringify({ content }, null, context.preserveFormatting ? 2 : 0);
        }
    }

    /**
     * Format as Markdown
     */
    private formatAsMarkdown(content: string, context: FormattingContext): string {
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
    private formatAsCode(content: string, context: FormattingContext): string {
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
    private extractTokenUsage(rawResponse: unknown): TokenUsage | undefined {
        if (typeof rawResponse === 'object' && rawResponse && 'usage' in rawResponse) {
            const usage = (rawResponse as any).usage;
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
    private createResponse(
        content: string, 
        usage?: TokenUsage,
        options: LLMResponseOptions = {}
    ): LLMResponse {
        const response: LLMResponse = {
            content,
            format: options.format || 'text',
            timestamp: new Date()
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
    public validateFormat(format: string): format is LLMResponseFormat {
        return ['text', 'json', 'markdown', 'code'].includes(format);
    }

    /**
     * Stream response chunks
     */
    public async *streamResponse(
        responseStream: AsyncIterableIterator<unknown>,
        options: LLMResponseOptions = {}
    ): AsyncIterableIterator<LLMResponse> {
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