import { Disposable } from 'vscode';
import { IModelInfo, ModelRegistrationEvent, ModelDependency } from '../types';
export declare class ModelRegistryService implements Disposable {
    private readonly _registryEmitter;
    private readonly _registry;
    private readonly _dependencies;
    private readonly _logger;
    constructor();
    registerModel(modelId: string, info: IModelInfo): Promise<void>;
    addDependency(modelId: string, dependency: ModelDependency): Promise<void>;
    validateDependencies(modelId: string): Promise<boolean>;
    private validateDependency;
    getModel(modelId: string): Promise<IModelInfo | undefined>;
    getDependencies(modelId: string): Promise<ModelDependency[]>;
    onModelRegistered(listener: (event: ModelRegistrationEvent) => void): Disposable;
    dispose(): void;
}
