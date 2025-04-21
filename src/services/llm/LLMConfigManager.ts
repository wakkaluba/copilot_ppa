import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMConfigStorageService } from './services/LLMConfigStorageService';
import { LLMConfigValidationService } from './services/LLMConfigValidationService';
import { LLMConfigChangeTrackingService } from './services/LLMConfigChangeTrackingService';
import { ProviderConfig } from './interfaces';

export class LLMConfigManager extends EventEmitter {
    private static instance: LLMConfigManager;
    private readonly storageService: LLMConfigStorageService;
    private readonly validationService: LLMConfigValidationService;
    private readonly changeTracker: LLMConfigChangeTrackingService;
    
    private constructor() {
        super();
        this.storageService = new LLMConfigStorageService();
        this.validationService = new LLMConfigValidationService();
        this.changeTracker = new LLMConfigChangeTrackingService();
        
        this.setupEventListeners();
    }
    
    public static getInstance(): LLMConfigManager {
        if (!this.instance) {
            this.instance = new LLMConfigManager();
        }
        return this.instance;
    }
    
    public getProviderConfig(providerName: string): ProviderConfig | undefined {
        return this.storageService.getConfig(providerName.toLowerCase());
    }
    
    public getAllConfigs(): Map<string, ProviderConfig> {
        return this.storageService.getAllConfigs();
    }
    
    public async updateProviderConfig(
        providerName: string,
        config: Partial<ProviderConfig>
    ): Promise<void> {
        const normalizedName = providerName.toLowerCase();
        const currentConfig = this.getProviderConfig(normalizedName) || { enabled: false };
        const newConfig = { ...currentConfig, ...config };
        
        await this.validationService.validateConfig(newConfig);
        await this.storageService.saveConfig(normalizedName, newConfig);
        
        this.emit('configChanged', {
            provider: providerName,
            config: newConfig
        });
    }
    
    public isProviderEnabled(providerName: string): boolean {
        const config = this.getProviderConfig(providerName.toLowerCase());
        return config?.enabled ?? false;
    }
    
    public async enableProvider(providerName: string): Promise<void> {
        await this.updateProviderConfig(providerName, { enabled: true });
    }
    
    public async disableProvider(providerName: string): Promise<void> {
        await this.updateProviderConfig(providerName, { enabled: false });
    }
    
    public getProviderOptions(providerName: string): Record<string, unknown> {
        const config = this.getProviderConfig(providerName.toLowerCase());
        return config?.options ?? {};
    }
    
    private setupEventListeners(): void {
        this.changeTracker.onConfigurationChanged(() => {
            this.storageService.reloadConfigs();
            this.emit('configsReloaded');
        });
        
        this.storageService.on('configSaved', (name, config) => {
            this.emit('configChanged', { provider: name, config });
        });
    }
    
    public dispose(): void {
        this.changeTracker.dispose();
        this.removeAllListeners();
    }
}