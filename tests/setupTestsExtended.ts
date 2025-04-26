/**
 * Extended setup for more complex testing scenarios.
 * This file is not automatically loaded by Jest, but can be imported when needed.
 */

// Import only the types, not the actual module
import type * as vscodeTypes from 'vscode';

// Mock VS Code's Event and EventEmitter
class MockEventEmitter<T> implements vscodeTypes.EventEmitter<T> {
    private listeners = new Set<(e: T) => any>();

    public event: vscodeTypes.Event<T> = (listener: (e: T) => any) => {
        this.listeners.add(listener);
        return {
            dispose: () => {
                this.listeners.delete(listener);
            }
        };
    };

    public fire(data: T): void {
        this.listeners.forEach(listener => listener(data));
    }

    public dispose(): void {
        this.listeners.clear();
    }
}

// Create helper for EventEmitter creation
export const createMockEventEmitter = <T>() => new MockEventEmitter<T>();

// Advanced mocks and helpers for complex test scenarios
export const setupExtendedMocks = () => {
    // Anything that needs to be set up for extended testing scenarios
    // can be added here
};

// Setup environment variables needed for tests
process.env.NODE_ENV = 'test';

// Mock global.performance if needed
if (typeof global.performance === 'undefined') {
    global.performance = {
        now: () => Date.now()
    } as Performance;
}

// Export MockEventEmitter for use in tests
export { MockEventEmitter };
