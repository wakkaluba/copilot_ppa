import { EventEmitter } from 'events';
import { LLMSessionConfig } from '../types';
/**
 * Service for managing LLM session configurations
 */
export declare class LLMSessionConfigService extends EventEmitter {
    private currentConfig;
    constructor();
    /**
     * Reload configuration from workspace settings
     */
    reloadConfig(): void;
    /**
     * Get the current session configuration
     */
    getCurrentConfig(): LLMSessionConfig;
    /**
     * Merge provided config with current config
     */
    mergeConfig(config?: Partial<LLMSessionConfig>): LLMSessionConfig;
    /**
     * Update specific configuration values
     */
    updateConfig(updates: Partial<LLMSessionConfig>): Promise<void>;
    /**
     * Reset configuration to defaults
     */
    resetConfig(): Promise<void>;
    /**
     * Validate a session configuration
     */
    validateConfig(config: Partial<LLMSessionConfig>): string[];
    private loadConfig;
    private getConfigChanges;
}
