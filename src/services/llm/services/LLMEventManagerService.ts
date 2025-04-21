import { EventEmitter } from 'events';
import { LLMConnectionState, LLMStateTransition, LLMEvent } from '../types';

export class LLMEventManagerService extends EventEmitter {
    private currentState: Map<string, LLMConnectionState> = new Map();
    private stateHistory: Map<string, LLMStateTransition[]> = new Map();
    private maxHistoryLength = 100;

    constructor() {
        super();
    }

    public emitEvent(providerId: string, event: LLMEvent): void {
        const timestamp = Date.now();
        this.emit(event.type, { ...event, providerId, timestamp });
        
        if (this.isStateChangeEvent(event)) {
            this.handleStateChange(providerId, event, timestamp);
        }
    }

    private isStateChangeEvent(event: LLMEvent): boolean {
        return 'newState' in event;
    }

    private handleStateChange(providerId: string, event: LLMStateTransition, timestamp: number): void {
        const oldState = this.currentState.get(providerId);
        this.currentState.set(providerId, event.newState);

        const transition: LLMStateTransition = {
            oldState,
            newState: event.newState,
            reason: event.reason,
            timestamp
        };

        this.addToHistory(providerId, transition);
        this.emit('stateChange', { providerId, ...transition });
    }

    private addToHistory(providerId: string, transition: LLMStateTransition): void {
        if (!this.stateHistory.has(providerId)) {
            this.stateHistory.set(providerId, []);
        }

        const history = this.stateHistory.get(providerId)!;
        history.push(transition);

        // Maintain max history length
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }
    }

    public getCurrentState(providerId: string): LLMConnectionState | undefined {
        return this.currentState.get(providerId);
    }

    public getStateHistory(providerId: string): LLMStateTransition[] {
        return [...(this.stateHistory.get(providerId) || [])];
    }

    public clearHistory(providerId: string): void {
        this.stateHistory.set(providerId, []);
    }

    public dispose(): void {
        this.removeAllListeners();
        this.currentState.clear();
        this.stateHistory.clear();
    }
}