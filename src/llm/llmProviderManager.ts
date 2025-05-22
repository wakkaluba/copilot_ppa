import * as vscode from 'vscode';
import { SupportedLanguage } from '../i18n';
import { ConnectionState, ConnectionStatusService } from '../status/connectionStatusService';
import { MultilingualManager } from './i18n/MultilingualManager';
import { ILLMProvider, ILLMRequestOptions, ILLMResponse } from './llm-provider';

export interface ILLMProviderWithCache extends ILLMProvider {
  cacheResponse?(prompt: string, response: ILLMResponse): Promise<void>;
}

export class LLMProviderManager implements vscode.Disposable {
  private _providers = new Map<string, ILLMProviderWithCache>();
  private _activeProvider: ILLMProviderWithCache | null = null;
  private connectionStatusService: ConnectionStatusService;
  private multilingualManager: MultilingualManager;

  constructor(connectionStatusService: ConnectionStatusService) {
    this.connectionStatusService = connectionStatusService;
    this.multilingualManager = new MultilingualManager();
  }

  registerProvider(id: string, provider: ILLMProviderWithCache): void {
    this._providers.set(id, provider);
  }

  setActiveProvider(id: string): boolean {
    const provider = this._providers.get(id);
    if (provider) {
      this._activeProvider = provider;
      return true;
    }
    return false;
  }

  async connect(): Promise<boolean> {
    if (!this._activeProvider) {
      throw new Error('No LLM provider is active');
    }

    try {
      await this._activeProvider.connect();
      this.connectionStatusService.setState(ConnectionState.Connected, {
        modelName: this._activeProvider.getActiveModel(),
        providerName: this._activeProvider.getName(),
      });
      this.connectionStatusService.showNotification('Connected to LLM provider');
      return true;
    } catch (error) {
      this.connectionStatusService.setState(ConnectionState.Error, {
        error: error instanceof Error ? error.message : String(error),
      });
      this.connectionStatusService.showNotification(
        `Failed to connect to LLM: ${error instanceof Error ? error.message : String(error)}`,
        'error',
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this._activeProvider) {
      return;
    }

    try {
      await this._activeProvider.disconnect();
      this.connectionStatusService.setState(ConnectionState.Disconnected);
    } catch (error) {
      this.connectionStatusService.setState(ConnectionState.Error);
      this.connectionStatusService.showNotification(
        `Failed to disconnect from LLM: ${error instanceof Error ? error.message : String(error)}`,
        'error',
      );
      throw error;
    }
  }

  async setActiveModel(modelId: string): Promise<void> {
    if (!this._activeProvider) {
      throw new Error('No LLM provider is active');
    }

    this._activeProvider.setActiveModel(modelId);
    this.connectionStatusService.setState(ConnectionState.Connected, {
      modelName: modelId,
      providerName: this._activeProvider.getName(),
    });
  }

  async sendPromptWithLanguage(
    prompt: string,
    options?: ILLMRequestOptions,
    targetLanguage?: SupportedLanguage,
  ): Promise<string> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No LLM provider is currently connected');
    }

    const language = targetLanguage || 'en';
    const enhancedPrompt = this.multilingualManager.enhancePromptWithLanguage(prompt, language);

    const response = await provider.generateCompletion(
      provider.getActiveModel(),
      enhancedPrompt,
      undefined,
      options,
    );

    if (!this.multilingualManager.isResponseInExpectedLanguage(response.content, language)) {
      const correctionPrompt = this.multilingualManager.buildLanguageCorrectionPrompt(
        prompt,
        response.content,
        language,
      );

      const correctedResponse = await provider.generateCompletion(
        provider.getActiveModel(),
        correctionPrompt,
        undefined,
        options,
      );

      return correctedResponse.content;
    }

    return response.content;
  }

  async sendStreamingPrompt(prompt: string, callback: (chunk: string) => void): Promise<void> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No LLM provider is currently connected');
    }

    await provider.streamCompletion(
      provider.getActiveModel(),
      prompt,
      undefined,
      undefined,
      (event) => callback(event.content),
    );
  }

  getActiveProvider(): ILLMProvider | null {
    return this._activeProvider;
  }

  getActiveModelName(): string | null {
    return this._activeProvider?.getActiveModel() || null;
  }

  async sendPrompt(prompt: string): Promise<string> {
    const provider = this.getActiveProvider() as ILLMProviderWithCache;
    if (!provider) {
      throw new Error('No LLM provider is currently connected');
    }

    const response = await provider.generateCompletion(
      provider.getActiveModel(),
      prompt,
      undefined,
      undefined,
    );

    if (provider.cacheResponse) {
      await provider.cacheResponse(prompt, response);
    }

    return response.content;
  }

  dispose(): void {
    // Clean up any resources
  }
}
