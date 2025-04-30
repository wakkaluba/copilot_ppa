import * as vscode from 'vscode';

/**
 * Options for showing a confirmation dialog
 */
export interface ConfirmationOptions {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    detail?: string;
    operationType?: 'file' | 'workspace' | 'process' | 'other';
}

/**
 * Service to handle user confirmations and remember user preferences
 */
export class UserConfirmationService implements vscode.Disposable {
    private static instance: UserConfirmationService;
    private context: vscode.ExtensionContext;
    private disposables: vscode.Disposable[] = [];

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Initialize the UserConfirmationService
     */
    public static initialize(context: vscode.ExtensionContext): UserConfirmationService {
        if (!this.instance) {
            this.instance = new UserConfirmationService(context);
        }
        return this.instance;
    }

    /**
     * Get the UserConfirmationService instance
     */
    public static getInstance(): UserConfirmationService {
        if (!this.instance) {
            throw new Error('UserConfirmationService not initialized');
        }
        return this.instance;
    }

    /**
     * Show a confirmation dialog to the user
     *
     * @param options The configuration options for the confirmation
     * @returns True if the user confirmed, false otherwise
     */
    public async showConfirmation(options: ConfirmationOptions): Promise<boolean> {
        // Check if confirmations are disabled for this operation type
        if (options.operationType && this.isConfirmationDisabled(options.operationType)) {
            return true;
        }

        const confirmLabel = options.confirmLabel || 'Yes';
        const cancelLabel = options.cancelLabel || 'No';

        const result = await vscode.window.showInformationMessage(
            options.message,
            {
                modal: true,
                detail: options.detail
            },
            confirmLabel,
            cancelLabel,
            'Don\'t ask again'
        );

        if (result === 'Don\'t ask again' && options.operationType) {
            // Remember the preference not to show this type of confirmation again
            await this.disableConfirmation(options.operationType);
            return true;
        }

        return result === confirmLabel;
    }

    /**
     * Show a notification for a long-running operation
     *
     * @param title The title of the notification
     * @param task The long-running task function
     * @returns The result of the task
     */
    public async showLongRunningOperation<T>(
        title: string,
        task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
    ): Promise<T> {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: title,
            cancellable: false
        }, task);
    }

    /**
     * Check if confirmations are disabled for a specific operation type
     */
    private isConfirmationDisabled(operationType: string): boolean {
        const config = vscode.workspace.getConfiguration('copilotPPA.confirmations');
        return config.get<boolean>(`disable${operationType.charAt(0).toUpperCase() + operationType.slice(1)}Confirmations`, false);
    }

    /**
     * Disable confirmations for a specific operation type
     */
    private async disableConfirmation(operationType: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilotPPA.confirmations');
        await config.update(
            `disable${operationType.charAt(0).toUpperCase() + operationType.slice(1)}Confirmations`,
            true,
            vscode.ConfigurationTarget.Global
        );
    }

    /**
     * Enable confirmations for a specific operation type
     */
    public async enableConfirmation(operationType: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('copilotPPA.confirmations');
        await config.update(
            `disable${operationType.charAt(0).toUpperCase() + operationType.slice(1)}Confirmations`,
            false,
            vscode.ConfigurationTarget.Global
        );
    }

    /**
     * Dispose all resources
     */
    public dispose(): void {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables = [];
    }
}
