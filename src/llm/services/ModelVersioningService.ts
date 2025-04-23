import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { IDisposable } from '../../types/disposable';
import { Logger } from '../../utils/logger';
import { ModelVersion, ModelVersionChangeEvent, ModelVersionMetadata } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Interface for the Model Versioning Service
 */
export interface IModelVersioningService extends IDisposable {
    /**
     * Register a new model version
     * @param modelId The model identifier
     * @param version The version to register
     * @param metadata Additional version metadata
     */
    registerVersion(modelId: string, version: string, metadata: ModelVersionMetadata): Promise<ModelVersion>;
    
    /**
     * Get all versions of a specific model
     * @param modelId The model identifier
     */
    getVersions(modelId: string): Promise<ModelVersion[]>;
    
    /**
     * Get a specific version of a model
     * @param modelId The model identifier
     * @param version The version to retrieve
     */
    getVersion(modelId: string, version: string): Promise<ModelVersion | undefined>;
    
    /**
     * Get the latest version of a specific model
     * @param modelId The model identifier
     */
    getLatestVersion(modelId: string): Promise<ModelVersion | undefined>;
    
    /**
     * Compare two versions of a model
     * @param modelId The model identifier
     * @param versionA First version to compare
     * @param versionB Second version to compare
     */
    compareVersions(modelId: string, versionA: string, versionB: string): Promise<Record<string, any>>;
    
    /**
     * Roll back to a specific version of a model
     * @param modelId The model identifier
     * @param version The version to roll back to
     */
    rollbackToVersion(modelId: string, version: string): Promise<boolean>;
    
    /**
     * Add a tag to a specific version
     * @param modelId The model identifier
     * @param version The version to tag
     * @param tag The tag to add
     */
    addVersionTag(modelId: string, version: string, tag: string): Promise<boolean>;
    
    /**
     * Remove a tag from a specific version
     * @param modelId The model identifier
     * @param version The version to untag
     * @param tag The tag to remove
     */
    removeVersionTag(modelId: string, version: string, tag: string): Promise<boolean>;
    
    /**
     * Get all versions with a specific tag
     * @param modelId The model identifier
     * @param tag The tag to filter by
     */
    getVersionsByTag(modelId: string, tag: string): Promise<ModelVersion[]>;
    
    /**
     * Create a checkpoint of the current model state
     * @param modelId The model identifier
     * @param metadata Additional checkpoint metadata
     */
    createCheckpoint(modelId: string, metadata: ModelVersionMetadata): Promise<ModelVersion>;
    
    /**
     * Event that fires when a version changes
     */
    readonly onVersionChanged: vscode.Event<ModelVersionChangeEvent>;
}

/**
 * Implementation of the Model Versioning Service
 */
export class ModelVersioningService implements IModelVersioningService {
    private readonly _logger: Logger;
    private readonly _versionStore: Map<string, Map<string, ModelVersion>>;
    private readonly _storagePath: string;
    private readonly _emitter = new EventEmitter();
    private readonly _onVersionChanged = new vscode.EventEmitter<ModelVersionChangeEvent>();
    private readonly _disposables: vscode.Disposable[] = [];

    /**
     * Event that fires when a version changes
     */
    public readonly onVersionChanged = this._onVersionChanged.event;

    /**
     * Create a new ModelVersioningService
     * @param context The extension context
     * @param logger The logger instance
     */
    constructor(context: vscode.ExtensionContext, logger: Logger) {
        this._logger = logger;
        this._versionStore = new Map<string, Map<string, ModelVersion>>();
        this._storagePath = path.join(context.globalStoragePath, 'model-versions');
        
        // Ensure storage directory exists
        if (!fs.existsSync(this._storagePath)) {
            fs.mkdirSync(this._storagePath, { recursive: true });
        }
        
        // Load existing versions
        this._loadVersions().catch(err => {
            this._logger.error('Failed to load model versions', err);
        });
        
        // Register event handlers
        this._emitter.on('versionChanged', (event: ModelVersionChangeEvent) => {
            this._onVersionChanged.fire(event);
        });
        
        // Register disposables
        this._disposables.push(this._onVersionChanged);
    }
    
