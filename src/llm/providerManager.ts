import * as vscode from 'vscode';
import { SupportedLanguage, getCurrentLanguage } from '../i18n';
import { MultilingualPromptManager } from './multilingualPromptManager';
import { LLMProvider, LLMRequestOptions, LLMResponse } from './llm-provider';
import { LLMProviderManager as MainLLMProviderManager } from './llmProviderManager';
import { ConnectionStatusService } from '../status/connectionStatusService';

/**
 * Legacy LLM Provider Manager - acts as a wrapper to the main implementation
 * @deprecated Use LLMProviderManager from llmProviderManager.ts instead
 */
export class LLMProviderManager {
    private mainProviderManager: MainLLMProviderManager;
    private multilingualManager: MultilingualPromptManager;

    constructor(context: vscode.ExtensionContext) {
        this.multilingualManager = new MultilingualPromptManager();
        
        // Create a ConnectionStatusService stub if not provided
        const statusService = new ConnectionStatusService();
        this.mainProviderManager = MainLLMProviderManager.getInstance(statusService);
    }

    /**
     * Sends a prompt to the current LLM provider with language support
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @param targetLanguage Target language for the response, defaults to UI language
     * @returns Promise that resolves with the LLM response
     */
    public async sendPromptWithLanguage(
        prompt: string,
        options?: LLMRequestOptions,
        targetLanguage?: SupportedLanguage
    ): Promise<string> {
        return this.mainProviderManager.sendPromptWithLanguage(prompt, options, targetLanguage);
    }

    getCurrentProvider(): LLMProvider {
        const provider = this.mainProviderManager.getActiveProvider();
        if (!provider) {
            throw new Error('No LLM provider is currently active');
        }
        return provider;
    }

    getCurrentModelId(): string {
        const provider = this.getCurrentProvider();
        return provider.getStatus().activeModel || '';
    }

    /**
     * Sends a prompt to the current LLM provider 
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @returns Promise that resolves with the LLM response
     */
    async sendPrompt(prompt: string, options?: LLMRequestOptions): Promise<string> {
        return this.mainProviderManager.sendPrompt(prompt, options);
    }

    /**
     * Sends a streaming prompt to the current LLM provider
     * @param prompt The prompt to send
     * @param callback Callback function to receive streaming chunks
     * @param options Optional settings for the request
     * @returns Promise that resolves with the full response
     */
    async sendStreamingPrompt(prompt: string, callback: (chunk: string) => void, options?: LLMRequestOptions): Promise<string> {
        return this.mainProviderManager.sendStreamingPrompt(prompt, callback, options);
    }
}