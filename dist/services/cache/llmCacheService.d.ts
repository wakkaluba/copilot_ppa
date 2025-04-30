interface TaskProgress {
    status: 'not-started' | 'in-progress' | 'completed' | 'do-not-touch';
    percentage: number;
}
export declare class LLMCacheService {
    private cacheDir;
    private cacheTTL;
    private cacheEnabled;
    private todoPath;
    private finishedPath;
    constructor();
    private getExtensionPath;
    private ensureCacheDirectory;
    private getCacheTTLFromConfig;
    private getCacheEnabledFromConfig;
    private generateCacheKey;
    private getCacheFilePath;
    get(prompt: string, model: string, params: any): Promise<any | null>;
    set(prompt: string, model: string, params: any, response: any): void;
    clearCache(): void;
    clearExpiredCache(): void;
    updateTaskProgress(taskDescription: string, status: 'not-started' | 'in-progress' | 'completed' | 'do-not-touch', percentage: number): void;
    private extractTaskDescription;
    private getStatusPrefix;
    private moveTaskToFinished;
    getTaskProgress(taskDescription: string): TaskProgress | null;
}
export {};
