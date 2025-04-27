"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelStateService = void 0;
const events_1 = require("events");
const logger_1 = require("../../utils/logger");
class ModelStateService {
    constructor(storageOptions = {
        persistenceInterval: 5000,
        maxHistoryItems: 100
    }) {
        this.storageOptions = storageOptions;
        this._stateEmitter = new events_1.EventEmitter();
        this._states = new Map();
        this._persistenceInterval = null;
        this._logger = logger_1.Logger.for('ModelStateService');
        this.startPersistence();
    }
    async getState(modelId) {
        try {
            return this._states.get(modelId);
        }
        catch (error) {
            this._logger.error('Failed to get model state', { modelId, error });
            throw error;
        }
    }
    async setState(modelId, state) {
        try {
            const currentState = this._states.get(modelId) || {};
            const newState = { ...currentState, ...state };
            this._states.set(modelId, newState);
            this._stateEmitter.emit('stateChanged', {
                modelId,
                oldState: currentState,
                newState
            });
            await this.synchronizeState(modelId);
        }
        catch (error) {
            this._logger.error('Failed to set model state', { modelId, error });
            throw error;
        }
    }
    onStateChanged(listener) {
        this._stateEmitter.on('stateChanged', listener);
        return {
            dispose: () => this._stateEmitter.removeListener('stateChanged', listener)
        };
    }
    async synchronizeState(modelId) {
        try {
            const state = this._states.get(modelId);
            if (!state) {
                return;
            }
            // Trigger state persistence
            await this.persistState(modelId, state);
            // Notify any other services that need to sync
            this._stateEmitter.emit('stateSync', { modelId, state });
        }
        catch (error) {
            this._logger.error('State synchronization failed', { modelId, error });
        }
    }
    startPersistence() {
        if (this._persistenceInterval) {
            return;
        }
        this._persistenceInterval = setInterval(() => this.persistAllStates(), this.storageOptions.persistenceInterval);
    }
    async persistAllStates() {
        try {
            const persistPromises = Array.from(this._states.entries())
                .map(([modelId, state]) => this.persistState(modelId, state));
            await Promise.all(persistPromises);
        }
        catch (error) {
            this._logger.error('Failed to persist states', { error });
        }
    }
    async persistState(modelId, state) {
        try {
            // Implement actual persistence logic here
            // This could write to disk, database, etc.
        }
        catch (error) {
            this._logger.error('Failed to persist state', { modelId, error });
            throw error;
        }
    }
    dispose() {
        if (this._persistenceInterval) {
            clearInterval(this._persistenceInterval);
            this._persistenceInterval = null;
        }
        this._stateEmitter.removeAllListeners();
        this._states.clear();
    }
}
exports.ModelStateService = ModelStateService;
//# sourceMappingURL=ModelStateService.js.map