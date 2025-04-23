"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelVersioningService = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
/**
 * Implementation of the Model Versioning Service
 */
class ModelVersioningService {
    _logger;
    _versionStore;
    _storagePath;
    _emitter = new events_1.EventEmitter();
    _onVersionChanged = new vscode.EventEmitter();
    _disposables = [];
    /**
     * Event that fires when a version changes
     */
    onVersionChanged = this._onVersionChanged.event;
    /**
     * Create a new ModelVersioningService
     * @param context The extension context
     * @param logger The logger instance
     */
    constructor(context, logger) {
        this._logger = logger;
        this._versionStore = new Map();
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
        this._emitter.on('versionChanged', (event) => {
            this._onVersionChanged.fire(event);
        });
        // Register disposables
        this._disposables.push(this._onVersionChanged);
    }
    /**
     * Load existing versions from storage
     */
    async _loadVersions() {
        try {
            const modelDirs = fs.readdirSync(this._storagePath);
            for (const modelId of modelDirs) {
                const modelPath = path.join(this._storagePath, modelId);
                if (fs.statSync(modelPath).isDirectory()) {
                    const versionFiles = fs.readdirSync(modelPath)
                        .filter(file => file.endsWith('.json'));
                    const modelVersions = new Map();
                    for (const versionFile of versionFiles) {
                        try {
                            const versionPath = path.join(modelPath, versionFile);
                            const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
                            modelVersions.set(versionData.version, versionData);
                        }
                        catch (err) {
                            this._logger.warn(`Failed to load version from ${versionFile}`, err);
                        }
                    }
                    this._versionStore.set(modelId, modelVersions);
                }
            }
            this._logger.info(`Loaded versions for ${this._versionStore.size} models`);
        }
        catch (err) {
            this._logger.error('Error loading model versions', err);
            throw err;
        }
    }
    /**
     * Save a version to storage
     * @param modelId The model identifier
     * @param version The version data to save
     */
    async _saveVersion(modelId, version) {
        try {
            const modelPath = path.join(this._storagePath, modelId);
            if (!fs.existsSync(modelPath)) {
                fs.mkdirSync(modelPath, { recursive: true });
            }
            const versionPath = path.join(modelPath, `${version.version}.json`);
            fs.writeFileSync(versionPath, JSON.stringify(version, null, 2), 'utf8');
        }
        catch (err) {
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
    async registerVersion(modelId, version, metadata) {
        try {
            if (!modelId || !version) {
                throw new Error('Model ID and version are required');
            }
            const now = new Date();
            const modelVersion = {
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
                modelVersions = new Map();
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
        }
        catch (err) {
            this._logger.error(`Failed to register version ${version} for model ${modelId}`, err);
            throw err;
        }
    }
    /**
     * Generate a checksum for a model version
     * @param modelId The model identifier
     * @param version The model version
     */
    async _generateChecksum(modelId, version) {
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
    async getVersions(modelId) {
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
        }
        catch (err) {
            this._logger.error(`Failed to get versions for model ${modelId}`, err);
            throw err;
        }
    }
    /**
     * Get a specific version of a model
     * @param modelId The model identifier
     * @param version The version to retrieve
     */
    async getVersion(modelId, version) {
        try {
            if (!modelId || !version) {
                throw new Error('Model ID and version are required');
            }
            const modelVersions = this._versionStore.get(modelId);
            if (!modelVersions) {
                return undefined;
            }
            return modelVersions.get(version);
        }
        catch (err) {
            this._logger.error(`Failed to get version ${version} for model ${modelId}`, err);
            throw err;
        }
    }
    /**
     * Get the latest version of a specific model
     * @param modelId The model identifier
     */
    async getLatestVersion(modelId) {
        try {
            const versions = await this.getVersions(modelId);
            if (versions.length === 0) {
                return undefined;
            }
            // First version after sorting by date (newest first)
            return versions[0];
        }
        catch (err) {
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
    async compareVersions(modelId, versionA, versionB) {
        try {
            const vA = await this.getVersion(modelId, versionA);
            const vB = await this.getVersion(modelId, versionB);
            if (!vA || !vB) {
                throw new Error(`One or both versions not found for model ${modelId}`);
            }
            // Compare based on metadata
            const comparison = {
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
        }
        catch (err) {
            this._logger.error(`Failed to compare versions ${versionA} and ${versionB} for model ${modelId}`, err);
            throw err;
        }
    }
    /**
     * Roll back to a specific version of a model
     * @param modelId The model identifier
     * @param version The version to roll back to
     */
    async rollbackToVersion(modelId, version) {
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
            const rollbackVersion = {
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
        }
        catch (err) {
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
    async addVersionTag(modelId, version, tag) {
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
        }
        catch (err) {
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
    async removeVersionTag(modelId, version, tag) {
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
        }
        catch (err) {
            this._logger.error(`Failed to remove tag ${tag} from version ${version} of model ${modelId}`, err);
            throw err;
        }
    }
    /**
     * Get all versions with a specific tag
     * @param modelId The model identifier
     * @param tag The tag to filter by
     */
    async getVersionsByTag(modelId, tag) {
        try {
            if (!modelId || !tag) {
                throw new Error('Model ID and tag are required');
            }
            const versions = await this.getVersions(modelId);
            return versions.filter(v => v.tags.includes(tag));
        }
        catch (err) {
            this._logger.error(`Failed to get versions with tag ${tag} for model ${modelId}`, err);
            throw err;
        }
    }
    /**
     * Create a checkpoint of the current model state
     * @param modelId The model identifier
     * @param metadata Additional checkpoint metadata
     */
    async createCheckpoint(modelId, metadata) {
        try {
            if (!modelId) {
                throw new Error('Model ID is required');
            }
            const latestVersion = await this.getLatestVersion(modelId);
            const now = new Date();
            const checkpointVersion = `checkpoint-${now.getTime()}`;
            // Create checkpoint as a new version
            const checkpointMetadata = {
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
        }
        catch (err) {
            this._logger.error(`Failed to create checkpoint for model ${modelId}`, err);
            throw err;
        }
    }
    /**
     * Dispose of all resources
     */
    dispose() {
        try {
            this._emitter.removeAllListeners();
            for (const disposable of this._disposables) {
                disposable.dispose();
            }
            this._logger.info('Disposed ModelVersioningService');
        }
        catch (err) {
            this._logger.error('Error disposing ModelVersioningService', err);
        }
    }
}
exports.ModelVersioningService = ModelVersioningService;
//# sourceMappingURL=ModelVersioningService.js.map