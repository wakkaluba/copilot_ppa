import { IRepositoryProvider, RepositoryOptions, Repository } from './IRepositoryProvider';
export declare class GitHubProvider implements IRepositoryProvider {
    private octokit?;
    name: string;
    constructor();
    private initialize;
    private getAuthToken;
    isConfigured(): Promise<boolean>;
    createRepository(options: RepositoryOptions): Promise<void>;
    getRepositories(): Promise<Repository[]>;
}
