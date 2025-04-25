import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMProvider, LLMProviderStatus, LLMRequestOptions, LLMModelInfo, LLMStreamEvent, LLMMessage, LLMResponse, LLMProviderError } from './llm-provider';
import { ConnectionState, ConnectionStatusService } from '../status/connectionStatusService';
import { LLMConnectionManager } from '../services/llm/LLMConnectionManager';
import { MultilingualPromptManager } from './multilingualPromptManager';
import { SupportedLanguage, getCurrentLanguage } from '../i18n';

/**
 * Manages LLM providers and their lifecycle, integrated with the connection management system
 */
export class LLMProviderManager extends EventEmitter implements vscode.Disposable {
    private static instance: LLMProviderManager;
    private readonly _providers = new Map<string, LLMProvider>();
    private readonly connectionManager: LLMConnectionManager;
    private readonly multilingualManager: MultilingualPromptManager;
    private _activeProvider: LLMProvider | null = null;
    private connectionStatusService: ConnectionStatusService;

    constructor(connectionStatusService: ConnectionStatusService) {
        super();
        this.connectionStatusService = connectionStatusService;
        this.connectionManager = LLMConnectionManager.getInstance();
        this.multilingualManager = new MultilingualPromptManager();
    }

    /**
     * Gets the singleton instance of the LLMProviderManager
     */
    public static getInstance(connectionStatusService?: ConnectionStatusService): LLMProviderManager {
        if (!LLMProviderManager.instance && connectionStatusService) {
            LLMProviderManager.instance = new LLMProviderManager(connectionStatusService);
        }
        return LLMProviderManager.instance;
    }

    /**
     * Registers a new LLM provider
     * @param provider The provider to register
     */
    public registerProvider(provider: LLMProvider): void {
        this._providers.set(provider.name, provider);
        
        provider.on('stateChanged', (status: LLMProviderStatus) => {
            this.emit('providerStateChanged', {
                provider: provider.name,
                status
            });
        });
    }

    /**
     * Sets the active LLM provider
     * @param name Name of the provider to activate
     */
    public async setActiveProvider(name: string): Promise<void> {
        if (!this._providers.has(name)) {
            throw new LLMProviderError('PROVIDER_NOT_FOUND', `Provider ${name} not found`);
        }

        this._activeProvider = this._providers.get(name) || null;
        this.emit('activeProviderChanged', name);
        
        if (this._activeProvider) {
            const status = this._activeProvider.getStatus();
            this.updateConnectionState(
                status.isConnected ? ConnectionState.Connected : ConnectionState.Disconnected
            );
        }
    }

    /**
     * Gets a provider by name
     * @param name Name of the provider
     * @returns The provider or undefined if not found
     */
    public getProvider(name: string): LLMProvider | undefined {
        return this._providers.get(name);
    }

    /**
     * Gets the currently active provider
     * @returns The active provider or undefined if none is set
     */
    public getActiveProvider(): LLMProvider | null {
        return this._activeProvider;
    }

    /**
     * Gets all registered providers
     * @returns Map of all registered providers
     */
    public getProviders(): Map<string, LLMProvider> {
        return new Map(this._providers);
    }

    /**
     * Gets the name of the currently active model
     * @returns The active model name or null if none is set
     */
    public getActiveModelName(): string | null {
        if (!this._activeProvider) {
            return null;
        }
        const status = this._activeProvider.getStatus();
        return status.activeModel || null;
    }

    /**
     * Connects to the currently active LLM provider
     * @returns A promise that resolves to true if connection was successful
     */
    public async connect(): Promise<boolean> {
        if (!this._activeProvider) {
            throw new Error('No LLM provider is active');
        }

        try {
            this.updateConnectionState(ConnectionState.Connecting);
            await this._activeProvider.connect();
            this.updateConnectionState(ConnectionState.Connected);
            this.connectionStatusService.showNotification('Connected to LLM Provider');
            return true;
        } catch (error) {
            this.updateConnectionState(ConnectionState.Error);
            this.connectionStatusService.showNotification(
                `Failed to connect to LLM: ${error instanceof Error ? error.message : String(error)}`,
                'error'
            );
            throw error;
        }
    }

    /**
     * Disconnects from the currently active LLM provider
     */
    public async disconnect(): Promise<void> {
        if (!this._activeProvider) {
            return;
        }

        try {
            await this._activeProvider.disconnect();
            this.updateConnectionState(ConnectionState.Disconnected);
        } catch (error) {
            this.updateConnectionState(ConnectionState.Error);
            this.connectionStatusService.showNotification(
                `Failed to disconnect from LLM: ${error instanceof Error ? error.message : String(error)}`,
                'error'
            );
            throw error;
        }
    }

    /**
     * Sets a new active model on the current provider
     * @param modelName The model name to activate
     */
    public async setActiveModel(modelName: string): Promise<void> {
        if (!this._activeProvider) {
            throw new Error('No LLM provider is active');
        }

        try {
            // Since the LLMProvider interface doesn't have setActiveModel, we'll use this as a placeholder
            // In practice, providers might have different ways of switching models
            // For testing purposes, we'll just update the connection state
            this.updateConnectionState(ConnectionState.Connected, { modelName });
        } catch (error) {
            this.updateConnectionState(ConnectionState.Error);
            throw error;
        }
    }

    /**
     * Enables or disables offline mode for the current provider
     * @param enabled Whether offline mode should be enabled
     */
    public setOfflineMode(enabled: boolean): void {
        const provider = this.getActiveProvider();
        if (provider && typeof provider.setOfflineMode === 'function') {
            provider.setOfflineMode(enabled);
        }
    }

    /**
     * Sends a prompt to the current LLM provider
     * @param prompt The prompt to send
     * @param options Optional settings for the request
     * @returns Promise that resolves with the LLM response
     */
    public async sendPrompt(prompt: string, options?: LLMRequestOptions): Promise<string> {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new Error('No LLM provider is currently connected');
        }

        const response = await provider.generateCompletion(
            provider.getStatus().activeModel || '',
            prompt,
            undefined,
            options
        );

        // Cache response if provider supports it
        if (typeof provider.cacheResponse === 'function') {
            await provider.cacheResponse(prompt, response.content);
        }

        return response.content;
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
            throw new Error('No LLM provider is currently connected');
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
    public async sendStreamingPrompt(
        prompt: string,
        callback: (chunk: string) => void,
        options?: LLMRequestOptions
    ): Promise<string> {
        const provider = this.getActiveProvider();
        if (!provider) {
            throw new Error('No LLM provider is currently connected');
        }

        let fullResponse = '';
        
        await provider.streamCompletion(
            provider.getStatus().activeModel || '',
            prompt,
            undefined,
            options,
            (event) => {
                fullResponse += event.content;
                callback(event.content);
            }
        );
        
        return fullResponse;
    }

    /**
     * Updates the connection state in the status service
     */
    private updateConnectionState(state: ConnectionState, additionalInfo?: any): void {
        const info: any = additionalInfo || {};
        
        if (this._activeProvider) {
            const providerStatus = this._activeProvider.getStatus();
            info.providerName = this._activeProvider.name;
            info.modelName = info.modelName || providerStatus.activeModel;
        }
        
        this.connectionStatusService.setState(state, info);
    }

    /**
     * Disposes of resources
     */
    public dispose(): void {
        this._activeProvider = null;
        this.removeAllListeners();
    }
}