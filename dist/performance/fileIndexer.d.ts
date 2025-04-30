export declare class FileIndexer {
    private index;
    private workers;
    constructor();
    buildIndex(): Promise<void>;
    searchIndex(query: string): Promise<string[]>;
    private splitWork;
    private indexChunk;
    private intersectSets;
}
