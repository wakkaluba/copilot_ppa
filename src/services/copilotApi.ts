import * as vscode from 'vscode';
import { Logger } from '../utils/logger';

/**
 * Service for interacting with the Copilot API
 */
export class CopilotApiService {
    private static instance: CopilotApiService;
    private logger: Logger;
    private copilotExtension: any | undefined;
    
    private constructor() {
        this.logger = Logger.getInstance();
    }
    
    /**
     * Get singleton instance of CopilotApiService
     */
    public static getInstance(): CopilotApiService {
        if (!CopilotApiService.instance) {
            CopilotApiService.instance = new CopilotApiService();
        }
        return CopilotApiService.instance;
    }
    
    /**
     * Initialize connection to Copilot extension
     */
    public async initialize(): Promise<boolean> {
        try {
            // Find and connect to the Copilot extension
            const extension = vscode.extensions.getExtension('GitHub.copilot');
            if (!extension) {
                this.logger.warn('GitHub Copilot extension not found');
                return false;
            }
            
            if (!extension.isActive) {
                await extension.activate();
            }
            
            this.copilotExtension = extension.exports;
            this.logger.info('Successfully connected to GitHub Copilot extension');
            return true;
        } catch (error) {
            this.logger.error('Failed to initialize Copilot API connection', error);
            return false;
        }
    }
    
    /**
     * Check if the Copilot API is available and connected
     */
    public isConnected(): boolean {
        return !!this.copilotExtension;
    }
    
    /**
     * Send a message to Copilot chat and get the response
     * @param prompt The user's message/prompt
     * @param context Additional context for the request
     */
    public async sendChatRequest(prompt: string, context?: any): Promise<string> {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        
        try {
            // Access the internal chat API of Copilot
            const response = await this.copilotExtension.chat.sendRequest({
                message: prompt,
                context: context || {},
            });
            
            return response.message;
        } catch (error) {
            this.logger.error('Error sending chat request to Copilot', error);
            throw new Error('Failed to communicate with Copilot: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
    
    /**
     * Submit code snippets to Copilot for suggestions
     * @param code The code to analyze
     * @param language The programming language
     */
    public async getCodeSuggestions(code: string, language: string): Promise<string[]> {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        
        try {
            const suggestions = await this.copilotExtension.getSuggestions(code, {
                language,
                position: { line: 0, character: 0 }
            });
            
            return suggestions.map((suggestion: any) => suggestion.text);
        } catch (error) {
            this.logger.error('Error getting code suggestions from Copilot', error);
            throw new Error('Failed to get suggestions from Copilot');
        }
    }
    
    /**
     * Register a callback to handle Copilot responses
     * @param callback Function to call when a response is received
     */
    public registerResponseHandler(callback: (response: any) => void): void {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        
        this.copilotExtension.onResponse((data: any) => {
            callback(data);
        });
    }
    
    /**
     * Transform data between local LLM format and Copilot format
     * @param data The data to transform
     * @param targetFormat The format to transform to
     */
    public transformData(data: any, targetFormat: 'copilot' | 'localLLM'): any {
        switch (targetFormat) {
            case 'copilot':
                return {
                    message: data.content,
                    user: data.user || 'user',
                    timestamp: data.timestamp || new Date().toISOString(),
                    metadata: data.metadata || {}
                };
            case 'localLLM':
                return {
                    content: data.message,
                    user: data.user || 'assistant',
                    timestamp: data.timestamp || new Date().toISOString(),
                    metadata: data.metadata || {}
                };
            default:
                throw new Error(`Unknown target format: ${targetFormat}`);
        }
    }
}
