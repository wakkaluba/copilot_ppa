/**
 * Status types for the LLM connection
 */
export declare enum ConnectionStatus {
    Disconnected = "Disconnected",
    Connecting = "Connecting",
    Connected = "Connected",
    Error = "Error"
}
/**
 * A class that manages the status bar item for displaying LLM connection status
 */
export declare class ConnectionStatusBar {
    private statusBarItem;
    private status;
    constructor();
    /**
     * Update the connection status display
     * @param newStatus The new connection status
     * @param message Optional additional message to display
     */
    updateStatus(newStatus: ConnectionStatus, message?: string): void;
    /**
     * Get the current connection status
     */
    getStatus(): ConnectionStatus;
    /**
     * Dispose of the status bar item when extension is deactivated
     */
    dispose(): void;
}
