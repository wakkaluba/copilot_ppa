import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';

/**
 * Interface for storing confirmation preferences
 */
interface StoredConfirmationPreferences {
    disableContinuePrompts: boolean;
    disabledPromptTypes: string[];
    notificationPreferences: {
        showNotificationsForLongOperations: boolean;
        longOperationThresholdMs: number;
    };
}

/**
 * Service to handle user confirmation preferences and dialogs
 */
export class UserConfirmationService {
    private static instance: UserConfirmationService;
    private readonly _logger: Logger;
    private readonly _context: vscode.ExtensionContext;
    private readonly _storageKey = 'userConfirmationPreferences';

    // Default preferences
    private _preferences: StoredConfirmationPreferences = {
        disableContinuePrompts: false,
        disabledPromptTypes: [],
        notificationPreferences: {
            showNotificationsForLongOperations: true,
            longOperationThresholdMs: 5000 // 5 seconds default
        }
    };

    // Track ongoing operations
    private _activeOperations: Map<string, {
        startTime: number;
        notificationShown: boolean;
        statusBarItem?: vscode.StatusBarItem;
    }> = new Map();

    private constructor(context: vscode.ExtensionContext) {
        this._context = context;
        this._logger = Logger.getInstance();
    }

    /**
     * Get the singleton instance of the UserConfirmationService
     */
    public static getInstance(context: vscode.ExtensionContext): UserConfirmationService {
        if (!UserConfirmationService.instance) {
            UserConfirmationService.instance = new UserConfirmationService(context);
            UserConfirmationService.instance.initialize().catch(error => {
                console.error('Failed to initialize user confirmation service:', error);
            });
        }
        return UserConfirmationService.instance;
    }

    /**
     * Initialize the service by loading saved preferences
     */
    public async initialize(): Promise<void> {
        try {
            const storedData = this._context.globalState.get<StoredConfirmationPreferences>(this._storageKey);

            if (storedData) {
                this._preferences = {
                    ...this._preferences,
                    ...storedData
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this._logger.error(`Failed to initialize confirmation preferences: ${errorMessage}`);
        }
    }

    /**
     * Show a confirmation dialog to the user if not disabled
     * @param message The message to show
     * @param promptType Optional type identifier for this prompt (to allow disabling specific types)
     * @param options Custom options for the dialog
     * @returns true if confirmed or prompts disabled, false otherwise
     */
    public async showConfirmationDialog(
        message: string,
        promptType?: string,
        options?: {
            title?: string;
            yesButtonText?: string;
            noButtonText?: string;
            dontAskAgainButtonText?: string;
        }
    ): Promise<boolean> {
        // Check if all continue prompts are disabled
        if (this._preferences.disableContinuePrompts) {
            return true;
        }

        // Check if this specific prompt type is disabled
        if (promptType && this._preferences.disabledPromptTypes.includes(promptType)) {
            return true;
        }

        // Set up button texts
        const yesButton = options?.yesButtonText || 'Yes';
        const noButton = options?.noButtonText || 'No';
        const dontAskButton = options?.dontAskAgainButtonText || "Don't Ask Again";

        // Show the dialog
        const selectedOption = await vscode.window.showInformationMessage(
            message,
            { title: options?.title || 'Confirmation Required' },
            yesButton,
            noButton,
            dontAskButton
        );

        // Handle the response
        if (selectedOption === dontAskButton) {
            if (promptType) {
                // Disable just this prompt type
                await this.disablePromptType(promptType);
            } else {
                // Disable all continue prompts
                await this.setDisableContinuePrompts(true);
            }
            return true;
        }

        return selectedOption === yesButton;
    }

    /**
     * Start tracking a long-running operation
     * @param operationId Unique identifier for the operation
     * @param description Human-readable description of the operation
     */
    public startOperation(operationId: string, description: string): void {
        this._activeOperations.set(operationId, {
            startTime: Date.now(),
            notificationShown: false,
            statusBarItem: this.createStatusBarItem(operationId, description)
        });

        // Set a timer to check if this becomes a long-running operation
        if (this._preferences.notificationPreferences.showNotificationsForLongOperations) {
            setTimeout(() => {
                this.checkAndNotifyLongRunningOperation(operationId, description);
            }, this._preferences.notificationPreferences.longOperationThresholdMs);
        }
    }

    /**
     * End tracking of an operation
     * @param operationId The operation to end
     */
    public endOperation(operationId: string): void {
        const operation = this._activeOperations.get(operationId);
        if (operation) {
            if (operation.statusBarItem) {
                operation.statusBarItem.dispose();
            }
            this._activeOperations.delete(operationId);
        }
    }

    /**
     * Toggle the "disable continue prompts" setting
     * @param disable Whether to disable all continue prompts
     */
    public async setDisableContinuePrompts(disable: boolean): Promise<void> {
        this._preferences.disableContinuePrompts = disable;
        await this.savePreferences();

        // Show feedback about the change
        const actionText = disable ? 'disabled' : 'enabled';
        vscode.window.showInformationMessage(`Confirmation prompts are now ${actionText}.`);
    }

    /**
     * Get current setting for disabling continue prompts
     */
    public areContinuePromptsDisabled(): boolean {
        return this._preferences.disableContinuePrompts;
    }

    /**
     * Toggle notifications for long-running operations
     * @param enable Whether to enable notifications
     */
    public async setShowNotificationsForLongOperations(enable: boolean): Promise<void> {
        this._preferences.notificationPreferences.showNotificationsForLongOperations = enable;
        await this.savePreferences();
    }

    /**
     * Set the threshold for when an operation is considered "long-running"
     * @param thresholdMs Time in milliseconds
     */
    public async setLongOperationThreshold(thresholdMs: number): Promise<void> {
        this._preferences.notificationPreferences.longOperationThresholdMs = thresholdMs;
        await this.savePreferences();
    }

    /**
     * Disable a specific prompt type
     * @param promptType The type identifier to disable
     */
    private async disablePromptType(promptType: string): Promise<void> {
        if (!this._preferences.disabledPromptTypes.includes(promptType)) {
            this._preferences.disabledPromptTypes.push(promptType);
            await this.savePreferences();
        }
    }

    /**
     * Save current preferences to storage
     */
    private async savePreferences(): Promise<void> {
        try {
            await this._context.globalState.update(this._storageKey, this._preferences);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this._logger.error(`Failed to save confirmation preferences: ${errorMessage}`);
        }
    }

    /**
     * Create a status bar item for an operation
     */
    private createStatusBarItem(operationId: string, description: string): vscode.StatusBarItem {
        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        statusBarItem.text = `$(sync~spin) ${description}`;
        statusBarItem.tooltip = `Long-running operation: ${description}`;
        statusBarItem.show();
        return statusBarItem;
    }

    /**
     * Check if an operation has been running for a long time and notify the user
     */
    private checkAndNotifyLongRunningOperation(operationId: string, description: string): void {
        const operation = this._activeOperations.get(operationId);
        if (!operation || operation.notificationShown) {
            return;
        }

        const elapsedMs = Date.now() - operation.startTime;
        if (elapsedMs >= this._preferences.notificationPreferences.longOperationThresholdMs) {
            vscode.window.showInformationMessage(
                `Operation "${description}" is taking longer than expected.`,
                'Cancel'
            ).then(selection => {
                if (selection === 'Cancel') {
                    this.endOperation(operationId);
                    vscode.window.showInformationMessage(`Operation "${description}" was cancelled.`);
                }
            });

            operation.notificationShown = true;
        }
    }
}
