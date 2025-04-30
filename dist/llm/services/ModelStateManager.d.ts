import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
import { ModelLifecycleState, ModelStateSnapshot, StateTransition } from '../types';
import { IPersistenceService } from '../interfaces/IPersistenceService';
export declare class ModelStateManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly persistence;
    private readonly stateMap;
    private readonly stateHistory;
    private readonly outputChannel;
    private readonly maxHistorySize;
    private readonly storageKey;
    constructor(logger: ILogger, persistence: IPersistenceService);
    updateState(modelId: string, state: ModelLifecycleState): Promise<void>;
    getState(modelId: string): ModelLifecycleState | undefined;
    getStateHistory(modelId: string): StateTransition[];
    getStateSnapshot(modelId: string): ModelStateSnapshot | undefined;
    private emitStateChange;
    private persistStates;
    private loadPersistedStates;
    private trackStateTransition;
    private logStateChange;
    private handleError;
    dispose(): void;
}
