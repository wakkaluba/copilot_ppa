import * as vscode from 'vscode';
import { IRepositoryProvider, RepositoryOptions, Repository } from './IRepositoryProvider';
import { Gitlab } from '@gitbeaker/node';

export class GitLabProvider implements IRepositoryProvider {
    private gitlab: Gitlab | undefined;
    name = 'GitLab';

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

    async createRepository(options: RepositoryOptions): Promise<void> {
        if (!this.gitlab) {
            throw new Error('GitLab provider not configured');
        }

        await this.gitlab.Projects.create({
            name: options.name,
            description: options.description,
            visibility: options.private ? 'private' : 'public'
        });
    }

    async getRepositories(): Promise<Repository[]> {
        if (!this.gitlab) {
            throw new Error('GitLab provider not configured');
        }

        const projects = await this.gitlab.Projects.all({
            membership: true
        });

        return projects.map(project => ({
            name: project.name,
            url: project.web_url,
            private: project.visibility === 'private',
            description: project.description
        }));
    }
}
