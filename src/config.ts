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

const DEFAULT_CONFIG: CopilotPPAConfig = {
    enableTelemetry: true,
    debugLogging: false,
    showStatusBar: true,
    analysisThreshold: 500,
    integrationFeatures: {
        copilotEnabled: true,
        vscodeProfileEnabled: false,
        perfDataCollection: true,
    },
    llm: {
        provider: 'ollama',
        modelId: 'llama2',
        endpoint: 'http://localhost:11434',
        maxTokens: 2048,
        temperature: 0.7,
    },
    defaultProvider: 'ollama',
};

export interface ConfigChangeEvent {
    key: keyof CopilotPPAConfig | string;
    value: any;
    source: vscode.ConfigurationTarget;
}

export class ConfigManager implements vscode.Disposable, IConfigService {
    private readonly _context: vscode.ExtensionContext;
    private readonly _configChangeEmitter = new vscode.EventEmitter<ConfigChangeEvent>();
    private _configChangeHandler?: vscode.Disposable;
    private _currentConfig: CopilotPPAConfig;

    readonly onConfigChanged = this._configChangeEmitter.event;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
        this._currentConfig = this.loadConfig();
        this.setupConfigChangeListener();
    }

    async initialize(): Promise<void> {
        await this.validateAndUpdateConfig();
        await this.registerConfigurationDefaults();
    }

    private loadConfig(): CopilotPPAConfig {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        return this.mergeWithDefaults(config);
    }

    private mergeWithDefaults(config: vscode.WorkspaceConfiguration): CopilotPPAConfig {
        return {
            enableTelemetry: config.get<boolean>('enableTelemetry', DEFAULT_CONFIG.enableTelemetry),
            debugLogging: config.get<boolean>('debugLogging', DEFAULT_CONFIG.debugLogging),
            showStatusBar: config.get<boolean>('showStatusBar', DEFAULT_CONFIG.showStatusBar),
            analysisThreshold: this.validateAnalysisThreshold(
                config.get<number>('analysisThreshold', DEFAULT_CONFIG.analysisThreshold)
            ),
            integrationFeatures: {
                copilotEnabled: config.get<boolean>(
                    'integrationFeatures.copilotEnabled',
                    DEFAULT_CONFIG.integrationFeatures.copilotEnabled
                ),
                vscodeProfileEnabled: config.get<boolean>(
                    'integrationFeatures.vscodeProfileEnabled',
                    DEFAULT_CONFIG.integrationFeatures.vscodeProfileEnabled
                ),
                perfDataCollection: config.get<boolean>(
                    'integrationFeatures.perfDataCollection',
                    DEFAULT_CONFIG.integrationFeatures.perfDataCollection
                ),
            },
            llm: this.validateLLMConfig({
                provider: config.get<LLMProvider>('llm.provider', DEFAULT_CONFIG.llm.provider),
                modelId: config.get<string>('llm.modelId', DEFAULT_CONFIG.llm.modelId),
                endpoint: config.get<string>('llm.endpoint', DEFAULT_CONFIG.llm.endpoint),
                maxTokens: config.get<number>('llm.maxTokens', DEFAULT_CONFIG.llm.maxTokens),
                temperature: config.get<number>('llm.temperature', DEFAULT_CONFIG.llm.temperature),
            }),
            defaultProvider: config.get<string>('defaultProvider', DEFAULT_CONFIG.defaultProvider),
        };
    }

    private validateAnalysisThreshold(threshold: number): number {
        return Math.max(100, Math.min(threshold, 10000));
    }

    private validateLLMConfig(config: LLMConfig): LLMConfig {
        return {
            ...config,
            maxTokens: Math.max(1, Math.min(config.maxTokens, 8192)),
            temperature: Math.max(0, Math.min(config.temperature, 2)),
            endpoint: this.validateEndpoint(config.endpoint),
        };
    }

    private validateEndpoint(endpoint: string): string {
        try {
            new URL(endpoint);
            return endpoint;
        } catch {
            return DEFAULT_CONFIG.llm.endpoint;
        }
    }

    private async validateAndUpdateConfig(): Promise<void> {
        const config = this.getConfig();
        
        // Update any invalid values with validated ones
        if (config.analysisThreshold !== this._currentConfig.analysisThreshold) {
            await this.updateConfig(
                'analysisThreshold',
                this._currentConfig.analysisThreshold
            );
        }

        if (config.llm.maxTokens !== this._currentConfig.llm.maxTokens) {
            await this.updateConfig('llm.maxTokens', this._currentConfig.llm.maxTokens);
        }

        if (config.llm.temperature !== this._currentConfig.llm.temperature) {
            await this.updateConfig('llm.temperature', this._currentConfig.llm.temperature);
        }

        if (config.llm.endpoint !== this._currentConfig.llm.endpoint) {
            await this.updateConfig('llm.endpoint', this._currentConfig.llm.endpoint);
        }
    }

    private setupConfigChangeListener(): void {
        this._configChangeHandler = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('copilot-ppa')) {
                const oldConfig = this._currentConfig;
                this._currentConfig = this.loadConfig();
                
                // Emit specific changes
                this.emitConfigChanges(oldConfig, this._currentConfig);
            }
        });

        this._context.subscriptions.push(this._configChangeHandler);
    }

    private emitConfigChanges(oldConfig: CopilotPPAConfig, newConfig: CopilotPPAConfig): void {
        // Compare and emit changes for each top-level property
        for (const key in newConfig) {
            const typedKey = key as keyof CopilotPPAConfig;
            if (JSON.stringify(oldConfig[typedKey]) !== JSON.stringify(newConfig[typedKey])) {
                this._configChangeEmitter.fire({
                    key: typedKey,
                    value: newConfig[typedKey],
                    source: vscode.ConfigurationTarget.Global
                });
            }
        }
    }

    getConfig(): CopilotPPAConfig {
        return { ...this._currentConfig };
    }

    async updateConfig<T>(
        section: string,
        value: T,
        configTarget: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
    ): Promise<void> {
        await vscode.workspace.getConfiguration('copilot-ppa').update(section, value, configTarget);
    }

    async registerConfigurationDefaults(): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        
        // Only set defaults if they haven't been set before
        if (!config.has('defaultProvider')) {
            await config.update(
                'defaultProvider',
                DEFAULT_CONFIG.llm.provider,
                vscode.ConfigurationTarget.Global
            );
        }
    }

    dispose(): void {
        this._configChangeHandler?.dispose();
        this._configChangeEmitter.dispose();
    }
}
