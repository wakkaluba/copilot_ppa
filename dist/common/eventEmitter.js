"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
/**
 * Base class for components that emit events
 * Implements proper cleanup of event listeners
 */
class EventEmitter {
    eventListeners = new Map();
    /**
     * Add event listener
     * @param event Event name
     * @param listener Callback function
     * @returns Disposable to remove the listener
     */
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(listener);
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
    off(event, listener) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(listener);
        }
    }
    /**
     * Emit event with arguments
     * @param event Event name
     * @param args Arguments to pass to listeners
     */
    emit(event, ...args) {
        if (this.eventListeners.has(event)) {
            for (const listener of this.eventListeners.get(event)) {
                try {
                    listener(...args);
                }
                catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            }
        }
    }
    /**
     * Remove all listeners
     */
    removeAllListeners() {
        this.eventListeners.clear();
    }
    /**
     * Dispose of all resources
     */
    dispose() {
        this.removeAllListeners();
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=eventEmitter.js.map