/**
 * LLM Connection Manager - Responsible for managing connections to LLM services
 */
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMHostManager } from './LLMHostManager';
import {
    ConnectionState,
    ConnectionStateChangeEvent,
    ConnectionErrorEvent,
    LLMConnectionOptions,
    DEFAULT_CONNECTION_OPTIONS
} from '../../types/llm';
import {
    calculateRetryDelay,
    delay,
    testConnection
} from './connectionUtils';

/**
 * Events emitted by the LLMConnectionManager
 */
export interface LLMConnectionManagerEvents {
    stateChanged: (event: ConnectionStateChangeEvent) => void;
    error: (event: ConnectionErrorEvent) => void;
    connected: () => void;
    disconnected: () => void;
}

/**
 * Connection Manager for LLM services
 */
export class LLMConnectionManager extends EventEmitter {
    private static instance: LLMConnectionManager;
    private retryCount = 0;
    private connectionTimeout: NodeJS.Timeout | null = null;
    private statusBarItem: vscode.StatusBarItem;
    private _connectionState: ConnectionState = ConnectionState.DISCONNECTED;
    private _hostManager: LLMHostManager;
    private _options: LLMConnectionOptions;

    /**
     * Creates a new LLMConnectionManager
     * @param options Connection options
     */
    private constructor(options: Partial<LLMConnectionOptions> = {}) {
        super();
        this._options = { ...DEFAULT_CONNECTION_OPTIONS, ...options };
        this._hostManager = LLMHostManager.getInstance();
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            99
        );
        this.updateStatusBar();
        this.setupEventListeners();
    }

    /**
     * Gets the singleton instance of LLMConnectionManager
     * @param options Connection options
     */
    public static getInstance(options: Partial<LLMConnectionOptions> = {}): LLMConnectionManager {
        if (!this.instance) {
            this.instance = new LLMConnectionManager(options);
        }
        return this.instance;
    }

    /**
     * Gets the current connection state
     */
    public get connectionState(): ConnectionState {
        return this._connectionState;
    }

    /**
     * Sets the connection state and emits events
     */
    private set connectionState(newState: ConnectionState) {
        if (this._connectionState !== newState) {
            const previousState = this._connectionState;
            this._connectionState = newState;
            
            const event: ConnectionStateChangeEvent = {
                previousState,
                currentState: newState,
                timestamp: Date.now()
            };
            
            this.emit('stateChanged', event);
            
            if (newState === ConnectionState.CONNECTED) {
                this.emit('connected');
            } else if (newState === ConnectionState.DISCONNECTED) {
                this.emit('disconnected');
            }
            
            this.updateStatusBar();
        }
    }

    /**
     * Sets up event listeners for host manager events
     */
    private setupEventListeners(): void {
        this._hostManager.on('error', (error: Error) => {
            this.handleError(error);
        });
        
        this._hostManager.on('stateChanged', () => {
            if (!this._hostManager.isRunning() && 
                this._connectionState === ConnectionState.CONNECTED) {
                this.connectionState = ConnectionState.DISCONNECTED;
            }
        });
    }

    /**
     * Connects to the LLM service
     * @returns Promise resolving to true if connection successful
     */
    public async connectToLLM(): Promise<boolean> {
        try {
            if (this._connectionState === ConnectionState.CONNECTED) {
                return true;
            }
            
            this.connectionState = ConnectionState.CONNECTING;
            
            // Ensure host is running
            if (!this._hostManager.isRunning()) {
                try {
                    await this._hostManager.startHost();
                } catch (error) {
                    this.handleError(error instanceof Error ? error : new Error(String(error)));
                    return false;
                }
            }

            // Try to establish connection
            const success = await testConnection(
                this._options.healthEndpoint,
                this._options.connectionTimeout
            );
            
            if (success) {
                this.connectionState = ConnectionState.CONNECTED;
                this.retryCount = 0;
                return true;
            }

            return await this.handleConnectionFailure();
        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
            return await this.handleConnectionFailure();
        }
    }

    /**
     * Disconnects from the LLM service
     */
    public async disconnect(): Promise<void> {
        this.clearConnectionTimeout();
        this.connectionState = ConnectionState.DISCONNECTED;
    }

    /**
     * Handle connection failures with retry logic
     * @returns Promise resolving to false (connection failed)
     */
    private async handleConnectionFailure(): Promise<boolean> {
        this.connectionState = ConnectionState.ERROR;
        
        if (this.retryCount < this._options.maxRetries) {
            const retryDelay = calculateRetryDelay(this.retryCount, this._options);
            this.retryCount++;
            
            console.log(`Connection attempt failed. Retrying in ${retryDelay}ms (${this.retryCount}/${this._options.maxRetries})`);
            
            this.clearConnectionTimeout();
            this.connectionTimeout = setTimeout(async () => {
                await this.connectToLLM();
            }, retryDelay);
            
            return false;
        }
        
        this.connectionState = ConnectionState.DISCONNECTED;
        return false;
    }

    /**
     * Clear any existing connection timeout
     */
    private clearConnectionTimeout(): void {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
    }

    /**
     * Handles and emits connection errors
     * @param error The error that occurred
     */
    private handleError(error: Error): void {
        console.error('LLM connection error:', error);
        
        const errorEvent: ConnectionErrorEvent = {
            error,
            connectionState: this._connectionState,
            retryCount: this.retryCount,
            timestamp: Date.now()
        };
        
        this.emit('error', errorEvent);
    }

    /**
     * Updates the status bar based on the current connection state
     */
    private updateStatusBar(): void {
        const icons = {
            [ConnectionState.CONNECTED]: '$(link)',
            [ConnectionState.CONNECTING]: '$(sync~spin)',
            [ConnectionState.DISCONNECTED]: '$(unlink)',
            [ConnectionState.ERROR]: '$(warning)'
        };

        this.statusBarItem.text = `${icons[this._connectionState]} LLM: ${this._connectionState}`;
        this.statusBarItem.show();
    }

    /**
     * Disposes resources used by the manager
     */
    public dispose(): void {
        this.clearConnectionTimeout();
        this.statusBarItem.dispose();
        this.removeAllListeners();
    }
}