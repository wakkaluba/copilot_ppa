import { Disposable } from 'vscode';

/**
 * Base class for components that emit events
 * Implements proper cleanup of event listeners
 */
export class EventEmitter implements Disposable {
    private eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map();

    /**
     * Add event listener
     * @param event Event name
     * @param listener Callback function
     * @returns Disposable to remove the listener
     */
    public on(event: string, listener: (...args: any[]) => void): Disposable {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        
        this.eventListeners.get(event)!.add(listener);
        
        return {
            dispose: () => {
                this.off(event, listener);
            }
        };
    }

    /**
     * Remove event listener
     * @param event Event name
     * @param listener Callback function
     */
    public off(event: string, listener: (...args: any[]) => void): void {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event)!.delete(listener);
        }
    }

    /**
     * Emit event with arguments
     * @param event Event name
     * @param args Arguments to pass to listeners
     */
    public emit(event: string, ...args: any[]): void {
        if (this.eventListeners.has(event)) {
            for (const listener of this.eventListeners.get(event)!) {
                try {
                    listener(...args);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            }
        }
    }

    /**
     * Remove all listeners
     */
    public removeAllListeners(): void {
        this.eventListeners.clear();
    }

    /**
     * Dispose of all resources
     */
    public dispose(): void {
        this.removeAllListeners();
    }
}
