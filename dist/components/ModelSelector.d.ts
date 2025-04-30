export declare class ModelSelector {
    private static instance;
    private statusBarItem;
    private currentModel;
    private constructor();
    static getInstance(): ModelSelector;
    promptModelSelection(): Promise<void>;
    private getAvailableModels;
    private setModel;
    private updateStatusBarItem;
    initialize(): Promise<void>;
}
