import * as vscode from 'vscode';
import { SupportedLanguage, getCurrentLanguage } from '../i18n';
import { MultilingualPromptManager } from './multilingualPromptManager';
import { LLMProvider } from './llmProvider';
import { LLMPromptOptions } from './types';

/**
 * Manages LLM providers and connections
 */
export class LLMProviderManager {
    private currentProvider: LLMProvider | null = null;
    private multilingualManager: MultilingualPromptManager;

    constructor(context: vscode.ExtensionContext) {
        this.multilingualManager = new MultilingualPromptManager();
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
        options?: LLMPromptOptions,
        targetLanguage?: SupportedLanguage
    ): Promise<string> {
        if (!this.currentProvider) {
            throw new Error('No LLM provider is currently connected');
        }

        // Use UI language if no target language specified
        const language = targetLanguage || getCurrentLanguage();

        // Enhance prompt with language directives
        const enhancedPrompt = this.multilingualManager.enhancePromptWithLanguage(
            prompt,
            language,
            options
        );

        // Send to LLM
        let response = await this.currentProvider.sendPrompt(enhancedPrompt, options);

        // Check if response is in expected language
        if (!this.multilingualManager.isResponseInExpectedLanguage(response, language)) {
            // Request translation
            const correctionPrompt = this.multilingualManager.buildLanguageCorrectionPrompt(
                prompt,
                response,
                language
            );

            // Send correction prompt
            response = await this.currentProvider.sendPrompt(correctionPrompt, options);
        }

        return response;
    }

    getCurrentProvider(): LLMProvider {
        const provider = this.providers[this.currentProvider];
        if (!provider) {
            throw new Error('No LLM provider is currently active');
        }
        return provider;
    }

    getCurrentModelId(): string {
        const provider = this.getCurrentProvider();
        return provider.getModelId();
    }

    // Fix the sendPrompt methods to use the proper method from the provider
    async sendPrompt(prompt: string, options?: LLMPromptOptions): Promise<string> {
        return this.getCurrentProvider().sendPrompt(prompt, options);
    }

    async sendStreamingPrompt(prompt: string, callback: (chunk: string) => void, options?: LLMPromptOptions): Promise<string> {
        const provider = this.getCurrentProvider();
        return provider.sendPrompt(prompt, options);
    }
}