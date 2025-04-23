import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger, TokenizerOptions, TokenizationResult } from '../types';

@injectable()
export class ModelTokenizer extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly cache = new Map<string, TokenizationResult>();
    private readonly maxCacheSize = 1000;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Tokenization');
    }

    public async countTokens(text: string, options: TokenizerOptions = {}): Promise<number> {
        try {
            const result = await this.tokenize(text, options);
            return result.tokenCount;
        } catch (error) {
            this.handleError(error as Error);
            return 0;
        }
    }

    public async tokenize(text: string, options: TokenizerOptions = {}): Promise<TokenizationResult> {
        try {
            const cacheKey = this.getCacheKey(text, options);
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return cached;
            }

            const tokens = this.performTokenization(text, options);
            const result = {
                tokens,
                tokenCount: tokens.length,
                text,
                metadata: {
                    timestamp: Date.now(),
                    modelId: options.modelId,
                    truncated: false
                }
            };

            if (options.maxTokens && result.tokenCount > options.maxTokens) {
                result.tokens = this.truncateTokens(result.tokens, options.maxTokens);
                result.tokenCount = result.tokens.length;
                result.metadata.truncated = true;
            }

            this.cache.set(cacheKey, result);
            this.maintainCache();

            this.logTokenizationResult(result);
            return result;
        } catch (error) {
            this.handleError(error as Error);
            throw error;
        }
    }

    private performTokenization(text: string, options: TokenizerOptions): string[] {
        // Basic whitespace and punctuation tokenization as fallback
        // In practice, this would be replaced by model-specific tokenizers
        const tokens = text
            .replace(/([.,!?;:])/g, ' $1 ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(Boolean);

        if (options.preserveWhitespace) {
            const whitespaceTokens = text.match(/\s+/g) || [];
            tokens.push(...whitespaceTokens);
        }

        return tokens;
    }

    private truncateTokens(tokens: string[], maxTokens: number): string[] {
        if (tokens.length <= maxTokens) {
            return tokens;
        }

        // If preserving complete sentences is enabled
        if (this.shouldPreserveCompleteSentences(tokens)) {
            return this.truncateToCompleteSentence(tokens, maxTokens);
        }

        return tokens.slice(0, maxTokens);
    }

    private shouldPreserveCompleteSentences(tokens: string[]): boolean {
        // Check if tokens form complete sentences worth preserving
        const endMarkers = new Set(['.', '!', '?']);
        return tokens.some(token => endMarkers.has(token));
    }

    private truncateToCompleteSentence(tokens: string[], maxTokens: number): string[] {
        let lastSentenceEnd = 0;
        const endMarkers = new Set(['.', '!', '?']);

        for (let i = 0; i < Math.min(tokens.length, maxTokens); i++) {
            if (endMarkers.has(tokens[i])) {
                lastSentenceEnd = i + 1;
            }
        }

        return tokens.slice(0, lastSentenceEnd || maxTokens);
    }

    private getCacheKey(text: string, options: TokenizerOptions): string {
        return `${text}:${JSON.stringify(options)}`;
    }

    private maintainCache(): void {
        if (this.cache.size > this.maxCacheSize) {
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => a[1].metadata.timestamp - b[1].metadata.timestamp);
            
            while (this.cache.size > this.maxCacheSize * 0.8) {
                const [key] = entries.shift() || [];
                if (key) {
                    this.cache.delete(key);
                }
            }
        }
    }

    private logTokenizationResult(result: TokenizationResult): void {
        this.outputChannel.appendLine('\nTokenization Result:');
        this.outputChannel.appendLine(`Total tokens: ${result.tokenCount}`);
        this.outputChannel.appendLine(`Truncated: ${result.metadata.truncated}`);
        if (result.metadata.modelId) {
            this.outputChannel.appendLine(`Model: ${result.metadata.modelId}`);
        }
        this.outputChannel.appendLine(`Timestamp: ${new Date(result.metadata.timestamp).toISOString()}`);
    }

    private handleError(error: Error): void {
        this.logger.error('[ModelTokenizer]', error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.cache.clear();
    }
}
