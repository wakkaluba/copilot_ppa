/**
 * LLM Session Manager - Handles sessions for communicating with LLM services
 */
import * as vscode from 'vscode';
import { LLMConnectionManager } from './LLMConnectionManager';
import { ConnectionState } from '../../types/llm';

/**
 * Payload for sending messages to an LLM
 */
export interface LLMMessagePayload {
    prompt: string;
    system?: string;
    options?: Record<string, any>;
}

/**
 * Configuration for an LLM session
 */
export interface LLMSessionConfig {
    apiEndpoint: string;
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    retries?: number;
}

/**
 * Response from an LLM
 */
export interface LLMResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model?: string;
    finishReason?: string;
}

/**
 * Manager for LLM sessions
 */
export class LLMSessionManager implements vscode.Disposable {
    private defaultConfig: LLMSessionConfig;
    private disposables: vscode.Disposable[] = [];
    private abortControllers: Map<string, AbortController> = new Map();
    
    /**
     * Creates a new LLMSessionManager
     */
    constructor(
        private readonly connectionManager: LLMConnectionManager,
        private readonly hostManager: LLMHostManager
    ) {
        this.defaultConfig = this.loadDefaultConfig();
        
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(this.handleConfigChange.bind(this))
        );
    }
    
    /**
     * Loads the default configuration from settings
     */
    private loadDefaultConfig(): LLMSessionConfig {
        const config = vscode.workspace.getConfiguration('copilot-ppa.llm');
        
        return {
            apiEndpoint: config.get<string>('apiEndpoint', 'http://localhost:11434/api/generate'),
            modelName: config.get<string>('modelName', 'default'),
            temperature: config.get<number>('temperature', 0.7),
            maxTokens: config.get<number>('maxTokens', 2000),
            timeout: config.get<number>('timeout', 60000),
            retries: config.get<number>('retries', 2)
        };
    }
    
    /**
     * Handles configuration changes
     */
    private handleConfigChange(event: vscode.ConfigurationChangeEvent): void {
        if (event.affectsConfiguration('copilot-ppa.llm')) {
            this.defaultConfig = this.loadDefaultConfig();
        }
    }
    
    /**
     * Sends a message to the LLM
     * 
     * @param payload The message payload
     * @param sessionConfig Optional session configuration
     * @param sessionId Optional session ID for tracking the request
     * @returns Promise resolving to the LLM response
     */
    public async sendMessage(
        payload: LLMMessagePayload,
        sessionConfig?: Partial<LLMSessionConfig>,
        sessionId = crypto.randomUUID()
    ): Promise<LLMResponse> {
        // Ensure we're connected
        if (this.connectionManager.connectionState !== ConnectionState.CONNECTED) {
            const connected = await this.connectionManager.connectToLLM();
            if (!connected) {
                throw new Error('Failed to connect to LLM service');
            }
        }
        
        const config = { ...this.defaultConfig, ...sessionConfig };
        let retries = config.retries || 0;
        
        const controller = new AbortController();
        this.abortControllers.set(sessionId, controller);
        
        try {
            return await this.executeRequest(payload, config, controller.signal, retries);
        } finally {
            this.abortControllers.delete(sessionId);
        }
    }
    
    /**
     * Executes the LLM request with retry logic
     */
    private async executeRequest(
        payload: LLMMessagePayload,
        config: LLMSessionConfig,
        signal: AbortSignal,
        remainingRetries: number
    ): Promise<LLMResponse> {
        try {
            const requestBody = {
                prompt: payload.prompt,
                system_prompt: payload.system,
                model: config.modelName,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                ...payload.options
            };
            
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal
            });
            
            if (!response.ok) {
                throw new Error(`LLM request failed: ${response.status} ${response.statusText}`);
            }
            
            const responseData = await response.json();
            
            return {
                text: responseData.response || responseData.choices?.[0]?.text || responseData.content || '',
                usage: {
                    promptTokens: responseData.usage?.prompt_tokens || 0,
                    completionTokens: responseData.usage?.completion_tokens || 0,
                    totalTokens: responseData.usage?.total_tokens || 0
                },
                model: responseData.model,
                finishReason: responseData.choices?.[0]?.finish_reason || responseData.finish_reason
            };
        } catch (error) {
            if (signal.aborted) {
                throw new Error('LLM request was aborted');
            }
            
            if (remainingRetries > 0) {
                console.log(`LLM request failed. Retrying. Retries remaining: ${remainingRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.executeRequest(payload, config, signal, remainingRetries - 1);
            }
            
            throw error;
        }
    }
    
    /**
     * Aborts an ongoing LLM session
     * 
     * @param sessionId The ID of the session to abort
     */
    public abortSession(sessionId: string): boolean {
        const controller = this.abortControllers.get(sessionId);
        if (controller) {
            controller.abort();
            this.abortControllers.delete(sessionId);
            return true;
        }
        return false;
    }
    
    /**
     * Disposes resources used by the manager
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
    }
}