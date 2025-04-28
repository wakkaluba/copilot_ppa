"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConnectionEventService = void 0;
const events_1 = require("events");
const types_1 = require("../types");
/**
 * Service for managing LLM connection events and state transitions
 */
class LLMConnectionEventService extends events_1.EventEmitter {
    constructor(metricsService, config = defaultTransitionConfig) {
        super();
        this.metricsService = metricsService;
        this.config = config;
        this.currentState = 'disconnected';
        this.previousState = 'disconnected';
        this.stateTimestamp = Date.now();
        this.defaultTransitionConfig = {
            allowedTransitions: new Map([
                ['disconnected', new Set(['connecting', 'error'])],
                ['connecting', new Set(['connected', 'error', 'reconnecting'])],
                ['connected', new Set(['disconnected', 'error'])],
                ['error', new Set(['reconnecting', 'disconnected'])],
                ['reconnecting', new Set(['connected', 'error', 'disconnected'])]
            ]),
            transitionTimeouts: new Map([
                ['connecting', 30000], // 30 seconds timeout for connecting
                ['reconnecting', 60000], // 60 seconds timeout for reconnecting
            ])
        };
    }
    getCurrentState() {
        return this.currentState;
    }
    async transitionTo(newState, metadata) {
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
        this.emit(types_1.ConnectionEvent.StateChanged, eventData);
        this.emit(newState, eventData);
        // Set timeout for transitional states
        const timeout = this.config.transitionTimeouts.get(newState);
        if (timeout) {
            this.setStateTimeout(timeout);
        }
        return true;
    }
    isValidTransition(newState) {
        const allowedStates = this.config.allowedTransitions.get(this.currentState);
        return allowedStates?.has(newState) || false;
    }
    setStateTimeout(timeout) {
        this.clearStateTimeout();
        this.stateTimeout = setTimeout(() => {
            this.handleStateTimeout();
        }, timeout);
    }
    clearStateTimeout() {
        if (this.stateTimeout) {
            clearTimeout(this.stateTimeout);
            this.stateTimeout = undefined;
        }
    }
    async handleStateTimeout() {
        if (this.currentState === 'connecting' || this.currentState === 'reconnecting') {
            const error = new Error(`${this.currentState} timed out after ${this.config.transitionTimeouts.get(this.currentState)}ms`);
            await this.transitionTo('error', { error });
        }
    }
    createEventData() {
        return {
            previousState: this.previousState,
            currentState: this.currentState,
            timestamp: this.stateTimestamp,
            duration: Date.now() - this.stateTimestamp,
            error: this.lastError,
            modelInfo: this.modelInfo
        };
    }
    reset() {
        this.clearStateTimeout();
        this.currentState = 'disconnected';
        this.previousState = 'disconnected';
        this.stateTimestamp = Date.now();
        this.lastError = undefined;
        this.modelInfo = undefined;
        this.emit(types_1.ConnectionEvent.StateChanged, this.createEventData());
    }
    dispose() {
        this.clearStateTimeout();
        this.removeAllListeners();
    }
}
exports.LLMConnectionEventService = LLMConnectionEventService;
//# sourceMappingURL=LLMConnectionEventService.js.map