export declare class OfflineCache {
    private cachePath;
    private memoryCache;
    constructor();
    initialize(): Promise<void>;
    private loadCache;
    get(key: string): Promise<any | null>;
    set(key: string, value: any): Promise<void>;
    private hashKey;
}
