import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger, TokenizerOptions, TokenizationResult } from '../types';
export declare class ModelTokenizer extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly outputChannel;
    private readonly cache;
    private readonly maxCacheSize;
    constructor(logger: ILogger);
    countTokens(text: string, options?: TokenizerOptions): Promise<number>;
    tokenize(text: string, options?: TokenizerOptions): Promise<TokenizationResult>;
    private performTokenization;
    private truncateTokens;
    private shouldPreserveCompleteSentences;
    private truncateToCompleteSentence;
    private getCacheKey;
    private maintainCache;
    private logTokenizationResult;
    private handleError;
    dispose(): void;
}
