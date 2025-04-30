export declare class LLMStatusBar {
    private statusBarItem;
    constructor();
    updateStatus(connected: boolean, modelName?: string): void;
    dispose(): void;
}
