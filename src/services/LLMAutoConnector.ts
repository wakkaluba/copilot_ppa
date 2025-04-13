import * as vscode from 'vscode';
import { LLMHostManager } from './LLMHostManager';

export class LLMAutoConnector {
    private static instance: LLMAutoConnector;
    private isConnected: boolean = false;
    private connectionAttempts: number = 0;
    private readonly maxAttempts: number = 5;
    private readonly retryDelay: number = 2000;

    private constructor() {}

    static getInstance(): LLMAutoConnector {
        if (!LLMAutoConnector.instance) {
            LLMAutoConnector.instance = new LLMAutoConnector();
        }
        return LLMAutoConnector.instance;
    }

    async tryConnect(): Promise<boolean> {
        if (this.isConnected) {
            return true;
        }

        const hostManager = LLMHostManager.getInstance();
        
        if (!hostManager.isHostRunning()) {
            await hostManager.startHost();
            // Wait for host to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        while (this.connectionAttempts < this.maxAttempts) {
            try {
                const response = await fetch('http://localhost:11434/api/health');
                if (response.ok) {
                    this.isConnected = true;
                    vscode.window.showInformationMessage('Successfully connected to LLM host');
                    return true;
                }
            } catch (error) {
                this.connectionAttempts++;
                if (this.connectionAttempts >= this.maxAttempts) {
                    vscode.window.showErrorMessage('Failed to connect to LLM host after multiple attempts');
                    return false;
                }
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }

        return false;
    }

    async disconnect(): Promise<void> {
        this.isConnected = false;
        this.connectionAttempts = 0;
    }

    isLLMConnected(): boolean {
        return this.isConnected;
    }
}
