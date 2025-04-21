import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ConnectionState, ConnectionStatusService } from '../status/connectionStatusService';
import { LLMProvider, LLMProviderStatus } from './llm-provider';
import { LLMProviderConfigurationService } from './services/LLMProviderConfigurationService';
import { LLMProviderConnectionService } from './services/LLMProviderConnectionService';
import { LLMProviderStateService } from './services/LLMProviderStateService';

export interface ManagerStatus {
    state: ConnectionState;
    activeProvider?: string;
    activeModel?: string;
    error?: string;
}

export class LLMProviderManager extends EventEmitter implements vscode.Disposable {
    private readonly configService: LLMProviderConfigurationService;
    private readonly connectionService: LLMProviderConnectionService;
    private readonly stateService: LLMProviderStateService;
    
    constructor(
        private readonly connectionManager: LLMConnectionManager,
        private readonly hostManager: LLMHostManager,
        private readonly statusService: ConnectionStatusService
    ) {
        super();
        this.configService = new LLMProviderConfigurationService();
        this.connectionService = new LLMProviderConnectionService(connectionManager);
        this.stateService = new LLMProviderStateService(statusService);
        
        this.initializeDefaultProviders();
        this.setupEventListeners();
    }

    private initializeDefaultProviders(): void {
        this.configService.initializeDefaultProviders();
    }

    private setupEventListeners(): void {
        this.connectionService.on('stateChanged', this.handleConnectionStateChange.bind(this));
        this.hostManager.on('stateChanged', this.handleHostStateChange.bind(this));
        this.configService.on('providerStatusChanged', this.handleProviderStatusChange.bind(this));
    }

    public registerProvider(type: string, provider: LLMProvider): void {
        this.configService.registerProvider(type, provider);
    }

    public getProvider(type: string): LLMProvider | undefined {
        return this.configService.getProvider(type);
    }

    public getProviders(): Map<string, LLMProvider> {
        return this.configService.getProviders();
    }

    public async setActiveProvider(type: string): Promise<void> {
        const provider = this.configService.getProvider(type);
        if (!provider) {
            throw new Error(`Provider ${type} not found`);
        }

        await this.connectionService.switchProvider(provider);
        await this.stateService.updateActiveProvider(provider);
    }

    private handleProviderStatusChange(data: { type: string; status: LLMProviderStatus }): void {
        this.emit('providerStatusChanged', data);
    }

    private handleConnectionStateChange(state: ConnectionState): void {
        this.emit('connectionStateChanged', state);
        this.stateService.updateConnectionState(state);
    }

    private handleHostStateChange(state: HostState): void {
        this.emit('hostStateChanged', state);
        this.stateService.updateHostState(state);
    }

    public dispose(): void {
        this.configService.dispose();
        this.connectionService.dispose();
        this.stateService.dispose();
        this.removeAllListeners();
    }
}