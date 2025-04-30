export interface RepositoryProvider {
    name: string;
    isEnabled: boolean;
    createRepository(name: string, description: string, isPrivate: boolean): Promise<string>;
    cloneRepository(url: string, path: string): Promise<boolean>;
}
export declare class RepositoryManager {
    private providers;
    private _isEnabled;
    constructor();
    get isEnabled(): boolean;
    setEnabled(value: boolean): void;
    getProviders(): RepositoryProvider[];
    getProvider(name: string): RepositoryProvider | undefined;
    createRepository(provider: string, name: string, description?: string, isPrivate?: boolean): Promise<string | undefined>;
    cloneRepository(provider: string, url: string, path: string): Promise<boolean>;
}
export declare const repositoryManager: RepositoryManager;
