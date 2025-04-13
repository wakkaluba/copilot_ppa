import * as vscode from 'vscode';
import { IRepositoryProvider, RepositoryOptions, Repository } from './IRepositoryProvider';
import { Bitbucket } from 'bitbucket';

export class BitbucketProvider implements IRepositoryProvider {
    private bitbucket: Bitbucket | undefined;
    private workspace: string | undefined;
    name = 'Bitbucket';

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

    async createRepository(options: RepositoryOptions): Promise<void> {
        if (!this.bitbucket || !this.workspace) {
            throw new Error('Bitbucket provider not configured');
        }

        await this.bitbucket.repositories.create({
            workspace: this.workspace,
            _body: {
                name: options.name,
                description: options.description,
                is_private: options.private,
                scm: 'git'
            }
        });
    }

    async getRepositories(): Promise<Repository[]> {
        if (!this.bitbucket || !this.workspace) {
            throw new Error('Bitbucket provider not configured');
        }

        const { data } = await this.bitbucket.repositories.list({
            workspace: this.workspace
        });

        return data.values?.map(repo => ({
            name: repo.name || '',
            url: repo.links?.html?.href || '',
            private: repo.is_private || false,
            description: repo.description || undefined
        })) || [];
    }
}
