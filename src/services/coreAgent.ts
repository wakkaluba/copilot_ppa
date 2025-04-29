import { ContextManager } from './conversation/ContextManager';
import { Logger } from '../utils/logger';

/**
 * CoreAgent class that handles interactions with the context manager
 * and provides the main functionality for processing user inputs
 */
export class CoreAgent {
    constructor(
        private readonly contextManager: ContextManager,
        private readonly logger: Logger
    ) {
        this.logger.info('CoreAgent initialized');
    }

    /**
     * Process user input and return a response
     * @param input The user input to process
     * @returns Response with text and context
     */
    public async processInput(input: string): Promise<any> {
        try {
            this.logger.info(`Processing input: ${input.substring(0, 50)}${input.length > 50 ? '...' : ''}`);
            const response = await this.contextManager.addMessage(input, 'user');
            return response;
        } catch (error) {
            this.logger.error(`Error processing input: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Get suggestions based on current input
     * @param input Current input text
     * @returns Array of suggestions
     */
    public async getSuggestions(input: string): Promise<string[]> {
        try {
            // The ContextManager's getRecentHistory method now explicitly supports
            // accepting an input string for generating suggestions based on context
            const suggestions = await this.contextManager.getRecentHistory(input);
            return suggestions;
        } catch (error) {
            this.logger.error(`Error getting suggestions: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }

    /**
     * Clear the conversation context
     */
    public async clearContext(): Promise<void> {
        try {
            await this.contextManager.clearContext();
        } catch (error) {
            this.logger.error(`Error clearing context: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.contextManager.dispose();
    }
}
