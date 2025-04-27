"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMEventManagerService = void 0;
const events_1 = require("events");
class LLMEventManagerService extends events_1.EventEmitter {
    constructor() {
        super();
        this.currentState = new Map();
        this.stateHistory = new Map();
        this.maxHistoryLength = 100;
    }
    emitEvent(providerId, event) {
        const timestamp = Date.now();
        this.emit(event.type, { ...event, providerId, timestamp });
        if (this.isStateChangeEvent(event)) {
            this.handleStateChange(providerId, event, timestamp);
        }
    }
    isStateChangeEvent(event) {
        return 'newState' in event;
    }
    handleStateChange(providerId, event, timestamp) {
        const oldState = this.currentState.get(providerId);
        this.currentState.set(providerId, event.newState);
        const transition = {
            oldState,
            newState: event.newState,
            reason: event.reason,
            timestamp
        };
        this.addToHistory(providerId, transition);
        this.emit('stateChange', { providerId, ...transition });
    }
    addToHistory(providerId, transition) {
        if (!this.stateHistory.has(providerId)) {
            this.stateHistory.set(providerId, []);
        }
        const history = this.stateHistory.get(providerId);
        history.push(transition);
        // Maintain max history length
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }
    }
    getCurrentState(providerId) {
        return this.currentState.get(providerId);
    }
    getStateHistory(providerId) {
        return [...(this.stateHistory.get(providerId) || [])];
    }
    clearHistory(providerId) {
        this.stateHistory.set(providerId, []);
    }
    dispose() {
        this.removeAllListeners();
        this.currentState.clear();
        this.stateHistory.clear();
    }
}
exports.LLMEventManagerService = LLMEventManagerService;
//# sourceMappingURL=LLMEventManagerService.js.map