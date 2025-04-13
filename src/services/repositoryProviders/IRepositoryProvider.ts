export interface IRepositoryProvider {
    name: string;
    isConfigured(): Promise<boolean>;
    createRepository(options: RepositoryOptions): Promise<void>;
    getRepositories(): Promise<Repository[]>;
}

export interface RepositoryOptions {
    name: string;
    description?: string;
    private?: boolean;
    workspace?: string;
}

export interface Repository {
    name: string;
    url: string;
    private: boolean;
    description?: string;
}
