/**
 * LLM Session Manager - Handles sessions for communicating with LLM services
 */
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMConnectionManager } from './LLMConnectionManager';
import { ConnectionState } from '../../types/llm';
import { LLMSessionConfigService } from './services/LLMSessionConfigService';
import { LLMRequestExecutionService } from './services/LLMRequestExecutionService';
import { LLMSessionTrackingService } from './services/LLMSessionTrackingService';
import { LLMMessagePayload, LLMSessionConfig, LLMResponse } from './interfaces';
import { ConnectionEvent } from './types';

/**
 * Manager for LLM sessions - handles session lifecycle, configuration, and tracking
 */
export class LLMSessionManager implements vscode.Disposable {
    private static instance: LLMSessionManager;
    private readonly disposables: vscode.Disposable[] = [];
    private readonly configService: LLMSessionConfigService;
    private readonly trackingService: LLMSessionTrackingService;
    private readonly requestService: LLMRequestExecutionService;
    private readonly connectionManager: LLMConnectionManager;

    private constructor(connectionManager: LLMConnectionManager) {
        this.connectionManager = connectionManager;
        this.configService = new LLMSessionConfigService();
        this.requestService = new LLMRequestExecutionService();
        this.trackingService = new LLMSessionTrackingService();
        
        this.setupEventListeners();
    }

    public static getInstance(connectionManager: LLMConnectionManager): LLMSessionManager {
        if (!LLMSessionManager.instance) {
            LLMSessionManager.instance = new LLMSessionManager(connectionManager);
        }
        return LLMSessionManager.instance;
    }

    private setupEventListeners(): void {
        // Listen for configuration changes
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('copilot-ppa.llm')) {
                    this.configService.reloadConfig();
                }
            })
        );

        // Listen for connection events
        this.connectionManager.on(ConnectionEvent.Disconnected, () => {
            this.trackingService.stopAllSessions();
        });

        this.connectionManager.on(ConnectionEvent.Error, (error) => {
            this.trackingService.handleError(error);
        });
    }

    /**
     * Execute an LLM request within a session
     */
    public async executeRequest(
        request: string,
        sessionConfig?: Partial<LLMSessionConfig>,
        sessionId = crypto.randomUUID()
    ): Promise<LLMResponse> {
        await this.connectionManager.connectToLLM();

        const config = this.configService.mergeConfig(sessionConfig);
        const session = this.trackingService.startSession(sessionId, config);

        try {
            const response = await this.requestService.execute(request, config);
            this.trackingService.recordSuccess(sessionId, response);
            return response;
        } catch (error) {
            this.trackingService.recordError(sessionId, error);
            throw error;
        } finally {
            this.trackingService.endSession(sessionId);
        }
    }

    /**
     * Abort an ongoing LLM session
     */
    public abortSession(sessionId: string): boolean {
        const aborted = this.requestService.abortRequest(sessionId);
        if (aborted) {
            this.trackingService.endSession(sessionId, 'aborted');
        }
        return aborted;
    }

    /**
     * Get current session statistics
     */
    public getSessionStats() {
        return this.trackingService.getStats();
    }

    /**
     * Get current session configuration
     */
    public getSessionConfig(): LLMSessionConfig {
        return this.configService.getCurrentConfig();
    }

    public dispose(): void {
        this.trackingService.dispose();
        this.requestService.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}