import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { CopilotConnectionService } from './copilot/CopilotConnectionService';
import { CopilotChatService } from './copilot/CopilotChatService';
import { CopilotSuggestionService } from './copilot/CopilotSuggestionService';
import { CopilotDataTransformer } from './copilot/CopilotDataTransformer';

export class CopilotApiService {
    private static instance: CopilotApiService;
    private readonly logger: Logger;
    private readonly connectionService: CopilotConnectionService;
    private readonly chatService: CopilotChatService;
    private readonly suggestionService: CopilotSuggestionService;
    private readonly dataTransformer: CopilotDataTransformer;
    
    private constructor() {
        this.logger = Logger.getInstance();
        this.connectionService = new CopilotConnectionService(this.logger);
        this.chatService = new CopilotChatService(this.logger);
        this.suggestionService = new CopilotSuggestionService(this.logger);
        this.dataTransformer = new CopilotDataTransformer();
    }
    
    public static getInstance(): CopilotApiService {
        if (!CopilotApiService.instance) {
            CopilotApiService.instance = new CopilotApiService();
        }
        return CopilotApiService.instance;
    }
    
    public async initialize(): Promise<boolean> {
        try {
            const copilotExtension = await this.connectionService.initialize();
            if (copilotExtension) {
                this.chatService.setExtension(copilotExtension);
                this.suggestionService.setExtension(copilotExtension);
                return true;
            }
            return false;
        } catch (error) {
            this.logger.error('Failed to initialize Copilot API connection', error);
            return false;
        }
    }
    
    public isConnected(): boolean {
        return this.connectionService.isConnected();
    }
    
    public async sendChatRequest(prompt: string, context?: any): Promise<string> {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        
        try {
            return await this.chatService.sendRequest(prompt, context);
        } catch (error) {
            this.logger.error('Error sending chat request to Copilot', error);
            throw new Error('Failed to communicate with Copilot: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
    
    public async getCodeSuggestions(code: string, language: string): Promise<string[]> {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        
        try {
            return await this.suggestionService.getSuggestions(code, language);
        } catch (error) {
            this.logger.error('Error getting code suggestions from Copilot', error);
            throw new Error('Failed to get suggestions from Copilot');
        }
    }
    
    public registerResponseHandler(callback: (response: any) => void): void {
        if (!this.isConnected()) {
            throw new Error('Copilot API not connected. Call initialize() first.');
        }
        
        this.chatService.registerResponseHandler(callback);
    }
    
    public transformData(data: any, targetFormat: 'copilot' | 'localLLM'): any {
        return this.dataTransformer.transform(data, targetFormat);
    }
}
