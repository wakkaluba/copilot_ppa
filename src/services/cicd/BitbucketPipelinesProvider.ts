import * as vscode from 'vscode';
import { ICICDProvider, WorkflowOptions, Workflow } from './ICICDProvider';
import { Bitbucket } from 'bitbucket';
import * as yaml from 'yaml';

export class BitbucketPipelinesProvider implements ICICDProvider {
    private bitbucket: Bitbucket | undefined;
    private workspace: string | undefined;
    name = 'Bitbucket Pipelines';

    constructor() {
        this.initialize();
    }

    private async initialize() {
        const credentials = await this.getCredentials();
        if (credentials) {
            this.bitbucket = new Bitbucket({
                auth: {
                    username: credentials.username,
                    password: credentials.appPassword
                }
            });
            this.workspace = credentials.workspace;
        }
    }

    private async getCredentials(): Promise<{ username: string; appPassword: string; workspace: string; } | undefined> {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const username = config.get('bitbucket.username');
        const appPassword = config.get('bitbucket.appPassword');
        const workspace = config.get('bitbucket.workspace');

        if (username && appPassword && workspace) {
            return { username, appPassword, workspace };
        }
        return undefined;
    }

    async isConfigured(): Promise<boolean> {
        return !!(this.bitbucket && this.workspace);
    }

    async createWorkflow(options: WorkflowOptions): Promise<void> {
        const workflowPath = options.path || 'bitbucket-pipelines.yml';
        const template = await this.loadWorkflowTemplate(options.template);
        const content = this.replaceVariables(template, options.variables);

        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(workflowPath),
            Buffer.from(content)
        );
    }

    private async loadWorkflowTemplate(templateName: string): Promise<string> {
        const templatePath = vscode.Uri.file(`templates/bitbucket/${templateName}.yml`);
        const content = await vscode.workspace.fs.readFile(templatePath);
        return content.toString();
    }

    private replaceVariables(template: string, variables: { [key: string]: string }): string {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
        }
        return result;
    }

    async listWorkflows(): Promise<Workflow[]> {
        const pipelineFile = await vscode.workspace.findFiles(
            'bitbucket-pipelines.yml',
            '**/node_modules/**'
        );

        if (pipelineFile.length === 0) {
            return [];
        }

        const content = await vscode.workspace.fs.readFile(pipelineFile[0]);
        const config = yaml.parse(content.toString());
        
        return [{
            name: 'bitbucket-pipelines.yml',
            path: pipelineFile[0].fsPath,
            status: config.pipelines ? 'active' : 'disabled'
        }];
    }

    async deleteWorkflow(name: string): Promise<void> {
        const workflows = await this.listWorkflows();
        const workflow = workflows.find(w => w.name === name);
        if (workflow) {
            await vscode.workspace.fs.delete(vscode.Uri.file(workflow.path));
        }
    }
}
