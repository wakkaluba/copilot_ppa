import * as vscode from 'vscode';
import { ICICDProvider, WorkflowOptions, Workflow } from './ICICDProvider';
import { Octokit } from '@octokit/rest';
import * as yaml from 'yaml';

export class GitHubActionsProvider implements ICICDProvider {
    private octokit: Octokit | undefined;
    name = 'GitHub Actions';
    
    constructor() {
        this.initialize();
    }

    private async initialize() {
        const token = await this.getAuthToken();
        if (token) {
            this.octokit = new Octokit({ auth: token });
        }
    }

    private async getAuthToken(): Promise<string | undefined> {
        return vscode.workspace.getConfiguration('copilot-ppa')
            .get('github.personalAccessToken');
    }

    async isConfigured(): Promise<boolean> {
        return !!this.octokit;
    }

    async createWorkflow(options: WorkflowOptions): Promise<void> {
        const workflowPath = options.path || `.github/workflows/${options.name}.yml`;
        const template = await this.loadWorkflowTemplate(options.template);
        const content = this.replaceVariables(template, options.variables);
        
        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(workflowPath),
            Buffer.from(content)
        );
    }

    private async loadWorkflowTemplate(templateName: string): Promise<string> {
        const templatePath = vscode.Uri.file(`templates/github/${templateName}.yml`);
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
        const workflowFiles = await vscode.workspace.findFiles(
            '.github/workflows/*.{yml,yaml}',
            '**/node_modules/**'
        );

        return Promise.all(workflowFiles.map(async file => {
            const content = await vscode.workspace.fs.readFile(file);
            const workflow = yaml.parse(content.toString());
            
            return {
                name: workflow.name || file.fsPath.split('/').pop()?.replace('.yml', ''),
                path: file.fsPath,
                status: workflow.on ? 'active' : 'disabled',
                lastRun: undefined // Would need GitHub API call to get this
            };
        }));
    }

    async deleteWorkflow(name: string): Promise<void> {
        const workflows = await this.listWorkflows();
        const workflow = workflows.find(w => w.name === name);
        if (workflow) {
            await vscode.workspace.fs.delete(vscode.Uri.file(workflow.path));
        }
    }
}
