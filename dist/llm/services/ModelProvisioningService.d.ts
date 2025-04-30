import { Disposable } from 'vscode';
import { IModelInfo, ModelInstance, ProvisioningEvent } from '../types';
export declare class ModelProvisioningService implements Disposable {
    private readonly _provisioningEmitter;
    private readonly _instances;
    private readonly _allocations;
    private readonly _logger;
    constructor();
    provisionModel(modelId: string, info: IModelInfo): Promise<ModelInstance>;
    private allocateResources;
    private calculateMemoryRequirement;
    private calculateCPURequirement;
    private calculateGPURequirement;
    private calculateNetworkRequirement;
    private validateResourceAvailability;
    private createInstance;
    deprovisionModel(modelId: string): Promise<void>;
    private releaseResources;
    getInstance(modelId: string): Promise<ModelInstance | undefined>;
    onModelProvisioned(listener: (event: ProvisioningEvent) => void): Disposable;
    dispose(): void;
}
