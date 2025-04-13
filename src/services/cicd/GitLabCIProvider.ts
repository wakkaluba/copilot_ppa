import * as vscode from 'vscode';
import { ICICDProvider, WorkflowOptions, Workflow } from './ICICDProvider';
import { Gitlab } from '@gitbeaker/node';
import * as yaml from 'yaml';

export class GitLabCIProvider implements ICICDProvider {
    private gitlab: Gitlab | undefined;
    name = 'GitLab CI/CD';

    constructor() {
        this.initialize();
    }

    private async initialize() {
        const token = await this.getAuthToken();
        const url = await this.getGitLabUrl();
        if (token) {
            this.gitlab = new Gitlab({
                token,
                host: url || 'https://gitlab.com'
            });
        }
    }

    private async getAuthToken(): Promise<string | undefined> {
        return vscode.workspace.getConfiguration('copilot-ppa')
            .get('gitlab.personalAccessToken');
    }

    private async getGitLabUrl(): Promise<string | undefined> {
        return vscode.workspace.getConfiguration('copilot-ppa')
            .get('gitlab.url');
    }

    async isConfigured(): Promise<boolean> {
        return !!this.gitlab;
    }

    async createWorkflow(options: WorkflowOptions): Promise<void> {
        const workflowPath = options.path || '.gitlab-ci.yml';
        const template = await this.loadWorkflowTemplate(options.template);
        const content = this.replaceVariables(template, options.variables);

        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(workflowPath),
            Buffer.from(content)
        );
    }

    private async loadWorkflowTemplate(templateName: string): Promise<string> {
        const templatePath = vscode.Uri.file(`templates/gitlab/${templateName}.yml`);
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
        const ciFile = await vscode.workspace.findFiles(
            '.gitlab-ci.yml',
            '**/node_modules/**'
        );

        if (ciFile.length === 0) {
            return [];
        }

        const content = await vscode.workspace.fs.readFile(ciFile[0]);
        const config = yaml.parse(content.toString());
        
        return [{
            name: '.gitlab-ci.yml',
            path: ciFile[0].fsPath,
            status: config.workflow?.rules ? 'active' : 'disabled'
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
