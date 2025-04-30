import { IRepositoryProvider, RepositoryOptions, Repository } from './IRepositoryProvider';
export declare class BitbucketProvider implements IRepositoryProvider {
    private bitbucket?;
    private workspace?;
    name: string;
    constructor();
    private initialize;
    private getCredentials;
    isConfigured(): Promise<boolean>;
    createRepository(options: RepositoryOptions): Promise<void>;
    getRepositories(): Promise<Repository[]>;
}
