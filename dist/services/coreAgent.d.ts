import { ContextManager } from './conversation/ContextManager';
import { Logger } from '../utils/logger';
/**
 * CoreAgent class that handles interactions with the context manager
 * and provides the main functionality for processing user inputs
 */
export declare class CoreAgent {
    private readonly contextManager;
    private readonly logger;
    constructor(contextManager: ContextManager, logger: Logger);
    /**
     * Process user input and return a response
     * @param input The user input to process
     * @returns Response with text and context
     */
    processInput(input: string): Promise<any>;
    /**
     * Get suggestions based on current input
     * @param input Current input text
     * @returns Array of suggestions
     */
    getSuggestions(input: string): Promise<string[]>;
    /**
     * Clear the conversation context
     */
    clearContext(): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
