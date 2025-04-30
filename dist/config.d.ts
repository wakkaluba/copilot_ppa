import * as vscode from 'vscode';
import { IConfigService } from './services/interfaces';
export type LLMProvider = 'ollama' | 'lmstudio' | 'huggingface' | string;
export interface LLMConfig {
    provider: LLMProvider;
    modelId: string;
    endpoint: string;
    maxTokens: number;
    temperature: number;
}
export interface IntegrationConfig {
    copilotEnabled: boolean;
    vscodeProfileEnabled: boolean;
    perfDataCollection: boolean;
}
export interface CopilotPPAConfig {
    enableTelemetry: boolean;
    debugLogging: boolean;
    showStatusBar: boolean;
    analysisThreshold: number;
    integrationFeatures: IntegrationConfig;
    llm: LLMConfig;
    defaultProvider: string;
}
export interface ConfigChangeEvent {
    key: keyof CopilotPPAConfig | string;
    value: any;
    source: vscode.ConfigurationTarget;
}
export declare class ConfigManager implements vscode.Disposable, IConfigService {
    private readonly _context;
    private readonly _configChangeEmitter;
    private _configChangeHandler?;
    private _currentConfig;
    readonly onConfigChanged: vscode.Event<ConfigChangeEvent>;
    constructor(context: vscode.ExtensionContext);
    initialize(): Promise<void>;
    private loadConfig;
    private mergeWithDefaults;
    private validateAnalysisThreshold;
    private validateLLMConfig;
    private validateEndpoint;
    private validateAndUpdateConfig;
    private setupConfigChangeListener;
    private emitConfigChanges;
    getConfig(): CopilotPPAConfig;
    updateConfig<T>(section: string, value: T, configTarget?: vscode.ConfigurationTarget): Promise<void>;
    registerConfigurationDefaults(): Promise<void>;
    dispose(): void;
}
