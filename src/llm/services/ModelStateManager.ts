import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
import { ModelLifecycleState, ModelStateSnapshot, StateTransition } from '../types';
import { IPersistenceService } from '../interfaces/IPersistenceService';

@injectable()
export class ModelStateManager extends EventEmitter implements vscode.Disposable {
    private readonly stateMap = new Map<string, ModelLifecycleState>();
    private readonly stateHistory = new Map<string, StateTransition[]>();
    private readonly outputChannel: vscode.OutputChannel;
    private readonly maxHistorySize = 1000;
    private readonly storageKey = 'model-states';

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(IPersistenceService) private readonly persistence: IPersistenceService
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model State');
        this.loadPersistedStates();
    }

    public async updateState(modelId: string, state: ModelLifecycleState): Promise<void> {
        try {
            const oldState = this.stateMap.get(modelId);
            this.stateMap.set(modelId, state);
            
            this.trackStateTransition(modelId, oldState, state);
            this.emitStateChange(modelId, state);
            this.logStateChange(modelId, oldState, state);
            await this.persistStates();
        } catch (error) {
            this.handleError('Failed to update state', error as Error);
        }
    }

    public getState(modelId: string): ModelLifecycleState | undefined {
        return this.stateMap.get(modelId);
    }

    public getStateHistory(modelId: string): StateTransition[] {
        return [...(this.stateHistory.get(modelId) || [])];
    }

    public getStateSnapshot(modelId: string): ModelStateSnapshot | undefined {
        const state = this.getState(modelId);
        if (!state) {return undefined;}

        return {
            modelId,
            state,
            timestamp: new Date(),
            transitions: this.getStateHistory(modelId)
        };
    }

    private emitStateChange(modelId: string, state: ModelLifecycleState): void {
        this.emit('stateChanged', { modelId, state });
    }

    private async persistStates(): Promise<void> {
        try {
            const stateData = Array.from(this.stateMap.entries()).map(([id, state]) => ({
                modelId: id,
                state,
                history: this.getStateHistory(id)
            }));

            await this.persistence.saveData(this.storageKey, stateData);
        } catch (error) {
            this.handleError('Failed to persist states', error as Error);
        }
    }

    private async loadPersistedStates(): Promise<void> {
        try {
            const stateData = await this.persistence.loadData<any[]>(this.storageKey) || [];
            
            for (const data of stateData) {
                if (data.modelId && data.state) {
                    this.stateMap.set(data.modelId, data.state);
                    if (data.history) {
                        this.stateHistory.set(data.modelId, data.history);
                    }
                }
            }
        } catch (error) {
            this.handleError('Failed to load persisted states', error as Error);
        }
    }

    private trackStateTransition(
        modelId: string, 
        oldState?: ModelLifecycleState, 
        newState: ModelLifecycleState
    ): void {
        const history = this.stateHistory.get(modelId) || [];
        const transition: StateTransition = {
            from: oldState || 'initial',
            to: newState,
            timestamp: new Date()
        };

        history.push(transition);
        
        if (history.length > this.maxHistorySize) {
            history.shift(); // Remove oldest entry
        }

        this.stateHistory.set(modelId, history);
    }

    private logStateChange(
        modelId: string, 
        oldState?: ModelLifecycleState, 
        newState: ModelLifecycleState
    ): void {
        this.outputChannel.appendLine('\nModel State Change:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine(`Previous State: ${oldState || 'initial'}`);
        this.outputChannel.appendLine(`New State: ${newState}`);
        this.outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelStateManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.stateMap.clear();
        this.stateHistory.clear();
    }
}
