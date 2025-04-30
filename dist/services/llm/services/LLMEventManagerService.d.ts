import { EventEmitter } from 'events';
import { LLMConnectionState, LLMStateTransition, LLMEvent } from '../types';
export declare class LLMEventManagerService extends EventEmitter {
    private currentState;
    private stateHistory;
    private maxHistoryLength;
    constructor();
    emitEvent(providerId: string, event: LLMEvent): void;
    private isStateChangeEvent;
    private handleStateChange;
    private addToHistory;
    getCurrentState(providerId: string): LLMConnectionState | undefined;
    getStateHistory(providerId: string): LLMStateTransition[];
    clearHistory(providerId: string): void;
    dispose(): void;
}
