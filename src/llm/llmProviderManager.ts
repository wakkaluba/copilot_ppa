import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMProvider, LLMProviderStatus, LLMRequestOptions, LLMModelInfo, LLMStreamEvent, LLMMessage } from './llm-provider';
import { ConnectionState, HostState } from '../types/llm';
import { LLMConnectionManager } from '../services/llm/LLMConnectionManager';
import { LLMProviderError } from './llm-provider';
import { MultilingualPromptManager } from './multilingualPromptManager';
import { SupportedLanguage, getCurrentLanguage } from '../i18n';

/**
 * Manages LLM providers and their lifecycle, integrated with the connection management system
 */
export class LLMProviderManager extends EventEmitter implements vscode.Disposable {
    private static instance: LLMProviderManager;
    private readonly providers = new Map<string, LLMProvider>();
    private readonly connectionManager: LLMConnectionManager;
    private readonly multilingualManager: MultilingualPromptManager;
    private activeProvider: string | null = null;

    private constructor() {
        super();
        this.connectionManager = LLMConnectionManager.getInstance();
        this.multilingualManager = new MultilingualPromptManager();
        
        this.connectionManager.on('stateChanged', this.handleConnectionStateChange.bind(this));
        this.connectionManager.on('hostStateChanged', this.handleHostStateChange.bind(this));
    }

    public static getInstance(): LLMProviderManager {
        if (!LLMProviderManager.instance) {
            LLMProviderManager.instance = new LLMProviderManager();
        }
        return LLMProviderManager.instance;
    }

    public registerProvider(provider: LLMProvider): void {
        this.providers.set(provider.name, provider);
        this.connectionManager.registerProvider(provider.name, provider);
        
        provider.on('stateChanged', (status: LLMProviderStatus) => {
            this.emit('providerStateChanged', {
                provider: provider.name,
                status
            });
        });
    }

    public async setActiveProvider(name: string): Promise<void> {
        if (!this.providers.has(name)) {
            throw new LLMProviderError('PROVIDER_NOT_FOUND', `Provider ${name} not found`);
        }

        await this.connectionManager.setActiveProvider(name);
        this.activeProvider = name;
        this.emit('activeProviderChanged', name);
    }

    public getProvider(name: string): LLMProvider | undefined {
        return this.providers.get(name);
    }

    public getActiveProvider(): LLMProvider | undefined {
        return this.activeProvider ? this.providers.get(this.activeProvider) : undefined;
    }

    public getProviders(): Map<string, LLMProvider> {
        return new Map(this.providers);
    }

    public async connect(): Promise<boolean> {
        if (!this.activeProvider) {
            throw new LLMProviderError('NO_ACTIVE_PROVIDER', 'No active provider set');
        }
        return this.connectionManager.connectToLLM();
    }

    public async disconnect(): Promise<void> {
        await this.connectionManager.disconnect();
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
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }

        const language = targetLanguage || getCurrentLanguage();
        const enhancedPrompt = this.multilingualManager.enhancePromptWithLanguage(prompt, language);

        const response = await provider.generateCompletion(
            provider.getStatus().activeModel || '',
            enhancedPrompt,
            undefined,
            options
        );

        if (!this.multilingualManager.isResponseInExpectedLanguage(response.content, language)) {
            const correctionPrompt = this.multilingualManager.buildLanguageCorrectionPrompt(
                prompt,
                response.content,
                language
            );

            const correctedResponse = await provider.generateCompletion(
                provider.getStatus().activeModel || '',
                correctionPrompt,
                undefined,
                options
            );
            
            return correctedResponse.content;
        }

        return response.content;
    }

    /**
     * Sends a streaming prompt to the current LLM provider
     * @param prompt The prompt to send
     * @param callback Callback function to receive streaming chunks
     * @param options Optional settings for the request
     * @returns Promise that resolves when streaming is complete
     */
    public async streamPrompt(
        prompt: string,
        callback: (event: LLMStreamEvent) => void,
        options?: LLMRequestOptions
    ): Promise<void> {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }

        await provider.streamCompletion(
            provider.getStatus().activeModel || '',
            prompt,
            undefined,
            options,
            callback
        );
    }

    /**
     * Sends a streaming chat prompt to the current LLM provider
     * @param messages Array of chat messages
     * @param callback Callback function to receive streaming chunks
     * @param options Optional settings for the request 
     * @returns Promise that resolves when streaming is complete
     */
    public async streamChat(
        messages: LLMMessage[],
        callback: (event: LLMStreamEvent) => void,
        options?: LLMRequestOptions
    ): Promise<void> {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }

        await provider.streamChatCompletion(
            provider.getStatus().activeModel || '',
            messages,
            options,
            callback
        );
    }

    /**
     * Streams a prompt with language support
     * @param prompt The prompt to send
     * @param callback Callback function to receive streaming chunks
     * @param options Optional settings for the request
     * @param targetLanguage Target language for the response
     * @returns Promise that resolves when streaming is complete
     */
    public async streamPromptWithLanguage(
        prompt: string,
        callback: (event: LLMStreamEvent) => void,
        options?: LLMRequestOptions,
        targetLanguage?: SupportedLanguage
    ): Promise<void> {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }

        const language = targetLanguage || getCurrentLanguage();
        const enhancedPrompt = this.multilingualManager.enhancePromptWithLanguage(prompt, language);

        let isCorrectLanguage = true;
        let fullResponse = '';

        await provider.streamCompletion(
            provider.getStatus().activeModel || '',
            enhancedPrompt,
            undefined,
            options,
            (event) => {
                fullResponse += event.content;
                if (event.isComplete) {
                    isCorrectLanguage = this.multilingualManager.isResponseInExpectedLanguage(
                        fullResponse,
                        language
                    );
                }
                callback(event);
            }
        );

        // If response wasn't in correct language, send correction prompt
        if (!isCorrectLanguage) {
            const correctionPrompt = this.multilingualManager.buildLanguageCorrectionPrompt(
                prompt,
                fullResponse,
                language
            );

            await provider.streamCompletion(
                provider.getStatus().activeModel || '',
                correctionPrompt,
                undefined,
                options,
                callback
            );
        }
    }

    public async getAvailableModels(): Promise<LLMModelInfo[]> {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new LLMProviderError('NO_ACTIVE_PROVIDER', 'No LLM provider is currently connected');
        }
        return provider.getAvailableModels();
    }

    private handleConnectionStateChange(state: ConnectionState): void {
        this.emit('connectionStateChanged', state);
    }

    private handleHostStateChange(state: HostState): void {
        this.emit('hostStateChanged', state);
    }

    public dispose(): void {
        this.providers.clear();
        this.connectionManager.dispose();
        this.removeAllListeners();
    }
}