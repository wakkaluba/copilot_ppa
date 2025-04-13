import * as vscode from 'vscode';
import { PromptManager } from './PromptManager';
import { ContextManager } from './ContextManager';
import { CommandParser } from './CommandParser';
import { ConversationManager } from './ConversationManager';

export class CoreAgent {
    private static instance: CoreAgent;
    private promptManager: PromptManager;
    private contextManager: ContextManager;
    private commandParser: CommandParser;
    private conversationManager: ConversationManager;
    private status: 'idle' | 'processing' | 'error' = 'idle';

    private constructor() {
        this.promptManager = PromptManager.getInstance();
        this.contextManager = ContextManager.getInstance();
        this.commandParser = CommandParser.getInstance();
        this.conversationManager = ConversationManager.getInstance();
    }

    static getInstance(): CoreAgent {
        if (!this.instance) {
            this.instance = new CoreAgent();
        }
        return this.instance;
    }

    async processInput(input: string): Promise<void> {
        try {
            this.status = 'processing';
            
            // Get conversation context
            const context = await this.contextManager.buildContext(
                'current',
                input
            );

            // Generate prompt based on input and context
            const prompt = this.promptManager.generatePrompt('agent-task', {
                input,
                context: context.join('\n')
            });

            // Process the response (assuming LLM response is received)
            await this.handleResponse(prompt);

            this.status = 'idle';
        } catch (error) {
            this.status = 'error';
            throw error;
        }
    }

    private async handleResponse(response: string): Promise<void> {
        // Check for commands in response
        if (response.includes('#')) {
            const commands = response.match(/#\w+\([^)]+\)/g) || [];
            for (const command of commands) {
                await this.commandParser.parseAndExecute(command);
            }
        }

        // Update conversation history
        await this.conversationManager.addMessage('assistant', response);
    }

    async analyzeCode(code: string, context?: string): Promise<string> {
        const prompt = this.promptManager.generatePrompt('analyze-code', {
            code,
            context: context || ''
        });
        // Process with LLM and return analysis
        return prompt; // Placeholder
    }

    async suggestImprovements(code: string): Promise<string> {
        const prompt = this.promptManager.generatePrompt('suggest-improvements', {
            code
        });
        // Process with LLM and return suggestions
        return prompt; // Placeholder
    }

    getStatus(): string {
        return this.status;
    }
}
