export declare class ProgressHandler {
    private static instance;
    private currentProgress?;
    private currentToken?;
    private constructor();
    static getInstance(): ProgressHandler;
    showProgress(title: string, totalSteps: number): Promise<void>;
    updateProgress(increment: number, message?: string): void;
}
