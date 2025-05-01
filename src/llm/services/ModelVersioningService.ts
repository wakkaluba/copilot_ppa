import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';

export interface IVersionInfo {
    version: string;
    timestamp: number;
    commitHash?: string;
    changes: string[];
    metadata: Record<string, unknown>;
}

export interface IVersionCreateOptions {
    modelId: string;
    version: string;
    changes: string[];
    metadata?: Record<string, unknown>;
}

export interface IVersionCompareResult {
    base: IVersionInfo;
    target: IVersionInfo;
    differences: {
        changes: string[];
        metadataChanges: Record<string, { from: unknown; to: unknown }>;
    };
}

@injectable()
export class ModelVersioningService extends EventEmitter {
    private readonly versionMap = new Map<string, Map<string, IVersionInfo>>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public async createVersion(options: IVersionCreateOptions): Promise<IVersionInfo> {
        try {
            const modelVersions = this.versionMap.get(options.modelId) || new Map<string, IVersionInfo>();

            if (modelVersions.has(options.version)) {
                throw new Error(`Version ${options.version} already exists for model ${options.modelId}`);
            }

            const versionInfo: IVersionInfo = {
                version: options.version,
                timestamp: Date.now(),
                changes: options.changes,
                metadata: options.metadata || {}
            };

            modelVersions.set(options.version, versionInfo);
            this.versionMap.set(options.modelId, modelVersions);

            this.emit('versionCreated', { modelId: options.modelId, version: versionInfo });
            return versionInfo;
        } catch (error) {
            this.handleError('Failed to create version', error as Error);
            throw error;
        }
    }

    public async getVersion(modelId: string, version: string): Promise<IVersionInfo> {
        const modelVersions = this.versionMap.get(modelId);
        const versionInfo = modelVersions?.get(version);

        if (!versionInfo) {
            throw new Error(`Version ${version} not found for model ${modelId}`);
        }

        return versionInfo;
    }

    public async compareVersions(
        modelId: string,
        baseVersion: string,
        targetVersion: string
    ): Promise<IVersionCompareResult> {
        try {
            const [base, target] = await Promise.all([
                this.getVersion(modelId, baseVersion),
                this.getVersion(modelId, targetVersion)
            ]);

            const metadataChanges: Record<string, { from: unknown; to: unknown }> = {};
            const allKeys = new Set([...Object.keys(base.metadata), ...Object.keys(target.metadata)]);

            for (const key of allKeys) {
                if (base.metadata[key] !== target.metadata[key]) {
                    metadataChanges[key] = {
                        from: base.metadata[key],
                        to: target.metadata[key]
                    };
                }
            }

            return {
                base,
                target,
                differences: {
                    changes: target.changes,
                    metadataChanges
                }
            };
        } catch (error) {
            this.handleError('Failed to compare versions', error as Error);
            throw error;
        }
    }

    public async listVersions(modelId: string): Promise<IVersionInfo[]> {
        const modelVersions = this.versionMap.get(modelId);
        return modelVersions ? Array.from(modelVersions.values()) : [];
    }

    public async deleteVersion(modelId: string, version: string): Promise<void> {
        try {
            const modelVersions = this.versionMap.get(modelId);
            if (!modelVersions?.has(version)) {
                throw new Error(`Version ${version} not found for model ${modelId}`);
            }

            modelVersions.delete(version);
            this.emit('versionDeleted', { modelId, version });
        } catch (error) {
            this.handleError('Failed to delete version', error as Error);
            throw error;
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelVersioningService]', message, error);
        this.emit('error', error);
    }
}
