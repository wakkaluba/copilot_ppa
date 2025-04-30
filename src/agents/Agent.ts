import * as vscode from 'vscode';
import { AgentResponseEnhancer } from '../services/AgentResponseEnhancer';

export class Agent implements vscode.Disposable {
    private readonly responseEnhancer: AgentResponseEnhancer;
    private readonly llmService: any;
    private readonly conversationHistory: any[];

    constructor(context: vscode.ExtensionContext, options: {
        llmService: any;
        conversationHistory: any[];
        responseEnhancer: AgentResponseEnhancer;
    }) {
        this.llmService = options.llmService;
        this.conversationHistory = options.conversationHistory;
        this.responseEnhancer = options.responseEnhancer;
    }

    async processMessage(message: string): Promise<string> {
        // Add user message to the conversation history
        this.conversationHistory.push({ role: 'user', content: message });

        // Generate a response from the LLM service
        const baseResponse = await this.llmService.generateResponse(message);

        // Enhance the response with context from conversation history
        const enhancedResponse = await this.responseEnhancer.enhanceResponse(message, baseResponse);

        return enhancedResponse;
    }

    dispose() {
        // Clean up resources if necessary
    }
}
