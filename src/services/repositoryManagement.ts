import * as vscode from 'vscode';
import { GitHubProvider } from './providers/github';
import { GitLabProvider } from './providers/gitlab';
import { BitbucketProvider } from './providers/bitbucket';

export interface RepositoryProvider {
    name: string;
    isEnabled: boolean;
    createRepository(name: string, description: string, isPrivate: boolean): Promise<string>;
    cloneRepository(url: string, path: string): Promise<boolean>;
}

export class RepositoryManager {
    private providers: Map<string, RepositoryProvider>;
    private _isEnabled: boolean = false;
    
    constructor() {
        this.providers = new Map();
        // Initialize providers
        this.providers.set('github', new GitHubProvider());
        this.providers.set('gitlab', new GitLabProvider());
        this.providers.set('bitbucket', new BitbucketProvider());
    }
    
    public get isEnabled(): boolean {
        return this._isEnabled;
    }
    
    public setEnabled(value: boolean): void {
        this._isEnabled = value;
        vscode.commands.executeCommand('setContext', 'copilotPPA.repositoryAccessEnabled', value);
    }
    
    public getProviders(): RepositoryProvider[] {
        return Array.from(this.providers.values());
    }
    
    public getProvider(name: string): RepositoryProvider | undefined {
        return this.providers.get(name);
    }
    
    public async createRepository(
        provider: string, 
        name: string, 
        description: string = '', 
        isPrivate: boolean = true
    ): Promise<string | undefined> {
        if (!this.isEnabled) {
            throw new Error('Repository access is disabled. Enable it in settings first.');
        }
        
        const repoProvider = this.providers.get(provider);
        if (!repoProvider) {
            throw new Error(`Provider "${provider}" is not supported.`);
        }
        
        if (!repoProvider.isEnabled) {
            throw new Error(`Provider "${provider}" is not configured. Please check your settings.`);
        }
        
        return await repoProvider.createRepository(name, description, isPrivate);
    }
    
    public async cloneRepository(provider: string, url: string, path: string): Promise<boolean> {
        if (!this.isEnabled) {
            throw new Error('Repository access is disabled. Enable it in settings first.');
        }
        
        const repoProvider = this.providers.get(provider);
        if (!repoProvider) {
            throw new Error(`Provider "${provider}" is not supported.`);
        }
        
        return await repoProvider.cloneRepository(url, path);
    }
}

// Singleton instance
export const repositoryManager = new RepositoryManager();
