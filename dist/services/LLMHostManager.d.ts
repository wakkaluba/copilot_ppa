export declare class LLMHostManager {
    private static instance;
    private process;
    private statusBarItem;
    private constructor();
    static getInstance(): LLMHostManager;
    startHost(): Promise<void>;
    stopHost(): Promise<void>;
    private updateStatus;
    dispose(): void;
}
