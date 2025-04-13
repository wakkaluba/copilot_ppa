import * as vscode from 'vscode';
import { LLMHostManager } from './LLMHostManager';

export class LLMConnectionManager {
    private static instance: LLMConnectionManager;
    private retryCount = 0;
    private maxRetries = 3;
    private connectionTimeout: NodeJS.Timeout | null = null;
    private statusBarItem: vscode.StatusBarItem;

    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            99
        );
        this.updateStatus('disconnected');
    }

    static getInstance(): LLMConnectionManager {
        if (!this.instance) {
            this.instance = new LLMConnectionManager();
        }
        return this.instance;
    }

    async connectToLLM(): Promise<boolean> {
        try {
            this.updateStatus('connecting');
            const hostManager = LLMHostManager.getInstance();
            
            // Ensure host is running
            if (!hostManager.isRunning()) {
                await hostManager.startHost();
            }

            // Try to establish connection
            const success = await this.testConnection();
            if (success) {
                this.updateStatus('connected');
                this.retryCount = 0;
                return true;
            }

            return await this.handleConnectionFailure();
        } catch (error) {
            console.error('Connection error:', error);
            return await this.handleConnectionFailure();
        }
    }

    private async handleConnectionFailure(): Promise<boolean> {
        this.updateStatus('error');
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.connectionTimeout = setTimeout(() => {
                this.connectToLLM();
            }, 5000);
            return false;
        }
        return false;
    }

    private async testConnection(): Promise<boolean> {
        try {
            // Simple ping test to LLM
            const response = await fetch('http://localhost:11434/api/health');
            return response.ok;
        } catch {
            return false;
        }
    }

    private updateStatus(status: 'connected' | 'connecting' | 'disconnected' | 'error'): void {
        const icons = {
            connected: '$(link)',
            connecting: '$(sync~spin)',
            disconnected: '$(unlink)',
            error: '$(warning)'
        };

        this.statusBarItem.text = `${icons[status]} LLM: ${status}`;
        this.statusBarItem.show();
    }

    dispose(): void {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
        }
        this.statusBarItem.dispose();
    }
}
