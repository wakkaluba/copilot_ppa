import * as vscode from 'vscode';

export class ProgressHandler {
    private static instance: ProgressHandler;
    private currentProgress?: vscode.Progress<{ message?: string; increment?: number }>;
    private currentToken?: vscode.CancellationToken;

    private constructor() {}

    public static getInstance(): ProgressHandler {
        if (!ProgressHandler.instance) {
            ProgressHandler.instance = new ProgressHandler();
        }
        return ProgressHandler.instance;
    }

    public async showProgress(title: string, totalSteps: number): Promise<void> {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title,
            cancellable: true
        }, async (progress, token) => {
            this.currentProgress = progress;
            this.currentToken = token;
            
            token.onCancellationRequested(() => {
                this.currentProgress = undefined;
                this.currentToken = undefined;
            });

            progress.report({ increment: 0 });
        });
    }

    public updateProgress(increment: number, message?: string): void {
        if (this.currentProgress && !this.currentToken?.isCancellationRequested) {
            this.currentProgress.report({ increment, message });
        }
    }
}
