import * as vscode from 'vscode';
import { ContextManager } from './conversation/contextManager';
import { Logger } from '../utils/logger';

/**
 * Core agent that processes user inputs and manages interactions
 */
export class CoreAgent implements vscode.Disposable {
  private contextManager: ContextManager;
  private logger: Logger;

  /**
   * Create a new CoreAgent instance
   * @param contextManager Context manager instance
   * @param logger Logger instance
   */
  constructor(contextManager: ContextManager, logger: Logger) {
    this.contextManager = contextManager;
    this.logger = logger;
  }

  /**
   * Process user input and generate a response with context
   * @param input User input text
   * @returns Response with context information
   */
  public async processInput(input: string): Promise<{ text: string; context: any }> {
    try {
      this.logger.info(`Processing input: ${input}`);
      const response = await this.contextManager.processInput(input);
      return response;
    } catch (error) {
      this.logger.error(`Error processing input: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get suggestions based on current input
   * @param input Current input text
   * @returns List of suggestions
   */
  public async getSuggestions(input: string): Promise<string[]> {
    try {
      return await this.contextManager.getSuggestions(input);
    } catch (error) {
      this.logger.error(`Error getting suggestions: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Clear all context data
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
