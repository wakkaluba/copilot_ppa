import * as vscode from 'vscode';
import { LLMHostManager } from './LLMHostManager';
import { LLMConnectionStatusService } from './llm/services/LLMConnectionStatusService';
import { LLMRetryService } from './llm/services/LLMRetryService';
import { LLMHealthCheckService } from './llm/services/LLMHealthCheckService';

export class LLMConnectionManager {
    private static instance: LLMConnectionManager;
    private readonly statusService: LLMConnectionStatusService;
    private readonly retryService: LLMRetryService;
    private readonly healthCheckService: LLMHealthCheckService;
    
    private constructor() {
        this.statusService = new LLMConnectionStatusService();
        this.retryService = new LLMRetryService();
        this.healthCheckService = new LLMHealthCheckService();
        this.statusService.updateStatus('disconnected');
    }

    static getInstance(): LLMConnectionManager {
        if (!this.instance) {
            this.instance = new LLMConnectionManager();
        }
        return this.instance;
    }

    async connectToLLM(): Promise<boolean> {
        try {
            this.statusService.updateStatus('connecting');
            const hostManager = LLMHostManager.getInstance();
            
            if (!hostManager.isRunning()) {
                await hostManager.startHost();
            }

            const isHealthy = await this.healthCheckService.checkConnection();
            if (isHealthy) {
                this.statusService.updateStatus('connected');
                this.retryService.resetRetries();
                return true;
            }

            return await this.handleConnectionFailure();
        } catch (error) {
            console.error('Connection error:', error);
            return await this.handleConnectionFailure();
        }
    }

    private async handleConnectionFailure(): Promise<boolean> {
        this.statusService.updateStatus('error');
        return this.retryService.shouldRetry() ? 
            await this.retryService.scheduleRetry(() => this.connectToLLM()) : 
            false;
    }

    dispose(): void {
        this.retryService.dispose();
        this.statusService.dispose();
    }
}
