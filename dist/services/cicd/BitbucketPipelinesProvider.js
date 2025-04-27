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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitbucketPipelinesProvider = void 0;
const vscode = __importStar(require("vscode"));
const ICICDProvider_1 = require("./ICICDProvider");
const logger_1 = require("../../services/logger");
const retry_1 = require("../utils/retry");
class BitbucketPipelinesProvider {
    constructor() {
        this.connectionState = 'disconnected';
        this.logger = new logger_1.Logger('BitbucketPipelinesProvider');
        this.disposables = [];
        this.name = 'Bitbucket Pipelines';
        this.initialize().catch(err => this.logger.error('Failed to initialize Bitbucket provider:', err));
        // Watch for configuration changes
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.bitbucket')) {
                this.initialize().catch(err => this.logger.error('Failed to reinitialize after config change:', err));
            }
        }));
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.connectionState = 'disconnected';
        this.bitbucket = undefined;
    }
    async initialize() {
        try {
            this.connectionState = 'connecting';
            const credentials = await this.getCredentials();
            if (!credentials) {
                this.connectionState = 'disconnected';
                throw new ICICDProvider_1.CICDError('missing_credentials', 'Bitbucket credentials not configured');
            }
            // Use dynamic import for Bitbucket client to avoid dependency issues
            const BitbucketClient = require('bitbucket');
            this.bitbucket = new BitbucketClient({
                auth: {
                    username: credentials.username,
                    password: credentials.appPassword
                }
            });
            this.workspace = credentials.workspace;
            // Verify connection
            await this.testConnection();
            this.connectionState = 'connected';
            this.logger.info('Successfully connected to Bitbucket');
        }
        catch (error) {
            this.connectionState = 'error';
            this.logger.error('Failed to initialize Bitbucket connection:', error);
            throw error;
        }
    }
    async testConnection() {
        if (!this.bitbucket || !this.workspace) {
            throw new ICICDProvider_1.CICDError('not_initialized', 'Provider not initialized');
        }
        try {
            await this.bitbucket.workspaces.getWorkspace({ workspace: this.workspace });
        }
        catch (error) {
            throw new ICICDProvider_1.CICDError('connection_failed', 'Failed to connect to Bitbucket');
        }
    }
    async getCredentials() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const username = config.get('bitbucket.username');
        const appPassword = config.get('bitbucket.appPassword');
        const workspace = config.get('bitbucket.workspace');
        if (!username || !appPassword || !workspace) {
            return undefined;
        }
        return { username, appPassword, workspace };
    }
    async isConfigured() {
        return this.connectionState === 'connected';
    }
    async createWorkflow(options) {
        if (!this.isConfigured()) {
            throw new ICICDProvider_1.CICDError('not_configured', 'Bitbucket provider not configured');
        }
        try {
            const workflowPath = options.path || 'bitbucket-pipelines.yml';
            const template = await (0, retry_1.retry)(() => this.loadWorkflowTemplate(options.template), { retries: 3, backoff: true });
            const content = this.replaceVariables(template, options.variables || {});
            await vscode.workspace.fs.writeFile(vscode.Uri.file(workflowPath), Buffer.from(content));
            this.logger.info(`Created workflow at ${workflowPath}`);
        }
        catch (error) {
            this.logger.error('Failed to create workflow:', error);
            throw new ICICDProvider_1.CICDError('workflow_creation_failed', 'Failed to create workflow');
        }
    }
    async loadWorkflowTemplate(templateName) {
        try {
            const templatePath = vscode.Uri.file(`templates/bitbucket/${templateName}.yml`);
            const content = await vscode.workspace.fs.readFile(templatePath);
            return content.toString();
        }
        catch (error) {
            throw new ICICDProvider_1.CICDError('template_not_found', `Template ${templateName} not found`);
        }
    }
    replaceVariables(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
        }
        return result;
    }
    async listWorkflows() {
        if (!this.isConfigured()) {
            throw new ICICDProvider_1.CICDError('not_configured', 'Bitbucket provider not configured');
        }
        try {
            const pipelineFiles = await vscode.workspace.findFiles('bitbucket-pipelines.yml', '**/node_modules/**');
            if (pipelineFiles.length === 0) {
                return [];
            }
            const workflows = [];
            for (const file of pipelineFiles) {
                const content = await vscode.workspace.fs.readFile(file);
                const contentStr = content.toString();
                // Simple YAML parsing to check if pipelines section exists
                const hasPipelines = contentStr.includes('pipelines:');
                const lastRun = await this.getLastRunStatus(file.fsPath);
                workflows.push({
                    name: 'bitbucket-pipelines.yml',
                    path: file.fsPath,
                    status: hasPipelines ? 'active' : 'disabled',
                    lastRun: lastRun ? new Date(lastRun) : undefined
                });
            }
            return workflows;
        }
        catch (error) {
            this.logger.error('Failed to list workflows:', error);
            throw new ICICDProvider_1.CICDError('workflow_list_failed', 'Failed to list workflows');
        }
    }
    async getLastRunStatus(pipelinePath) {
        if (!this.bitbucket || !this.workspace) {
            return undefined;
        }
        try {
            const repository = pipelinePath.split('/').slice(-2)[0];
            const response = await this.bitbucket.pipelines.list({
                workspace: this.workspace,
                repo_slug: repository,
                sort: '-created_on',
                page: 1,
                pagelen: 1
            });
            const pipeline = response.data.values?.[0];
            return pipeline?.created_on;
        }
        catch {
            return undefined;
        }
    }
    async deleteWorkflow(name) {
        if (!this.isConfigured()) {
            throw new ICICDProvider_1.CICDError('not_configured', 'Bitbucket provider not configured');
        }
        try {
            const workflows = await this.listWorkflows();
            const workflow = workflows.find(w => w.name === name);
            if (!workflow) {
                throw new ICICDProvider_1.CICDError('workflow_not_found', `Workflow ${name} not found`);
            }
            await vscode.workspace.fs.delete(vscode.Uri.file(workflow.path));
            this.logger.info(`Deleted workflow ${name}`);
        }
        catch (error) {
            this.logger.error('Failed to delete workflow:', error);
            throw new ICICDProvider_1.CICDError('workflow_deletion_failed', 'Failed to delete workflow');
        }
    }
}
exports.BitbucketPipelinesProvider = BitbucketPipelinesProvider;
//# sourceMappingURL=BitbucketPipelinesProvider.js.map