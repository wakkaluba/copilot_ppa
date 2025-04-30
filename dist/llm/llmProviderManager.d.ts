import * as vscode from 'vscode';
import { LLMProvider, LLMRequestOptions, LLMResponse } from './llm-provider';
import { ConnectionStatusService } from '../status/connectionStatusService';
import { SupportedLanguage } from '../i18n';
export interface LLMProviderWithCache extends LLMProvider {
    setOfflineMode?(enabled: boolean): void;
    cacheResponse?(prompt: string, response: LLMResponse): Promise<void>;
}
export declare class LLMProviderManager implements vscode.Disposable {
    private _providers;
    private _activeProvider;
    private connectionStatusService;
    private multilingualManager;
    constructor(connectionStatusService: ConnectionStatusService);
    registerProvider(id: string, provider: LLMProviderWithCache): void;
    setActiveProvider(id: string): boolean;
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    setActiveModel(modelId: string): Promise<void>;
    sendPromptWithLanguage(prompt: string, options?: LLMRequestOptions, targetLanguage?: SupportedLanguage): Promise<string>;
    sendStreamingPrompt(prompt: string, callback: (chunk: string) => void): Promise<void>;
    getActiveProvider(): LLMProvider | null;
    getActiveModelName(): string | null;
    setOfflineMode(enabled: boolean): void;
    sendPrompt(prompt: string): Promise<string>;
    dispose(): void;
}
