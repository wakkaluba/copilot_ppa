import * as vscode from 'vscode';
import { ICICDProvider, WorkflowOptions, Workflow, CICDError, ConnectionState } from './ICICDProvider';
import { Logger } from '../../services/logger';
import { retry } from '../utils/retry';

export class BitbucketPipelinesProvider implements ICICDProvider {
    private bitbucket?: any;
    private workspace?: string;
    private connectionState: ConnectionState = 'disconnected';
    private readonly logger = new Logger('BitbucketPipelinesProvider');
    private disposables: vscode.Disposable[] = [];
    
    name = 'Bitbucket Pipelines';

    constructor() {
        this.initialize().catch(err => 
            this.logger.error('Failed to initialize Bitbucket provider:', err)
        );
        
        // Watch for configuration changes
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('copilot-ppa.bitbucket')) {
                    this.initialize().catch(err =>
                        this.logger.error('Failed to reinitialize after config change:', err)
                    );
                }
            })
        );
    }

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.connectionState = 'disconnected';
        this.bitbucket = undefined;
    }

    private async initialize(): Promise<void> {
        try {
            this.connectionState = 'connecting';
            const credentials = await this.getCredentials();
            
            if (!credentials) {
                this.connectionState = 'disconnected';
                throw new CICDError('missing_credentials', 'Bitbucket credentials not configured');
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
        } catch (error) {
            this.connectionState = 'error';
            this.logger.error('Failed to initialize Bitbucket connection:', error);
            throw error;
        }
    }

    private async testConnection(): Promise<void> {
        if (!this.bitbucket || !this.workspace) {
            throw new CICDError('not_initialized', 'Provider not initialized');
        }

        try {
            await this.bitbucket.workspaces.getWorkspace({ workspace: this.workspace });
        } catch (error) {
            throw new CICDError('connection_failed', 'Failed to connect to Bitbucket');
        }
    }

    private async getCredentials(): Promise<{ username: string; appPassword: string; workspace: string; } | undefined> {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const username = config.get<string>('bitbucket.username');
        const appPassword = config.get<string>('bitbucket.appPassword');
        const workspace = config.get<string>('bitbucket.workspace');

        if (!username || !appPassword || !workspace) {
            return undefined;
        }

        return { username, appPassword, workspace };
    }

    async isConfigured(): Promise<boolean> {
        return this.connectionState === 'connected';
    }

    async createWorkflow(options: WorkflowOptions): Promise<void> {
        if (!this.isConfigured()) {
            throw new CICDError('not_configured', 'Bitbucket provider not configured');
        }

        try {
            const workflowPath = options.path || 'bitbucket-pipelines.yml';
            const template = await retry(
                () => this.loadWorkflowTemplate(options.template),
                { retries: 3, backoff: true }
            );
            
            const content = this.replaceVariables(template, options.variables || {});

            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(workflowPath),
                Buffer.from(content)
            );

            this.logger.info(`Created workflow at ${workflowPath}`);
        } catch (error) {
            this.logger.error('Failed to create workflow:', error);
            throw new CICDError('workflow_creation_failed', 'Failed to create workflow');
        }
    }

    private async loadWorkflowTemplate(templateName: string): Promise<string> {
        try {
            const templatePath = vscode.Uri.file(`templates/bitbucket/${templateName}.yml`);
            const content = await vscode.workspace.fs.readFile(templatePath);
            return content.toString();
        } catch (error) {
            throw new CICDError('template_not_found', `Template ${templateName} not found`);
        }
    }

    private replaceVariables(template: string, variables: { [key: string]: string }): string {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
        }
        return result;
    }

    async listWorkflows(): Promise<Workflow[]> {
        if (!this.isConfigured()) {
            throw new CICDError('not_configured', 'Bitbucket provider not configured');
        }

        try {
            const pipelineFiles = await vscode.workspace.findFiles(
                'bitbucket-pipelines.yml',
                '**/node_modules/**'
            );

            if (pipelineFiles.length === 0) {
                return [];
            }

            const workflows: Workflow[] = [];
            
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
        } catch (error) {
            this.logger.error('Failed to list workflows:', error);
            throw new CICDError('workflow_list_failed', 'Failed to list workflows');
        }
    }

    private async getLastRunStatus(pipelinePath: string): Promise<string | undefined> {
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
        } catch {
            return undefined;
        }
    }

    async deleteWorkflow(name: string): Promise<void> {
        if (!this.isConfigured()) {
            throw new CICDError('not_configured', 'Bitbucket provider not configured');
        }

        try {
            const workflows = await this.listWorkflows();
            const workflow = workflows.find(w => w.name === name);
            
            if (!workflow) {
                throw new CICDError('workflow_not_found', `Workflow ${name} not found`);
            }

            await vscode.workspace.fs.delete(vscode.Uri.file(workflow.path));
            this.logger.info(`Deleted workflow ${name}`);
        } catch (error) {
            this.logger.error('Failed to delete workflow:', error);
            throw new CICDError('workflow_deletion_failed', 'Failed to delete workflow');
        }
    }
}
