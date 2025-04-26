/**
 * Type declarations for testing
 */
declare namespace vscode {
    interface Event<T> {
        (listener: (e: T) => any): { dispose: () => void };
    }
    
    interface EventEmitter<T> {
        event: Event<T>;
        fire(data: T): void;
        dispose(): void;
    }
    
    interface ConfigurationChangeEvent {
        affectsConfiguration(section: string): boolean;
    }
    
    interface TextEditor {
        document: any;
        selection: any;
    }
}

// Define global types
declare global {
    namespace NodeJS {
        interface Global {
            performance: Performance;
        }
    }
}

// Make this file a module
export {};
