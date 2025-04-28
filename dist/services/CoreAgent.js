"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreAgent = void 0;
/**
 * Core agent that processes user inputs and manages interactions
 */
class CoreAgent {
    /**
     * Create a new CoreAgent instance
     * @param contextManager Context manager instance
     * @param logger Logger instance
     */
    constructor(contextManager, logger) {
        this.contextManager = contextManager;
        this.logger = logger;
    }
    /**
     * Process user input and generate a response with context
     * @param input User input text
     * @returns Response with context information
     */
    async processInput(input) {
        try {
            this.logger.info(`Processing input: ${input}`);
            const response = await this.contextManager.processInput(input);
            return response;
        }
        catch (error) {
            this.logger.error(`Error processing input: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Get suggestions based on current input
     * @param input Current input text
     * @returns List of suggestions
     */
    async getSuggestions(input) {
        try {
            return await this.contextManager.getSuggestions(input);
        }
        catch (error) {
            this.logger.error(`Error getting suggestions: ${error instanceof Error ? error.message : String(error)}`);
            return [];
        }
    }
    /**
     * Clear all context data
     */
    async clearContext() {
        try {
            await this.contextManager.clearContext();
        }
        catch (error) {
            this.logger.error(`Error clearing context: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.contextManager.dispose();
    }
}
exports.CoreAgent = CoreAgent;
//# sourceMappingURL=coreAgent.js.map