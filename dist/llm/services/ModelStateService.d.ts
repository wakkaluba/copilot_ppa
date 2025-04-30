import { Disposable } from 'vscode';
import { IModelState, ModelStateChangeEvent, StateStorageOptions } from '../types';
export declare class ModelStateService implements Disposable {
    private readonly storageOptions;
    private readonly _stateEmitter;
    private readonly _states;
    private readonly _logger;
    private _persistenceInterval;
    constructor(storageOptions?: StateStorageOptions);
    getState(modelId: string): Promise<IModelState | undefined>;
    setState(modelId: string, state: Partial<IModelState>): Promise<void>;
    onStateChanged(listener: (event: ModelStateChangeEvent) => void): Disposable;
    private synchronizeState;
    private startPersistence;
    private persistAllStates;
    private persistState;
    dispose(): void;
}
