import * as vscode from 'vscode';
import { SupportedLanguage } from '../i18n';
import { LLMProvider, LLMRequestOptions } from './llm-provider';
/**
 * Legacy LLM Provider Manager - acts as a wrapper to the main implementation
 * @deprecated Use LLMProviderManager from llmProviderManager.ts instead
 */
export declare class LLMProviderManager {
    private mainProviderManager;
    private multilingualManager;
    constructor(context: vscode.ExtensionContext);
    /**
     * Sends a prompt to the current LLM provider with language support
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @param targetLanguage Target language for the response, defaults to UI language
     * @returns Promise that resolves with the LLM response
     */
    sendPromptWithLanguage(prompt: string, options?: LLMRequestOptions, targetLanguage?: SupportedLanguage): Promise<string>;
    getCurrentProvider(): LLMProvider;
    getCurrentModelId(): string;
    /**
     * Sends a prompt to the current LLM provider
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @returns Promise that resolves with the LLM response
     */
    sendPrompt(prompt: string, options?: LLMRequestOptions): Promise<string>;
    /**
     * Sends a streaming prompt to the current LLM provider
     * @param prompt The prompt to send
     * @param callback Callback function to receive streaming chunks
     * @param options Optional settings for the request
     * @returns Promise that resolves with the full response
     */
    sendStreamingPrompt(prompt: string, callback: (chunk: string) => void, options?: LLMRequestOptions): Promise<string>;
}
