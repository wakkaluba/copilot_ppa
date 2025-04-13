import * as vscode from 'vscode';
import { IRepositoryProvider, RepositoryOptions, Repository } from './IRepositoryProvider';
import { Octokit } from '@octokit/rest';

export class GitHubProvider implements IRepositoryProvider {
    private octokit: Octokit | undefined;
    name = 'GitHub';

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

    async createRepository(options: RepositoryOptions): Promise<void> {
        if (!this.octokit) {
            throw new Error('GitHub provider not configured');
        }

        await this.octokit.repos.createForAuthenticatedUser({
            name: options.name,
            description: options.description,
            private: options.private ?? false,
        });
    }

    async getRepositories(): Promise<Repository[]> {
        if (!this.octokit) {
            throw new Error('GitHub provider not configured');
        }

        const { data } = await this.octokit.repos.listForAuthenticatedUser();
        return data.map(repo => ({
            name: repo.name,
            url: repo.html_url,
            private: repo.private,
            description: repo.description || undefined
        }));
    }
}