    /**
     * Load existing versions from storage
     */
    private async _loadVersions(): Promise<void> {
        try {
            const modelDirs = fs.readdirSync(this._storagePath);
            
            for (const modelId of modelDirs) {
                const modelPath = path.join(this._storagePath, modelId);
                
                if (fs.statSync(modelPath).isDirectory()) {
                    const versionFiles = fs.readdirSync(modelPath)
                        .filter(file => file.endsWith('.json'));
                    
                    const modelVersions = new Map<string, ModelVersion>();
                    
                    for (const versionFile of versionFiles) {
                        try {
                            const versionPath = path.join(modelPath, versionFile);
                            const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
                            modelVersions.set(versionData.version, versionData);
                        } catch (err) {
                            this._logger.warn(`Failed to load version from ${versionFile}`, err);
                        }
                    }
                    
                    this._versionStore.set(modelId, modelVersions);
                }
            }
            
            this._logger.info(`Loaded versions for ${this._versionStore.size} models`);
        } catch (err) {
            this._logger.error('Error loading model versions', err);
            throw err;
        }
    }
    
    /**
     * Save a version to storage
     * @param modelId The model identifier
     * @param version The version data to save
     */
    private async _saveVersion(modelId: string, version: ModelVersion): Promise<void> {
        try {
            const modelPath = path.join(this._storagePath, modelId);
            
            if (!fs.existsSync(modelPath)) {
                fs.mkdirSync(modelPath, { recursive: true });
            }
            
            const versionPath = path.join(modelPath, `${version.version}.json`);
            fs.writeFileSync(versionPath, JSON.stringify(version, null, 2), 'utf8');
        } catch (err) {
            this._logger.error(`Failed to save version ${version.version} for model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Register a new model version
     * @param modelId The model identifier
     * @param version The version to register
     * @param metadata Additional version metadata
     */
    public async registerVersion(
        modelId: string, 
        version: string, 
        metadata: ModelVersionMetadata
    ): Promise<ModelVersion> {
        try {
            if (!modelId || !version) {
                throw new Error('Model ID and version are required');
            }
            
            const now = new Date();
            const modelVersion: ModelVersion = {
                modelId,
                version,
                metadata: {
                    ...metadata,
                    createdAt: now.toISOString()
                },
                checksum: metadata.checksum || await this._generateChecksum(modelId, version),
                tags: [],
                history: []
            };
            
            let modelVersions = this._versionStore.get(modelId);
            
            if (!modelVersions) {
                modelVersions = new Map<string, ModelVersion>();
                this._versionStore.set(modelId, modelVersions);
            }
            
            if (modelVersions.has(version)) {
                throw new Error(`Version ${version} already exists for model ${modelId}`);
            }
            
            modelVersions.set(version, modelVersion);
            await this._saveVersion(modelId, modelVersion);
            
            this._emitter.emit('versionChanged', {
                type: 'created',
                modelId,
                version,
                timestamp: now.toISOString()
            });
            
            this._logger.info(`Registered version ${version} for model ${modelId}`);
            return modelVersion;
        } catch (err) {
            this._logger.error(`Failed to register version ${version} for model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Generate a checksum for a model version
     * @param modelId The model identifier
     * @param version The model version
     */
    private async _generateChecksum(modelId: string, version: string): Promise<string> {
        // In a real implementation, this would calculate a checksum of the model files
        // This is a simplified version that creates a unique checksum based on model ID and version
        const hash = crypto.createHash('sha256');
        hash.update(`${modelId}-${version}-${Date.now()}`);
        return hash.digest('hex');
    }
    
    /**
     * Get all versions of a specific model
     * @param modelId The model identifier
     */
    public async getVersions(modelId: string): Promise<ModelVersion[]> {
        try {
            if (!modelId) {
                throw new Error('Model ID is required');
            }
            
            const modelVersions = this._versionStore.get(modelId);
            
            if (!modelVersions) {
                return [];
            }
            
            // Sort versions by creation date (newest first)
            return Array.from(modelVersions.values())
                .sort((a, b) => {
                    const dateA = new Date(a.metadata.createdAt || 0);
                    const dateB = new Date(b.metadata.createdAt || 0);
                    return dateB.getTime() - dateA.getTime();
                });
        } catch (err) {
            this._logger.error(`Failed to get versions for model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Get a specific version of a model
     * @param modelId The model identifier
     * @param version The version to retrieve
     */
    public async getVersion(modelId: string, version: string): Promise<ModelVersion | undefined> {
        try {
            if (!modelId || !version) {
                throw new Error('Model ID and version are required');
            }
            
            const modelVersions = this._versionStore.get(modelId);
            
            if (!modelVersions) {
                return undefined;
            }
            
            return modelVersions.get(version);
        } catch (err) {
            this._logger.error(`Failed to get version ${version} for model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Get the latest version of a specific model
     * @param modelId The model identifier
     */
    public async getLatestVersion(modelId: string): Promise<ModelVersion | undefined> {
        try {
            const versions = await this.getVersions(modelId);
            
            if (versions.length === 0) {
                return undefined;
            }
            
            // First version after sorting by date (newest first)
            return versions[0];
        } catch (err) {
            this._logger.error(`Failed to get latest version for model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Compare two versions of a model
     * @param modelId The model identifier
     * @param versionA First version to compare
     * @param versionB Second version to compare
     */
    public async compareVersions(
        modelId: string, 
        versionA: string, 
        versionB: string
    ): Promise<Record<string, any>> {
        try {
            const vA = await this.getVersion(modelId, versionA);
            const vB = await this.getVersion(modelId, versionB);
            
            if (!vA || !vB) {
                throw new Error(`One or both versions not found for model ${modelId}`);
            }
            
            // Compare based on metadata
            const comparison: Record<string, any> = {
                metadataDiff: {},
                tagsDiff: {
                    added: vB.tags.filter(tag => !vA.tags.includes(tag)),
                    removed: vA.tags.filter(tag => !vB.tags.includes(tag))
                },
                checksumChanged: vA.checksum !== vB.checksum,
                timeElapsed: new Date(vB.metadata.createdAt || 0).getTime() - 
                             new Date(vA.metadata.createdAt || 0).getTime()
            };
            
            // Compare metadata fields
            for (const key in vB.metadata) {
                if (key !== 'createdAt' && JSON.stringify(vA.metadata[key]) !== JSON.stringify(vB.metadata[key])) {
                    comparison.metadataDiff[key] = {
                        from: vA.metadata[key],
                        to: vB.metadata[key]
                    };
                }
            }
            
            return comparison;
        } catch (err) {
            this._logger.error(`Failed to compare versions ${versionA} and ${versionB} for model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Roll back to a specific version of a model
     * @param modelId The model identifier
     * @param version The version to roll back to
     */
    public async rollbackToVersion(modelId: string, version: string): Promise<boolean> {
        try {
            const targetVersion = await this.getVersion(modelId, version);
            
            if (!targetVersion) {
                throw new Error(`Version ${version} not found for model ${modelId}`);
            }
            
            const latestVersion = await this.getLatestVersion(modelId);
            
            if (!latestVersion) {
                throw new Error(`No latest version found for model ${modelId}`);
            }
            
            if (latestVersion.version === version) {
                this._logger.info(`Already at version ${version} for model ${modelId}`);
                return true;
            }
            
            // Create a new version that's a copy of the target version
            // but with updated metadata and history
            const now = new Date();
            const rollbackVersion: ModelVersion = {
                ...targetVersion,
                metadata: {
                    ...targetVersion.metadata,
                    rolledBackFrom: latestVersion.version,
                    createdAt: now.toISOString()
                },
                history: [
                    ...(targetVersion.history || []),
                    {
                        action: 'rollback',
                        fromVersion: latestVersion.version,
                        timestamp: now.toISOString()
                    }
                ]
            };
            
            // Use a special version string that indicates it's a rollback
            const rollbackVersionString = `${version}-rollback-${now.getTime()}`;
            
            const modelVersions = this._versionStore.get(modelId);
            
            if (!modelVersions) {
                throw new Error(`No versions found for model ${modelId}`);
            }
            
            modelVersions.set(rollbackVersionString, rollbackVersion);
            await this._saveVersion(modelId, rollbackVersion);
            
            this._emitter.emit('versionChanged', {
                type: 'rollback',
                modelId,
                version: rollbackVersionString,
                fromVersion: latestVersion.version,
                timestamp: now.toISOString()
            });
            
            this._logger.info(`Rolled back to version ${version} for model ${modelId} (new version: ${rollbackVersionString})`);
            return true;
        } catch (err) {
            this._logger.error(`Failed to roll back to version ${version} for model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Add a tag to a specific version
     * @param modelId The model identifier
     * @param version The version to tag
     * @param tag The tag to add
     */
    public async addVersionTag(modelId: string, version: string, tag: string): Promise<boolean> {
        try {
            if (!modelId || !version || !tag) {
                throw new Error('Model ID, version, and tag are required');
            }
            
            const modelVersions = this._versionStore.get(modelId);
            
            if (!modelVersions) {
                throw new Error(`No versions found for model ${modelId}`);
            }
            
            const modelVersion = modelVersions.get(version);
            
            if (!modelVersion) {
                throw new Error(`Version ${version} not found for model ${modelId}`);
            }
            
            if (modelVersion.tags.includes(tag)) {
                this._logger.info(`Tag ${tag} already exists for version ${version} of model ${modelId}`);
                return true;
            }
            
            modelVersion.tags.push(tag);
            await this._saveVersion(modelId, modelVersion);
            
            const now = new Date();
            this._emitter.emit('versionChanged', {
                type: 'tagged',
                modelId,
                version,
                tag,
                timestamp: now.toISOString()
            });
            
            this._logger.info(`Added tag ${tag} to version ${version} of model ${modelId}`);
            return true;
        } catch (err) {
            this._logger.error(`Failed to add tag ${tag} to version ${version} of model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Remove a tag from a specific version
     * @param modelId The model identifier
     * @param version The version to untag
     * @param tag The tag to remove
     */
    public async removeVersionTag(modelId: string, version: string, tag: string): Promise<boolean> {
        try {
            if (!modelId || !version || !tag) {
                throw new Error('Model ID, version, and tag are required');
            }
            
            const modelVersions = this._versionStore.get(modelId);
            
            if (!modelVersions) {
                throw new Error(`No versions found for model ${modelId}`);
            }
            
            const modelVersion = modelVersions.get(version);
            
            if (!modelVersion) {
                throw new Error(`Version ${version} not found for model ${modelId}`);
            }
            
            const tagIndex = modelVersion.tags.indexOf(tag);
            
            if (tagIndex === -1) {
                this._logger.info(`Tag ${tag} does not exist for version ${version} of model ${modelId}`);
                return false;
            }
            
            modelVersion.tags.splice(tagIndex, 1);
            await this._saveVersion(modelId, modelVersion);
            
            const now = new Date();
            this._emitter.emit('versionChanged', {
                type: 'untagged',
                modelId,
                version,
                tag,
                timestamp: now.toISOString()
            });
            
            this._logger.info(`Removed tag ${tag} from version ${version} of model ${modelId}`);
            return true;
        } catch (err) {
            this._logger.error(`Failed to remove tag ${tag} from version ${version} of model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Get all versions with a specific tag
     * @param modelId The model identifier
     * @param tag The tag to filter by
     */
    public async getVersionsByTag(modelId: string, tag: string): Promise<ModelVersion[]> {
        try {
            if (!modelId || !tag) {
                throw new Error('Model ID and tag are required');
            }
            
            const versions = await this.getVersions(modelId);
            return versions.filter(v => v.tags.includes(tag));
        } catch (err) {
            this._logger.error(`Failed to get versions with tag ${tag} for model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Create a checkpoint of the current model state
     * @param modelId The model identifier
     * @param metadata Additional checkpoint metadata
     */
    public async createCheckpoint(modelId: string, metadata: ModelVersionMetadata): Promise<ModelVersion> {
        try {
            if (!modelId) {
                throw new Error('Model ID is required');
            }
            
            const latestVersion = await this.getLatestVersion(modelId);
            
            const now = new Date();
            const checkpointVersion = `checkpoint-${now.getTime()}`;
            
            // Create checkpoint as a new version
            const checkpointMetadata: ModelVersionMetadata = {
                ...metadata,
                isCheckpoint: true,
                createdAt: now.toISOString(),
                checkpointBase: latestVersion?.version
            };
            
            const modelVersion = await this.registerVersion(modelId, checkpointVersion, checkpointMetadata);
            
            // Add a checkpoint tag
            await this.addVersionTag(modelId, checkpointVersion, 'checkpoint');
            
            this._logger.info(`Created checkpoint ${checkpointVersion} for model ${modelId}`);
            return modelVersion;
        } catch (err) {
            this._logger.error(`Failed to create checkpoint for model ${modelId}`, err);
            throw err;
        }
    }
    
    /**
     * Dispose of all resources
     */
    public dispose(): void {
        try {
            this._emitter.removeAllListeners();
            
            for (const disposable of this._disposables) {
                disposable.dispose();
            }
            
            this._logger.info('Disposed ModelVersioningService');
        } catch (err) {
            this._logger.error('Error disposing ModelVersioningService', err);
        }
    }
}