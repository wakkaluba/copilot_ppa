import { EventEmitter } from 'events';
import { Disposable } from 'vscode';
import { Logger } from '../../utils/logger';
import { IModelInfo, ModelRegistrationEvent, ModelDependency } from '../types';

export class ModelRegistryService implements Disposable {
    private readonly _registryEmitter = new EventEmitter();
    private readonly _registry = new Map<string, IModelInfo>();
    private readonly _dependencies = new Map<string, Set<ModelDependency>>();
    private readonly _logger: Logger;

    constructor() {
        this._logger = Logger.for('ModelRegistryService');
    }

    public async registerModel(modelId: string, info: IModelInfo): Promise<void> {
        try {
            if (this._registry.has(modelId)) {
                throw new Error(`Model ${modelId} is already registered`);
            }

            this._registry.set(modelId, info);
            this._dependencies.set(modelId, new Set());
            
            this._registryEmitter.emit('modelRegistered', {
                modelId,
                info,
                timestamp: Date.now()
            } as ModelRegistrationEvent);
        } catch (error) {
            this._logger.error('Failed to register model', { modelId, error });
            throw error;
        }
    }

    public async addDependency(modelId: string, dependency: ModelDependency): Promise<void> {
        try {
            const dependencies = this._dependencies.get(modelId);
            if (!dependencies) {
                throw new Error(`Model ${modelId} not found`);
            }

            dependencies.add(dependency);
            
            this._registryEmitter.emit('dependencyAdded', {
                modelId,
                dependency,
                timestamp: Date.now()
            });
        } catch (error) {
            this._logger.error('Failed to add dependency', { modelId, error });
            throw error;
        }
    }

    public async validateDependencies(modelId: string): Promise<boolean> {
        try {
            const dependencies = this._dependencies.get(modelId);
            if (!dependencies) {
                throw new Error(`Model ${modelId} not found`);
            }

            const validations = Array.from(dependencies).map(
                dep => this.validateDependency(dep)
            );
            
            const results = await Promise.all(validations);
            return results.every(result => result);
        } catch (error) {
            this._logger.error('Failed to validate dependencies', { modelId, error });
            throw error;
        }
    }

    private async validateDependency(dependency: ModelDependency): Promise<boolean> {
        // Add actual dependency validation logic here
        // This is a placeholder implementation
        return true;
    }

    public async getModel(modelId: string): Promise<IModelInfo | undefined> {
        return this._registry.get(modelId);
    }

    public async getDependencies(modelId: string): Promise<ModelDependency[]> {
        const dependencies = this._dependencies.get(modelId);
        return dependencies ? Array.from(dependencies) : [];
    }

    public onModelRegistered(listener: (event: ModelRegistrationEvent) => void): Disposable {
        this._registryEmitter.on('modelRegistered', listener);
        return {
            dispose: () => this._registryEmitter.removeListener('modelRegistered', listener)
        };
    }

    public dispose(): void {
        this._registryEmitter.removeAllListeners();
        this._registry.clear();
        this._dependencies.clear();
    }
}
