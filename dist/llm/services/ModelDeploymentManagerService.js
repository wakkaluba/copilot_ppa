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
exports.ModelDeploymentManagerService = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../../utils/logger");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Implementation of the Model Deployment Manager Service
 */
class ModelDeploymentManagerService {
    context;
    _logger;
    _deploymentsStoragePath;
    _environmentsStoragePath;
    _deploymentEmitter = new vscode.EventEmitter();
    _environmentEmitter = new vscode.EventEmitter();
    _deployments = new Map();
    _environments = new Map();
    _deploymentEvents = [];
    _environmentEvents = [];
    _disposables = [];
    _deploymentService;
    _versioningService;
    _systemManager;
    _registryService;
    _monitoringInterval;
    /**
     * Event that fires when a deployment status changes
     */
    onDeploymentStatusChanged = this._deploymentEmitter.event;
    /**
     * Event that fires when an environment status changes
     */
    onEnvironmentStatusChanged = this._environmentEmitter.event;
    /**
     * Create a new ModelDeploymentManagerService
     * @param context The extension context
     * @param deploymentService The deployment service
     * @param versioningService The versioning service
     * @param systemManager The system manager
     * @param registryService The registry service
     */
    constructor(context, deploymentService, versioningService, systemManager, registryService) {
        this.context = context;
        this._logger = logger_1.Logger.for('ModelDeploymentManagerService');
        this._deploymentService = deploymentService;
        this._versioningService = versioningService;
        this._systemManager = systemManager;
        this._registryService = registryService;
        this._disposables.push(this._deploymentEmitter);
        this._disposables.push(this._environmentEmitter);
        // Set up storage paths
        this._deploymentsStoragePath = path.join(context.globalStoragePath, 'deployments');
        this._environmentsStoragePath = path.join(context.globalStoragePath, 'environments');
        // Ensure storage directories exist
        if (!fs.existsSync(this._deploymentsStoragePath)) {
            fs.mkdirSync(this._deploymentsStoragePath, { recursive: true });
        }
        if (!fs.existsSync(this._environmentsStoragePath)) {
            fs.mkdirSync(this._environmentsStoragePath, { recursive: true });
        }
        // Load existing data
        this.loadDeployments().catch(err => {
            this._logger.error('Failed to load deployments', err);
        });
        this.loadEnvironments().catch(err => {
            this._logger.error('Failed to load environments', err);
        });
        this.loadEvents().catch(err => {
            this._logger.error('Failed to load events', err);
        });
        // Start monitoring deployments
        this.startMonitoring();
    }
    /**
     * Load existing deployments from storage
     */
    async loadDeployments() {
        try {
            const files = fs.readdirSync(this._deploymentsStoragePath);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this._deploymentsStoragePath, file);
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    this._deployments.set(data.id, data);
                }
            }
            this._logger.info(`Loaded ${this._deployments.size} deployments`);
        }
        catch (err) {
            this._logger.error('Error loading deployments', err);
            throw err;
        }
    }
    /**
     * Load existing environments from storage
     */
    async loadEnvironments() {
        try {
            const files = fs.readdirSync(this._environmentsStoragePath);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this._environmentsStoragePath, file);
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    this._environments.set(data.id, data);
                }
            }
            this._logger.info(`Loaded ${this._environments.size} environments`);
            // Create default environment if none exists
            if (this._environments.size === 0) {
                await this.createDefaultEnvironments();
            }
        }
        catch (err) {
            this._logger.error('Error loading environments', err);
            throw err;
        }
    }
    /**
     * Load existing events from storage
     */
    async loadEvents() {
        try {
            const deploymentEventsPath = path.join(this.context.globalStoragePath, 'deployment-events.json');
            const environmentEventsPath = path.join(this.context.globalStoragePath, 'environment-events.json');
            if (fs.existsSync(deploymentEventsPath)) {
                const data = JSON.parse(fs.readFileSync(deploymentEventsPath, 'utf8'));
                this._deploymentEvents.push(...data);
            }
            if (fs.existsSync(environmentEventsPath)) {
                const data = JSON.parse(fs.readFileSync(environmentEventsPath, 'utf8'));
                this._environmentEvents.push(...data);
            }
            this._logger.info(`Loaded ${this._deploymentEvents.length} deployment events and ${this._environmentEvents.length} environment events`);
        }
        catch (err) {
            this._logger.error('Error loading events', err);
            throw err;
        }
    }
    /**
     * Create default environments if none exist
     */
    async createDefaultEnvironments() {
        try {
            await this.createEnvironment({
                name: 'Development',
                description: 'Development environment',
                type: 'development',
                resourceLimits: {
                    maxCpu: 2,
                    maxMemory: 4096
                }
            });
            await this.createEnvironment({
                name: 'Testing',
                description: 'Testing environment',
                type: 'testing',
                resourceLimits: {
                    maxCpu: 2,
                    maxMemory: 4096
                }
            });
            await this.createEnvironment({
                name: 'Production',
                description: 'Production environment',
                type: 'production',
                resourceLimits: {
                    maxCpu: 4,
                    maxMemory: 8192
                }
            });
            this._logger.info('Created default environments');
        }
        catch (err) {
            this._logger.error('Error creating default environments', err);
        }
    }
    /**
     * Save deployment to storage
     * @param deployment The deployment to save
     */
    async saveDeployment(deployment) {
        try {
            const filePath = path.join(this._deploymentsStoragePath, `${deployment.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(deployment, null, 2));
        }
        catch (err) {
            this._logger.error(`Failed to save deployment ${deployment.id}`, err);
            throw err;
        }
    }
    /**
     * Save environment to storage
     * @param environment The environment to save
     */
    async saveEnvironment(environment) {
        try {
            const filePath = path.join(this._environmentsStoragePath, `${environment.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(environment, null, 2));
        }
        catch (err) {
            this._logger.error(`Failed to save environment ${environment.id}`, err);
            throw err;
        }
    }
    /**
     * Save events to storage
     */
    async saveEvents() {
        try {
            // Keep only the last 1000 events
            const deploymentEventsToSave = this._deploymentEvents.slice(-1000);
            const environmentEventsToSave = this._environmentEvents.slice(-1000);
            const deploymentEventsPath = path.join(this.context.globalStoragePath, 'deployment-events.json');
            const environmentEventsPath = path.join(this.context.globalStoragePath, 'environment-events.json');
            fs.writeFileSync(deploymentEventsPath, JSON.stringify(deploymentEventsToSave, null, 2));
            fs.writeFileSync(environmentEventsPath, JSON.stringify(environmentEventsToSave, null, 2));
        }
        catch (err) {
            this._logger.error('Failed to save events', err);
            throw err;
        }
    }
    /**
     * Record a deployment event
     * @param event The event to record
     */
    recordDeploymentEvent(event) {
        this._deploymentEvents.push(event);
        this._deploymentEmitter.fire(event);
        this.saveEvents().catch(err => {
            this._logger.error('Failed to save events after recording deployment event', err);
        });
    }
    /**
     * Record an environment event
     * @param event The event to record
     */
    recordEnvironmentEvent(event) {
        this._environmentEvents.push(event);
        this._environmentEmitter.fire(event);
        this.saveEvents().catch(err => {
            this._logger.error('Failed to save events after recording environment event', err);
        });
    }
    /**
     * Update deployment status
     * @param deploymentId The deployment ID
     * @param status The new status
     * @param details Optional details about the status change
     */
    async updateDeploymentStatus(deploymentId, status, details = {}) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                this._logger.warn(`Cannot update status for non-existent deployment: ${deploymentId}`);
                return false;
            }
            const oldStatus = deployment.status;
            deployment.status = status;
            deployment.lastUpdated = new Date().toISOString();
            await this.saveDeployment(deployment);
            const event = {
                deploymentId,
                type: 'status',
                timestamp: deployment.lastUpdated,
                details: {
                    oldStatus,
                    newStatus: status,
                    ...details
                }
            };
            this.recordDeploymentEvent(event);
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to update status for deployment ${deploymentId}`, err);
            return false;
        }
    }
    /**
     * Generate a unique ID
     */
    generateId() {
        return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
    }
    /**
     * Start monitoring deployments
     */
    startMonitoring() {
        this._monitoringInterval = setInterval(() => {
            this.monitorDeployments().catch(err => {
                this._logger.error('Error in deployment monitoring', err);
            });
        }, 30000); // Monitor every 30 seconds
    }
    /**
     * Stop monitoring deployments
     */
    stopMonitoring() {
        if (this._monitoringInterval) {
            clearInterval(this._monitoringInterval);
            this._monitoringInterval = undefined;
        }
    }
    /**
     * Monitor all running deployments
     */
    async monitorDeployments() {
        for (const deployment of this._deployments.values()) {
            if (deployment.status === 'running') {
                try {
                    // Update metrics
                    const metrics = await this.collectDeploymentMetrics(deployment.id);
                    if (metrics) {
                        deployment.metrics = metrics;
                        deployment.lastUpdated = new Date().toISOString();
                        await this.saveDeployment(deployment);
                    }
                }
                catch (err) {
                    this._logger.error(`Failed to monitor deployment ${deployment.id}`, err);
                }
            }
        }
    }
    /**
     * Collect metrics for a deployment
     * @param deploymentId The deployment ID
     */
    async collectDeploymentMetrics(deploymentId) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                return undefined;
            }
            // In a real implementation, we would collect real metrics
            // This is a placeholder implementation
            const existingMetrics = deployment.metrics || {
                requestCount: 0,
                errorCount: 0,
                averageLatency: 0,
                p95Latency: 0,
                uptime: 0,
                lastActive: deployment.createdAt,
                resourceUtilization: {
                    cpu: 0,
                    memory: 0
                }
            };
            // Update the metrics
            const systemMetrics = await this._systemManager.getSystemMetrics();
            const now = new Date();
            const lastActive = new Date(existingMetrics.lastActive);
            const uptimeIncrease = (now.getTime() - lastActive.getTime()) / 1000; // in seconds
            // Create updated metrics
            const metrics = {
                ...existingMetrics,
                uptime: existingMetrics.uptime + uptimeIncrease,
                lastActive: now.toISOString(),
                resourceUtilization: {
                    cpu: Math.random() * 50, // Simulated CPU usage percentage
                    memory: Math.random() * 500, // Simulated memory usage in MB
                    // Include GPU usage if applicable
                    ...(existingMetrics.resourceUtilization.gpu !== undefined
                        ? { gpu: Math.random() * 30 }
                        : {})
                }
            };
            return metrics;
        }
        catch (err) {
            this._logger.error(`Failed to collect metrics for deployment ${deploymentId}`, err);
            return undefined;
        }
    }
    /**
     * Get a deployment by ID
     * @param deploymentId The deployment ID
     */
    async getDeployment(deploymentId) {
        return this._deployments.get(deploymentId);
    }
    /**
     * Get all deployments, optionally filtered by model ID
     * @param modelId Optional model ID filter
     */
    async getDeployments(modelId) {
        const deployments = Array.from(this._deployments.values());
        if (modelId) {
            return deployments.filter(d => d.modelId === modelId);
        }
        return deployments;
    }
    /**
     * Create a new deployment
     * @param options Deployment creation options
     */
    async createDeployment(options) {
        try {
            // Validate environment exists
            const environment = this._environments.get(options.environmentId);
            if (!environment) {
                throw new Error(`Environment ${options.environmentId} does not exist`);
            }
            // Validate model version exists
            const version = await this._versioningService.getVersion(options.modelId, options.version);
            if (!version) {
                throw new Error(`Version ${options.version} of model ${options.modelId} does not exist`);
            }
            // Create new deployment
            const now = new Date().toISOString();
            const deployment = {
                id: this.generateId(),
                modelId: options.modelId,
                version: options.version,
                environmentId: options.environmentId,
                status: 'pending',
                createdAt: now,
                lastUpdated: now,
                tags: options.tags || [],
                config: options.config || {}
            };
            // Store the deployment
            this._deployments.set(deployment.id, deployment);
            await this.saveDeployment(deployment);
            // Record event
            this.recordDeploymentEvent({
                deploymentId: deployment.id,
                type: 'created',
                timestamp: now,
                details: {
                    modelId: options.modelId,
                    version: options.version,
                    environmentId: options.environmentId
                }
            });
            // Start deployment process
            this.startDeploymentProcess(deployment.id).catch(err => {
                this._logger.error(`Failed to start deployment process for ${deployment.id}`, err);
                this.updateDeploymentStatus(deployment.id, 'failed', {
                    error: err.message || String(err)
                });
            });
            return deployment;
        }
        catch (err) {
            this._logger.error('Failed to create deployment', err);
            throw err;
        }
    }
    /**
     * Start the deployment process
     * @param deploymentId The deployment ID
     */
    async startDeploymentProcess(deploymentId) {
        try {
            const deployment = await this.getDeployment(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            // Update status to deploying
            await this.updateDeploymentStatus(deploymentId, 'deploying');
            // In a real implementation, this would involve more complex deployment logic
            // We'll simulate the deployment process with a delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Update status to running
            await this.updateDeploymentStatus(deploymentId, 'running', {
                message: 'Deployment completed successfully'
            });
        }
        catch (err) {
            this._logger.error(`Failed to process deployment ${deploymentId}`, err);
            await this.updateDeploymentStatus(deploymentId, 'failed', {
                error: err.message || String(err)
            });
            throw err;
        }
    }
    /**
     * Update an existing deployment
     * @param deploymentId The deployment ID
     * @param updates Updates to apply to the deployment
     */
    async updateDeployment(deploymentId, updates) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            const originalDeployment = { ...deployment };
            // Apply updates, but keep the ID the same
            Object.assign(deployment, {
                ...updates,
                id: deploymentId,
                lastUpdated: new Date().toISOString()
            });
            // Store updated deployment
            await this.saveDeployment(deployment);
            // Record event
            this.recordDeploymentEvent({
                deploymentId,
                type: 'updated',
                timestamp: deployment.lastUpdated,
                details: {
                    updates: Object.keys(updates),
                    originalVersion: originalDeployment.version,
                    newVersion: deployment.version
                }
            });
            // If the version was updated, we need to perform a deployment update
            if (updates.version && updates.version !== originalDeployment.version) {
                await this.updateDeploymentStatus(deploymentId, 'updating');
                // Start the update process in the background
                this.updateDeploymentProcess(deploymentId, originalDeployment.version).catch(err => {
                    this._logger.error(`Failed to update deployment ${deploymentId}`, err);
                    this.updateDeploymentStatus(deploymentId, 'failed', {
                        error: err.message || String(err)
                    });
                });
            }
            return deployment;
        }
        catch (err) {
            this._logger.error(`Failed to update deployment ${deploymentId}`, err);
            throw err;
        }
    }
    /**
     * Update the deployment process (version change)
     * @param deploymentId The deployment ID
     * @param previousVersion The previous version
     */
    async updateDeploymentProcess(deploymentId, previousVersion) {
        try {
            const deployment = await this.getDeployment(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            // In a real implementation, this would involve more complex update logic
            // We'll simulate the update process with a delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Update status to running
            await this.updateDeploymentStatus(deploymentId, 'running', {
                message: 'Deployment updated successfully',
                previousVersion
            });
        }
        catch (err) {
            this._logger.error(`Failed to update deployment ${deploymentId}`, err);
            await this.updateDeploymentStatus(deploymentId, 'failed', {
                error: err.message || String(err),
                previousVersion
            });
            throw err;
        }
    }
    /**
     * Delete a deployment
     * @param deploymentId The deployment ID
     */
    async deleteDeployment(deploymentId) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                return false;
            }
            // Stop the deployment if it's running
            if (deployment.status === 'running' ||
                deployment.status === 'deploying' ||
                deployment.status === 'updating') {
                await this.stopDeployment(deploymentId);
            }
            // Remove from map
            this._deployments.delete(deploymentId);
            // Remove file
            const filePath = path.join(this._deploymentsStoragePath, `${deploymentId}.json`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            // Record event
            this.recordDeploymentEvent({
                deploymentId,
                type: 'deleted',
                timestamp: new Date().toISOString(),
                details: {
                    modelId: deployment.modelId,
                    version: deployment.version,
                    environmentId: deployment.environmentId
                }
            });
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to delete deployment ${deploymentId}`, err);
            return false;
        }
    }
    /**
     * Start a deployment
     * @param deploymentId The deployment ID
     */
    async startDeployment(deploymentId) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            if (deployment.status === 'running') {
                return true; // Already running
            }
            // Update status and start the deployment process
            await this.updateDeploymentStatus(deploymentId, 'deploying');
            // Start the deployment process in the background
            this.startDeploymentProcess(deploymentId).catch(err => {
                this._logger.error(`Failed to start deployment ${deploymentId}`, err);
                this.updateDeploymentStatus(deploymentId, 'failed', {
                    error: err.message || String(err)
                });
            });
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to start deployment ${deploymentId}`, err);
            return false;
        }
    }
    /**
     * Stop a deployment
     * @param deploymentId The deployment ID
     */
    async stopDeployment(deploymentId) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            if (deployment.status === 'stopped' || deployment.status === 'failed') {
                return true; // Already stopped
            }
            // In a real implementation, this would involve stopping the deployed service
            // We'll simulate the stop process
            await this.updateDeploymentStatus(deploymentId, 'stopped', {
                message: 'Deployment stopped successfully'
            });
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to stop deployment ${deploymentId}`, err);
            return false;
        }
    }
    /**
     * Restart a deployment
     * @param deploymentId The deployment ID
     */
    async restartDeployment(deploymentId) {
        try {
            const success = await this.stopDeployment(deploymentId);
            if (!success) {
                return false;
            }
            return await this.startDeployment(deploymentId);
        }
        catch (err) {
            this._logger.error(`Failed to restart deployment ${deploymentId}`, err);
            return false;
        }
    }
    /**
     * Scale a deployment
     * @param deploymentId The deployment ID
     * @param scale Scale configuration
     */
    async scaleDeployment(deploymentId, scale) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            if (deployment.status !== 'running') {
                throw new Error(`Deployment ${deploymentId} is not running (status: ${deployment.status})`);
            }
            // Update status to scaling
            await this.updateDeploymentStatus(deploymentId, 'scaling');
            // In a real implementation, this would involve complex scaling logic
            // We'll simulate the scaling process with a delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Update the deployment config with the new scale
            deployment.config = {
                ...deployment.config,
                scale
            };
            deployment.lastUpdated = new Date().toISOString();
            await this.saveDeployment(deployment);
            // Update status back to running
            await this.updateDeploymentStatus(deploymentId, 'running', {
                message: 'Deployment scaled successfully',
                scale
            });
            // Record event
            this.recordDeploymentEvent({
                deploymentId,
                type: 'scaled',
                timestamp: deployment.lastUpdated,
                details: { scale }
            });
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to scale deployment ${deploymentId}`, err);
            return false;
        }
    }
    /**
     * Rollback a deployment to a previous version
     * @param deploymentId The deployment ID
     * @param version The version to roll back to
     */
    async rollbackDeployment(deploymentId, version) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            // Check if version is different from the current version
            if (deployment.version === version) {
                this._logger.info(`Deployment ${deploymentId} is already at version ${version}`);
                return true;
            }
            // Validate the version exists
            const versionExists = await this._versioningService.getVersion(deployment.modelId, version);
            if (!versionExists) {
                throw new Error(`Version ${version} of model ${deployment.modelId} does not exist`);
            }
            // Update status to rollback
            await this.updateDeploymentStatus(deploymentId, 'rollback');
            // Store the current version for rollback details
            const currentVersion = deployment.version;
            // Update deployment version
            deployment.version = version;
            deployment.lastUpdated = new Date().toISOString();
            await this.saveDeployment(deployment);
            // In a real implementation, this would involve complex rollback logic
            // We'll simulate the rollback process with a delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Update status back to running
            await this.updateDeploymentStatus(deploymentId, 'running', {
                message: 'Deployment rolled back successfully',
                previousVersion: currentVersion,
                newVersion: version
            });
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to rollback deployment ${deploymentId}`, err);
            return false;
        }
    }
    /**
     * Get all environments
     */
    async getEnvironments() {
        return Array.from(this._environments.values());
    }
    /**
     * Get an environment by ID
     * @param environmentId The environment ID
     */
    async getEnvironment(environmentId) {
        return this._environments.get(environmentId);
    }
    /**
     * Create a new environment
     * @param options Environment creation options
     */
    async createEnvironment(options) {
        try {
            // Create the environment
            const now = new Date().toISOString();
            const environment = {
                id: this.generateId(),
                name: options.name,
                description: options.description || '',
                type: options.type || 'development',
                resourceLimits: {
                    maxCpu: options.resourceLimits?.maxCpu || 1,
                    maxMemory: options.resourceLimits?.maxMemory || 1024,
                    ...(options.resourceLimits?.maxGpu ? { maxGpu: options.resourceLimits.maxGpu } : {})
                },
                createdAt: now,
                lastUpdated: now,
                status: 'active',
                variables: options.variables || {},
                tags: options.tags || []
            };
            // Store the environment
            this._environments.set(environment.id, environment);
            await this.saveEnvironment(environment);
            // Record event
            this.recordEnvironmentEvent({
                environmentId: environment.id,
                type: 'created',
                timestamp: now,
                details: {
                    name: environment.name,
                    type: environment.type,
                    resourceLimits: environment.resourceLimits
                }
            });
            return environment;
        }
        catch (err) {
            this._logger.error('Failed to create environment', err);
            throw err;
        }
    }
    /**
     * Update an environment
     * @param environmentId The environment ID
     * @param updates Updates to apply
     */
    async updateEnvironment(environmentId, updates) {
        try {
            const environment = this._environments.get(environmentId);
            if (!environment) {
                throw new Error(`Environment ${environmentId} not found`);
            }
            // Apply updates, but keep the ID the same
            Object.assign(environment, {
                ...updates,
                id: environmentId,
                lastUpdated: new Date().toISOString()
            });
            // Store updated environment
            await this.saveEnvironment(environment);
            // Record event
            this.recordEnvironmentEvent({
                environmentId,
                type: 'updated',
                timestamp: environment.lastUpdated,
                details: {
                    updates: Object.keys(updates)
                }
            });
            return environment;
        }
        catch (err) {
            this._logger.error(`Failed to update environment ${environmentId}`, err);
            throw err;
        }
    }
    /**
     * Delete an environment
     * @param environmentId The environment ID
     */
    async deleteEnvironment(environmentId) {
        try {
            const environment = this._environments.get(environmentId);
            if (!environment) {
                return false;
            }
            // Check if any deployments are using this environment
            const deployments = await this.getDeployments();
            const usingDeployments = deployments.filter(d => d.environmentId === environmentId);
            if (usingDeployments.length > 0) {
                throw new Error(`Cannot delete environment ${environmentId} because it is in use by ${usingDeployments.length} deployment(s)`);
            }
            // Remove from map
            this._environments.delete(environmentId);
            // Remove file
            const filePath = path.join(this._environmentsStoragePath, `${environmentId}.json`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            // Record event
            this.recordEnvironmentEvent({
                environmentId,
                type: 'deleted',
                timestamp: new Date().toISOString(),
                details: {
                    name: environment.name,
                    type: environment.type
                }
            });
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to delete environment ${environmentId}`, err);
            throw err;
        }
    }
    /**
     * Get logs for a deployment
     * @param deploymentId The deployment ID
     * @param lines Number of lines to return
     * @param since Return logs since this time (ISO string)
     */
    async getDeploymentLogs(deploymentId, lines = 100, since) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            // In a real implementation, this would retrieve actual logs
            // We'll simulate logs with some fake entries
            const logs = [];
            const sinceDate = since ? new Date(since) : undefined;
            const baseDate = sinceDate || new Date(deployment.createdAt);
            for (let i = 0; i < lines; i++) {
                const timestamp = new Date(baseDate.getTime() + i * 5000).toISOString();
                // Generate a different log message based on position
                let message = '';
                if (i === 0) {
                    message = `Starting deployment process for model ${deployment.modelId} version ${deployment.version}`;
                }
                else if (i === 1) {
                    message = `Preparing environment: ${deployment.environmentId}`;
                }
                else if (i === 2) {
                    message = `Downloading model files for ${deployment.modelId}:${deployment.version}`;
                }
                else if (i === lines - 2) {
                    message = `Configuring model with parameters: ${JSON.stringify(deployment.config)}`;
                }
                else if (i === lines - 1) {
                    message = `Deployment ready: ${deployment.status === 'running' ? 'success' : 'failed'}`;
                }
                else {
                    const randomMessages = [
                        `INFO: Processing configuration options`,
                        `DEBUG: Memory allocation: ${Math.floor(Math.random() * 500)}MB`,
                        `INFO: Network connection established`,
                        `INFO: Loading model weights`,
                        `DEBUG: Thread pool initialized with ${Math.floor(Math.random() * 8 + 2)} threads`,
                        `INFO: Setting up API endpoints`,
                        `DEBUG: CPU utilization: ${Math.floor(Math.random() * 100)}%`
                    ];
                    message = randomMessages[Math.floor(Math.random() * randomMessages.length)];
                }
                logs.push(`${timestamp} - ${message}`);
            }
            return logs;
        }
        catch (err) {
            this._logger.error(`Failed to get logs for deployment ${deploymentId}`, err);
            throw err;
        }
    }
    /**
     * Get metrics for a deployment
     * @param deploymentId The deployment ID
     */
    async getDeploymentMetrics(deploymentId) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            if (deployment.metrics) {
                return deployment.metrics;
            }
            // If no metrics exist, try to collect them
            return await this.collectDeploymentMetrics(deploymentId);
        }
        catch (err) {
            this._logger.error(`Failed to get metrics for deployment ${deploymentId}`, err);
            throw err;
        }
    }
    /**
     * Get deployment events
     * @param deploymentId Optional deployment ID filter
     */
    async getDeploymentEvents(deploymentId) {
        if (deploymentId) {
            return this._deploymentEvents.filter(e => e.deploymentId === deploymentId);
        }
        return this._deploymentEvents;
    }
    /**
     * Get environment events
     * @param environmentId Optional environment ID filter
     */
    async getEnvironmentEvents(environmentId) {
        if (environmentId) {
            return this._environmentEvents.filter(e => e.environmentId === environmentId);
        }
        return this._environmentEvents;
    }
    /**
     * Add a tag to a deployment
     * @param deploymentId The deployment ID
     * @param tag The tag to add
     */
    async addDeploymentTag(deploymentId, tag) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            if (deployment.tags.includes(tag)) {
                return true; // Tag already exists
            }
            deployment.tags.push(tag);
            deployment.lastUpdated = new Date().toISOString();
            await this.saveDeployment(deployment);
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to add tag ${tag} to deployment ${deploymentId}`, err);
            return false;
        }
    }
    /**
     * Remove a tag from a deployment
     * @param deploymentId The deployment ID
     * @param tag The tag to remove
     */
    async removeDeploymentTag(deploymentId, tag) {
        try {
            const deployment = this._deployments.get(deploymentId);
            if (!deployment) {
                throw new Error(`Deployment ${deploymentId} not found`);
            }
            const index = deployment.tags.indexOf(tag);
            if (index === -1) {
                return true; // Tag doesn't exist
            }
            deployment.tags.splice(index, 1);
            deployment.lastUpdated = new Date().toISOString();
            await this.saveDeployment(deployment);
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to remove tag ${tag} from deployment ${deploymentId}`, err);
            return false;
        }
    }
    /**
     * Add a tag to an environment
     * @param environmentId The environment ID
     * @param tag The tag to add
     */
    async addEnvironmentTag(environmentId, tag) {
        try {
            const environment = this._environments.get(environmentId);
            if (!environment) {
                throw new Error(`Environment ${environmentId} not found`);
            }
            if (environment.tags.includes(tag)) {
                return true; // Tag already exists
            }
            environment.tags.push(tag);
            environment.lastUpdated = new Date().toISOString();
            await this.saveEnvironment(environment);
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to add tag ${tag} to environment ${environmentId}`, err);
            return false;
        }
    }
    /**
     * Remove a tag from an environment
     * @param environmentId The environment ID
     * @param tag The tag to remove
     */
    async removeEnvironmentTag(environmentId, tag) {
        try {
            const environment = this._environments.get(environmentId);
            if (!environment) {
                throw new Error(`Environment ${environmentId} not found`);
            }
            const index = environment.tags.indexOf(tag);
            if (index === -1) {
                return true; // Tag doesn't exist
            }
            environment.tags.splice(index, 1);
            environment.lastUpdated = new Date().toISOString();
            await this.saveEnvironment(environment);
            return true;
        }
        catch (err) {
            this._logger.error(`Failed to remove tag ${tag} from environment ${environmentId}`, err);
            return false;
        }
    }
    /**
     * Dispose of all resources
     */
    dispose() {
        try {
            // Stop monitoring
            this.stopMonitoring();
            // Save events before disposing
            this.saveEvents().catch(err => {
                this._logger.error('Failed to save events during disposal', err);
            });
            // Dispose of all disposables
            for (const disposable of this._disposables) {
                disposable.dispose();
            }
            this._logger.info('Disposed ModelDeploymentManagerService');
        }
        catch (err) {
            this._logger.error('Error disposing ModelDeploymentManagerService', err);
        }
    }
}
exports.ModelDeploymentManagerService = ModelDeploymentManagerService;
//# sourceMappingURL=ModelDeploymentManagerService.js.map