import { EventEmitter } from 'events';
import { Disposable } from 'vscode';
import { Logger } from '../../utils/logger';
import { IModelState, ModelStateChangeEvent, StateStorageOptions } from '../types';

export class ModelStateService implements Disposable {
    private readonly _stateEmitter = new EventEmitter();
    private readonly _states = new Map<string, IModelState>();
    private readonly _logger: Logger;
    private _persistenceInterval: NodeJS.Timer | null = null;

    constructor(
        private readonly storageOptions: StateStorageOptions = {
            persistenceInterval: 5000,
            maxHistoryItems: 100
        }
    ) {
        this._logger = Logger.for('ModelStateService');
        this.startPersistence();
    }

    public async getState(modelId: string): Promise<IModelState | undefined> {
        try {
            return this._states.get(modelId);
        } catch (error) {
            this._logger.error('Failed to get model state', { modelId, error });
            throw error;
        }
    }

    public async setState(modelId: string, state: Partial<IModelState>): Promise<void> {
        try {
            const currentState = this._states.get(modelId) || {};
            const newState = { ...currentState, ...state };
            this._states.set(modelId, newState);
            
            this._stateEmitter.emit('stateChanged', {
                modelId,
                oldState: currentState,
                newState
            } as ModelStateChangeEvent);

            await this.synchronizeState(modelId);
        } catch (error) {
            this._logger.error('Failed to set model state', { modelId, error });
            throw error;
        }
    }

    public onStateChanged(listener: (event: ModelStateChangeEvent) => void): Disposable {
        this._stateEmitter.on('stateChanged', listener);
        return {
            dispose: () => this._stateEmitter.removeListener('stateChanged', listener)
        };
    }

    private async synchronizeState(modelId: string): Promise<void> {
        try {
            const state = this._states.get(modelId);
            if (!state) {return;}

            // Trigger state persistence
            await this.persistState(modelId, state);
            
            // Notify any other services that need to sync
            this._stateEmitter.emit('stateSync', { modelId, state });
        } catch (error) {
            this._logger.error('State synchronization failed', { modelId, error });
        }
    }

    private startPersistence(): void {
        if (this._persistenceInterval) {return;}

        this._persistenceInterval = setInterval(
            () => this.persistAllStates(),
            this.storageOptions.persistenceInterval
        );
    }

    private async persistAllStates(): Promise<void> {
        try {
            const persistPromises = Array.from(this._states.entries())
                .map(([modelId, state]) => this.persistState(modelId, state));
            await Promise.all(persistPromises);
        } catch (error) {
            this._logger.error('Failed to persist states', { error });
        }
    }

    private async persistState(modelId: string, state: IModelState): Promise<void> {
        try {
            // Implement actual persistence logic here
            // This could write to disk, database, etc.
        } catch (error) {
            this._logger.error('Failed to persist state', { modelId, error });
            throw error;
        }
    }

    public dispose(): void {
        if (this._persistenceInterval) {
            clearInterval(this._persistenceInterval);
            this._persistenceInterval = null;
        }
        this._stateEmitter.removeAllListeners();
        this._states.clear();
    }
}
