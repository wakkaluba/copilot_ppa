import { Disposable } from 'vscode';
/**
 * Base class for components that emit events
 * Implements proper cleanup of event listeners
 */
export declare class EventEmitter implements Disposable {
    private eventListeners;
    /**
     * Add event listener
     * @param event Event name
     * @param listener Callback function
     * @returns Disposable to remove the listener
     */
    on(event: string, listener: (...args: any[]) => void): Disposable;
    /**
     * Remove event listener
     * @param event Event name
     * @param listener Callback function
     */
    off(event: string, listener: (...args: any[]) => void): void;
    /**
     * Emit event with arguments
     * @param event Event name
     * @param args Arguments to pass to listeners
     */
    emit(event: string, ...args: any[]): void;
    /**
     * Remove all listeners
     */
    removeAllListeners(): void;
    /**
     * Dispose of all resources
     */
    dispose(): void;
}
