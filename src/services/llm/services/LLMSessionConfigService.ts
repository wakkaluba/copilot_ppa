import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMSessionConfig } from '../types';

const DEFAULT_CONFIG: LLMSessionConfig = {
    timeout: 30000,
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    presencePenalty: 0,
    frequencyPenalty: 0,
    stream: true,
    cache: true,
    retryCount: 3,
    contextWindowSize: 4096
};

/**
 * Service for managing LLM session configurations
 */
export class LLMSessionConfigService extends EventEmitter {
    private currentConfig: LLMSessionConfig;
    
    constructor() {
        super();
        this.currentConfig = this.loadConfig();
    }

    /**
     * Reload configuration from workspace settings
     */
    public reloadConfig(): void {
        const newConfig = this.loadConfig();
        const oldConfig = this.currentConfig;
        this.currentConfig = newConfig;
        
        this.emit('configChanged', {
            oldConfig,
            newConfig,
            changes: this.getConfigChanges(oldConfig, newConfig)
        });
    }

    /**
     * Get the current session configuration
     */
    public getCurrentConfig(): LLMSessionConfig {
        return { ...this.currentConfig };
    }

    /**
     * Merge provided config with current config
     */
    public mergeConfig(config?: Partial<LLMSessionConfig>): LLMSessionConfig {
        return {
            ...this.currentConfig,
            ...config
        };
    }

    /**
     * Update specific configuration values
     */
    public async updateConfig(updates: Partial<LLMSessionConfig>): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilot-ppa.llm');
        
        for (const [key, value] of Object.entries(updates)) {
            await config.update(key, value, vscode.ConfigurationTarget.Global);
        }
        
        this.reloadConfig();
    }

    /**
     * Reset configuration to defaults
     */
    public async resetConfig(): Promise<void> {
        await this.updateConfig(DEFAULT_CONFIG);
    }

    /**
     * Validate a session configuration
     */
    public validateConfig(config: Partial<LLMSessionConfig>): string[] {
        const errors: string[] = [];

        if (config.timeout !== undefined && config.timeout < 0) {
            errors.push('Timeout must be non-negative');
        }
        if (config.maxTokens !== undefined && config.maxTokens < 1) {
            errors.push('Max tokens must be positive');
        }
        if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
            errors.push('Temperature must be between 0 and 2');
        }
        if (config.topP !== undefined && (config.topP < 0 || config.topP > 1)) {
            errors.push('Top P must be between 0 and 1');
        }
        if (config.presencePenalty !== undefined && (config.presencePenalty < -2 || config.presencePenalty > 2)) {
            errors.push('Presence penalty must be between -2 and 2');
        }
        if (config.frequencyPenalty !== undefined && (config.frequencyPenalty < -2 || config.frequencyPenalty > 2)) {
            errors.push('Frequency penalty must be between -2 and 2');
        }
        if (config.retryCount !== undefined && config.retryCount < 0) {
            errors.push('Retry count must be non-negative');
        }
        if (config.contextWindowSize !== undefined && config.contextWindowSize < 1) {
            errors.push('Context window size must be positive');
        }

        return errors;
    }

    private loadConfig(): LLMSessionConfig {
        const config = vscode.workspace.getConfiguration('copilot-ppa.llm');
        return {
            timeout: config.get('timeout', DEFAULT_CONFIG.timeout),
            maxTokens: config.get('maxTokens', DEFAULT_CONFIG.maxTokens),
            temperature: config.get('temperature', DEFAULT_CONFIG.temperature),
            topP: config.get('topP', DEFAULT_CONFIG.topP),
            presencePenalty: config.get('presencePenalty', DEFAULT_CONFIG.presencePenalty),
            frequencyPenalty: config.get('frequencyPenalty', DEFAULT_CONFIG.frequencyPenalty),
            stream: config.get('stream', DEFAULT_CONFIG.stream),
            cache: config.get('cache', DEFAULT_CONFIG.cache),
            retryCount: config.get('retryCount', DEFAULT_CONFIG.retryCount),
            contextWindowSize: config.get('contextWindowSize', DEFAULT_CONFIG.contextWindowSize)
        };
    }

    private getConfigChanges(oldConfig: LLMSessionConfig, newConfig: LLMSessionConfig): Partial<LLMSessionConfig> {
        const changes: Partial<LLMSessionConfig> = {};
        
        for (const key of Object.keys(oldConfig) as Array<keyof LLMSessionConfig>) {
            if (oldConfig[key] !== newConfig[key]) {
                changes[key] = newConfig[key];
            }
        }
        
        return changes;
    }
}