import { EventEmitter } from 'events';
import { 
    ConnectionState, 
    ConnectionEventData, 
    ConnectionEvent, 
    ModelInfo,
    ConnectionStateChangeEvent 
} from '../types';
import { LLMMetricsService } from './LLMMetricsService';

export interface StateTransitionConfig {
    allowedTransitions: Map<ConnectionState, Set<ConnectionState>>;
    transitionTimeouts: Map<ConnectionState, number>;
}

/**
 * Service for managing LLM connection events and state transitions
 */
export class LLMConnectionEventService extends EventEmitter {
    private currentState: ConnectionState = 'disconnected';
    private previousState: ConnectionState = 'disconnected';
    private stateTimestamp: number = Date.now();
    private modelInfo?: ModelInfo;
    private lastError?: Error;
    private stateTimeout?: NodeJS.Timeout;

    private readonly defaultTransitionConfig: StateTransitionConfig = {
        allowedTransitions: new Map([
            ['disconnected', new Set(['connecting', 'error'])],
            ['connecting', new Set(['connected', 'error', 'reconnecting'])],
            ['connected', new Set(['disconnected', 'error'])],
            ['error', new Set(['reconnecting', 'disconnected'])],
            ['reconnecting', new Set(['connected', 'error', 'disconnected'])]
        ]),
        transitionTimeouts: new Map([
            ['connecting', 30000],     // 30 seconds timeout for connecting
            ['reconnecting', 60000],   // 60 seconds timeout for reconnecting
        ])
    };

    constructor(
        private readonly metricsService: LLMMetricsService,
        private readonly config: StateTransitionConfig = defaultTransitionConfig
    ) {
        super();
    }

    public getCurrentState(): ConnectionState {
        return this.currentState;
    }

    public async transitionTo(
        newState: ConnectionState, 
        metadata?: { error?: Error; modelInfo?: ModelInfo }
    ): Promise<boolean> {
        if (!this.isValidTransition(newState)) {
            console.warn(`Invalid state transition from ${this.currentState} to ${newState}`);
            return false;
        }

        this.clearStateTimeout();
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateTimestamp = Date.now();

        if (metadata?.error) {
            this.lastError = metadata.error;
        }
        if (metadata?.modelInfo) {
            this.modelInfo = metadata.modelInfo;
        }

        const eventData = this.createEventData();
        this.emit(ConnectionEvent.StateChanged, eventData);
        this.emit(newState, eventData);

        // Set timeout for transitional states
        const timeout = this.config.transitionTimeouts.get(newState);
        if (timeout) {
            this.setStateTimeout(timeout);
        }

        return true;
    }

    private isValidTransition(newState: ConnectionState): boolean {
        const allowedStates = this.config.allowedTransitions.get(this.currentState);
        return allowedStates?.has(newState) || false;
    }

    private setStateTimeout(timeout: number): void {
        this.clearStateTimeout();
        this.stateTimeout = setTimeout(() => {
            this.handleStateTimeout();
        }, timeout);
    }

    private clearStateTimeout(): void {
        if (this.stateTimeout) {
            clearTimeout(this.stateTimeout);
            this.stateTimeout = undefined;
        }
    }

    private async handleStateTimeout(): Promise<void> {
        if (this.currentState === 'connecting' || this.currentState === 'reconnecting') {
            const error = new Error(`${this.currentState} timed out after ${this.config.transitionTimeouts.get(this.currentState)}ms`);
            await this.transitionTo('error', { error });
        }
    }

    private createEventData(): ConnectionStateChangeEvent {
        return {
            previousState: this.previousState,
            currentState: this.currentState,
            timestamp: this.stateTimestamp,
            duration: Date.now() - this.stateTimestamp,
            error: this.lastError,
            modelInfo: this.modelInfo
        };
    }

    public reset(): void {
        this.clearStateTimeout();
        this.currentState = 'disconnected';
        this.previousState = 'disconnected';
        this.stateTimestamp = Date.now();
        this.lastError = undefined;
        this.modelInfo = undefined;
        this.emit(ConnectionEvent.StateChanged, this.createEventData());
    }

    public dispose(): void {
        this.clearStateTimeout();
        this.removeAllListeners();
    }
}