import { ConnectionStateChangeEvent } from '../../types/llm';
import { ConnectionStatus } from './interfaces';
/**
 * Reports LLM connection status to VS Code UI
 */
export declare class LLMStatusReporter {
    private static instance;
    private readonly statusBarItem;
    private readonly outputChannel;
    private currentProvider?;
    private currentModel?;
    private constructor();
    static getInstance(): LLMStatusReporter;
    /**
     * Update the displayed status
     */
    updateStatus(status: ConnectionStatus, provider?: string): void;
    /**
     * Report a connection state change
     */
    reportStateChange(event: ConnectionStateChangeEvent, provider?: string): void;
    /**
     * Report an error
     */
    reportError(error: Error, provider?: string): void;
    /**
     * Show connection details
     */
    showConnectionDetails(): Promise<void>;
    private setupStatusBarItem;
    private updateStatusBar;
    private logStatus;
    private logStateChange;
    dispose(): void;
}
