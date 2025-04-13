import * as vscode from 'vscode';
import { ConnectionState, ConnectionStatusService } from '../status/connectionStatusService';
import { LLMProvider } from './llmProvider';

export class LLMProviderManager implements vscode.Disposable {
    private _providers: Map<string, LLMProvider> = new Map();
    private _activeProvider: LLMProvider | null = null;
    private _connectionStatusService: ConnectionStatusService;

    constructor(connectionStatusService: ConnectionStatusService) {
        this._connectionStatusService = connectionStatusService;
        // Initialize providers and settings
    }

    public async connect(): Promise<void> {
        try {
            const provider = this.getActiveProvider();
            if (!provider) {
                throw new Error('No LLM provider is active');
            }
            
            this._connectionStatusService.setState(
                ConnectionState.Connecting, 
                { 
                    modelName: this.getActiveModelName() || '',
                    providerName: provider.getProviderType()
                }
            );
            
            await provider.connect();
            
            this._connectionStatusService.setState(
                ConnectionState.Connected,
                {
                    modelName: this.getActiveModelName() || '',
                    providerName: provider.getProviderType()
                }
            );
            
            this._connectionStatusService.showNotification(
                `Connected to ${provider.getProviderType()} with model ${this.getActiveModelName()}`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            this._connectionStatusService.setState(
                ConnectionState.Error, 
                { providerName: this.getActiveProvider()?.getProviderType() || '' }
            );
            
            this._connectionStatusService.showNotification(
                `Failed to connect to LLM: ${errorMessage}`, 
                'error'
            );
            
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            const provider = this.getActiveProvider();
            if (!provider) {
                return;
            }
            
            await provider.disconnect();
            
            this._connectionStatusService.setState(
                ConnectionState.Disconnected,
                {
                    providerName: provider.getProviderType()
                }
            );
            
            this._connectionStatusService.showNotification(
                `Disconnected from ${provider.getProviderType()}`
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            this._connectionStatusService.setState(ConnectionState.Error);
            this._connectionStatusService.showNotification(
                `Failed to disconnect from LLM: ${errorMessage}`, 
                'error'
            );
            
            throw error;
        }
    }

    public async setActiveModel(modelName: string): Promise<void> {
        // ...existing code...
        // After setting model:
        const provider = this.getActiveProvider();
        if (provider) {
            this._connectionStatusService.setState(
                provider.isConnected() ? ConnectionState.Connected : ConnectionState.Disconnected,
                {
                    modelName: modelName,
                    providerName: provider.getProviderType()
                }
            );
        }
    }

    public getActiveProvider(): LLMProvider | null {
        return this._activeProvider;
    }

    public getActiveModelName(): string | null {
        return this._activeProvider ? this._activeProvider.getModelName() : null;
    }

    public dispose(): void {
        // Dispose resources
    }
}