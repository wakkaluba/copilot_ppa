import * as vscode from 'vscode';
import { CopilotApiService } from '../services/copilotApi';
import { Logger } from '../utils/logger';

/**
 * Handles direct integration with GitHub Copilot chat window
 */
export class CopilotChatIntegration {
    private static instance: CopilotChatIntegration;
    private logger: Logger;
    private copilotApiService: CopilotApiService;
    private copilotChatProvider: any;
    private chatContext: Map<string, any> = new Map();
    private isIntegrationActive: boolean = false;
    
    private constructor() {
        this.logger = Logger.getInstance();
        this.copilotApiService = CopilotApiService.getInstance();
    }
    
    /**
     * Get singleton instance of CopilotChatIntegration
     */
    public static getInstance(): CopilotChatIntegration {
        if (!CopilotChatIntegration.instance) {
            CopilotChatIntegration.instance = new CopilotChatIntegration();
        }
        return CopilotChatIntegration.instance;
    }
    
    /**
     * Initialize integration with Copilot chat
     */
    public async initialize(): Promise<boolean> {
        try {
            const isConnected = await this.copilotApiService.initialize();
            if (!isConnected) {
                this.logger.warn('Failed to connect to Copilot API. Integration not available.');
                return false;
            }
            
            // Get GitHub Copilot extension
            const copilotExtension = vscode.extensions.getExtension('GitHub.copilot');
            if (!copilotExtension) {
                this.logger.warn('GitHub Copilot extension not found');
                return false;
            }
            
            if (!copilotExtension.isActive) {
                await copilotExtension.activate();
            }
            
            // Access the chat provider
            this.copilotChatProvider = copilotExtension.exports.getChatProvider?.();
            if (!this.copilotChatProvider) {
                this.logger.warn('GitHub Copilot chat provider not available');
                return false;
            }
            
            // Register our extension as a participant
            this.registerChatParticipant();
            
            this.isIntegrationActive = true;
            this.logger.info('Successfully integrated with GitHub Copilot chat');
            return true;
        } catch (error) {
            this.logger.error('Error initializing Copilot chat integration', error);
            return false;
        }
    }
    
    /**
     * Register as a chat participant in Copilot's chat window
     */
    private registerChatParticipant(): void {
        // Check if the API exists
        if (!this.copilotChatProvider || !this.copilotChatProvider.registerChatParticipant) {
            this.logger.warn('Chat participant registration API not available');
            return;
        }
        
        // Register our extension as a chat participant
        this.copilotChatProvider.registerChatParticipant({
            id: 'local-llm-agent',
            name: 'Local LLM Agent',
            description: 'Integrate local LLM models with Copilot',
            detail: 'Provides responses using locally hosted LLMs',
            
            // Handle incoming messages
            handleMessage: async (request: any) => {
                return await this.handleChatMessage(request);
            },
            
            // Handle command intents (special commands like /explain, etc.)
            handleCommandIntent: async (command: string, args: any) => {
                return await this.handleCommandIntent(command, args);
            }
        });
        
        this.logger.info('Registered as chat participant in GitHub Copilot');
    }
    
    /**
     * Handle incoming chat messages from Copilot
     */
    private async handleChatMessage(request: any): Promise<any> {
        try {
            this.logger.info(`Received chat message: ${request.message}`);
            
            // Store context for this conversation
            this.chatContext.set(request.conversationId, {
                lastMessage: request.message,
                timestamp: new Date().toISOString()
            });
            
            // Process with local LLM
            // This is where you'd connect to your local LLM service
            const localLlmResponse = `This is a response from Local LLM Agent for: "${request.message}"`;
            
            return {
                message: localLlmResponse,
                metadata: {
                    source: 'local-llm-agent',
                    model: 'local-model'
                }
            };
        } catch (error) {
            this.logger.error('Error handling chat message', error);
            return {
                message: `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : String(error)}`,
                metadata: {
                    source: 'local-llm-agent',
                    isError: true
                }
            };
        }
    }
    
    /**
     * Handle command intents (special commands)
     */
    private async handleCommandIntent(command: string, args: any): Promise<any> {
        this.logger.info(`Received command intent: ${command}`);
        
        switch (command) {
            case 'explain':
                return this.handleExplainCommand(args);
            case 'generate':
                return this.handleGenerateCommand(args);
            case 'test':
                return this.handleTestCommand(args);
            default:
                return {
                    message: `Command "${command}" not supported by Local LLM Agent`,
                    metadata: {
                        source: 'local-llm-agent',
                        command
                    }
                };
        }
    }
    
    /**
     * Handle /explain command
     */
    private async handleExplainCommand(args: any): Promise<any> {
        return {
            message: `Here's an explanation from Local LLM Agent: ${args.code}`,
            metadata: {
                source: 'local-llm-agent',
                command: 'explain'
            }
        };
    }
    
    /**
     * Handle /generate command 
     */
    private async handleGenerateCommand(args: any): Promise<any> {
        return {
            message: `Here's generated code from Local LLM Agent for: ${args.prompt}`,
            metadata: {
                source: 'local-llm-agent',
                command: 'generate'
            }
        };
    }
    
    /**
     * Handle /test command
     */
    private async handleTestCommand(args: any): Promise<any> {
        return {
            message: `Here are test cases from Local LLM Agent for: ${args.code}`,
            metadata: {
                source: 'local-llm-agent',
                command: 'test'
            }
        };
    }
    
    /**
     * Send message to Copilot chat programmatically
     */
    public async sendMessageToCopilotChat(message: string): Promise<boolean> {
        if (!this.isIntegrationActive || !this.copilotChatProvider) {
            this.logger.warn('Cannot send message: Copilot chat integration not active');
            return false;
        }
        
        try {
            // Check if the required API exists
            if (!this.copilotChatProvider.sendMessage) {
                this.logger.warn('Send message API not available in Copilot chat provider');
                return false;
            }
            
            // Send message to active Copilot chat
            await this.copilotChatProvider.sendMessage({
                message,
                source: 'local-llm-agent'
            });
            
            return true;
        } catch (error) {
            this.logger.error('Error sending message to Copilot chat', error);
            return false;
        }
    }
    
    /**
     * Check if Copilot chat integration is active
     */
    public isActive(): boolean {
        return this.isIntegrationActive;
    }
    
    /**
     * Toggle integration state
     */
    public toggleIntegration(): boolean {
        this.isIntegrationActive = !this.isIntegrationActive;
        this.logger.info(`Copilot chat integration ${this.isIntegrationActive ? 'enabled' : 'disabled'}`);
        return this.isIntegrationActive;
    }
}
