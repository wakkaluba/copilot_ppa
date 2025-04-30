import { IRepositoryProvider, RepositoryOptions, Repository } from './IRepositoryProvider';
export declare class GitLabProvider implements IRepositoryProvider {
    private gitlab?;
    name: string;
    constructor();
    private initialize;
    private getAuthToken;
    private getGitLabUrl;
    isConfigured(): Promise<boolean>;
    createRepository(options: RepositoryOptions): Promise<void>;
    getRepositories(): Promise<Repository[]>;
}
