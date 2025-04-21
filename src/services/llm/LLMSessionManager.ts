/**
 * LLM Session Manager - Handles sessions for communicating with LLM services
 */
import * as vscode from 'vscode';
import { LLMConnectionManager } from './LLMConnectionManager';
import { ConnectionState } from '../../types/llm';
import { LLMSessionConfigService } from './services/LLMSessionConfigService';
import { LLMRequestExecutionService } from './services/LLMRequestExecutionService';
import { LLMSessionTrackingService } from './services/LLMSessionTrackingService';
import { LLMMessagePayload, LLMSessionConfig, LLMResponse } from './interfaces';

/**
 * Manager for LLM sessions
 */
export class LLMSessionManager implements vscode.Disposable {
    private readonly configService: LLMSessionConfigService;
    private readonly requestService: LLMRequestExecutionService;
    private readonly trackingService: LLMSessionTrackingService;
    private readonly disposables: vscode.Disposable[] = [];
    
    /**
     * Creates a new LLMSessionManager
     */
    constructor(
        private readonly connectionManager: LLMConnectionManager,
        private readonly hostManager: LLMHostManager
    ) {
        this.configService = new LLMSessionConfigService();
        this.requestService = new LLMRequestExecutionService();
        this.trackingService = new LLMSessionTrackingService();
        
        this.setupEventListeners();
    }
    
    /**
     * Sets up event listeners for configuration changes
     */
    private setupEventListeners(): void {
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('copilot-ppa.llm')) {
                    this.configService.reloadConfig();
                }
            })
        );
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
        await this.ensureConnection();
        
        const config = this.configService.getConfig(sessionConfig);
        const controller = this.trackingService.createSession(sessionId);
        
        try {
            return await this.requestService.executeRequest(
                payload,
                config,
                controller.signal,
                config.retries || 0
            );
        } finally {
            this.trackingService.removeSession(sessionId);
        }
    }
    
    /**
     * Ensures the connection to the LLM service
     */
    private async ensureConnection(): Promise<void> {
        if (this.connectionManager.connectionState !== ConnectionState.CONNECTED) {
            const connected = await this.connectionManager.connectToLLM();
            if (!connected) {
                throw new Error('Failed to connect to LLM service');
            }
        }
    }
    
    /**
     * Aborts an ongoing LLM session
     * 
     * @param sessionId The ID of the session to abort
     */
    public abortSession(sessionId: string): boolean {
        return this.trackingService.abortSession(sessionId);
    }
    
    /**
     * Disposes resources used by the manager
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.trackingService.dispose();
    }
}