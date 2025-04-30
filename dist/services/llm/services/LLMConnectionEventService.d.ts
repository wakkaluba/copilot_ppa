import { EventEmitter } from 'events';
import { ConnectionState, ModelInfo } from '../types';
import { LLMMetricsService } from './LLMMetricsService';
export interface StateTransitionConfig {
    allowedTransitions: Map<ConnectionState, Set<ConnectionState>>;
    transitionTimeouts: Map<ConnectionState, number>;
}
/**
 * Service for managing LLM connection events and state transitions
 */
export declare class LLMConnectionEventService extends EventEmitter {
    private readonly metricsService;
    private readonly config;
    private currentState;
    private previousState;
    private stateTimestamp;
    private modelInfo?;
    private lastError?;
    private stateTimeout?;
    private readonly defaultTransitionConfig;
    constructor(metricsService: LLMMetricsService, config?: StateTransitionConfig);
    getCurrentState(): ConnectionState;
    transitionTo(newState: ConnectionState, metadata?: {
        error?: Error;
        modelInfo?: ModelInfo;
    }): Promise<boolean>;
    private isValidTransition;
    private setStateTimeout;
    private clearStateTimeout;
    private handleStateTimeout;
    private createEventData;
    reset(): void;
    dispose(): void;
}
