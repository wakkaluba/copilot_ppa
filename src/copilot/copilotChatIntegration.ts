import * as vscode from 'vscode';
import { CopilotApiService } from '../services/copilotApi';
import { Logger } from '../utils/logger';
import { CopilotChatInitializationService } from './services/CopilotChatInitializationService';
import { CopilotChatParticipantService } from './services/CopilotChatParticipantService';
import { CopilotChatMessageHandlerService } from './services/CopilotChatMessageHandlerService';
import { CopilotChatCommandHandlerService } from './services/CopilotChatCommandHandlerService';

export class CopilotChatIntegration {
    private static instance: CopilotChatIntegration;
    private readonly logger: Logger;
    private readonly copilotApiService: CopilotApiService;
    private readonly initService: CopilotChatInitializationService;
    private readonly participantService: CopilotChatParticipantService;
    private readonly messageHandlerService: CopilotChatMessageHandlerService;
    private readonly commandHandlerService: CopilotChatCommandHandlerService;
    
    private constructor() {
        this.logger = Logger.getInstance();
        this.copilotApiService = CopilotApiService.getInstance();
        this.initService = new CopilotChatInitializationService(this.logger);
        this.participantService = new CopilotChatParticipantService(this.logger);
        this.messageHandlerService = new CopilotChatMessageHandlerService(this.logger);
        this.commandHandlerService = new CopilotChatCommandHandlerService(this.logger);
    }
    
    public static getInstance(): CopilotChatIntegration {
        if (!CopilotChatIntegration.instance) {
            CopilotChatIntegration.instance = new CopilotChatIntegration();
        }
        return CopilotChatIntegration.instance;
    }
    
    public async initialize(): Promise<boolean> {
        try {
            const isConnected = await this.copilotApiService.initialize();
            if (!isConnected) {
                this.logger.warn('Failed to connect to Copilot API. Integration not available.');
                return false;
            }
            
            const chatProvider = await this.initService.initializeCopilotExtension();
            if (!chatProvider) {
                return false;
            }
            
            this.participantService.registerChatParticipant(chatProvider, {
                handleMessage: this.handleChatMessage.bind(this),
                handleCommandIntent: this.handleCommandIntent.bind(this)
            });
            
            this.logger.info('Successfully integrated with GitHub Copilot chat');
            return true;
        } catch (error) {
            this.logger.error('Error initializing Copilot chat integration', error);
            return false;
        }
    }
    
    private async handleChatMessage(request: any): Promise<any> {
        try {
            this.logger.info(`Received chat message: ${request.message}`);
            return await this.messageHandlerService.handleMessage(request);
        } catch (error) {
            this.logger.error('Error handling chat message', error);
            return this.messageHandlerService.createErrorResponse(error);
        }
    }
    
    private async handleCommandIntent(command: string, args: any): Promise<any> {
        this.logger.info(`Received command intent: ${command}`);
        return this.commandHandlerService.handleCommand(command, args);
    }
    
    public async sendMessageToCopilotChat(message: string): Promise<boolean> {
        if (!this.initService.isIntegrationActive()) {
            this.logger.warn('Cannot send message: Copilot chat integration not active');
            return false;
        }
        
        try {
            return await this.messageHandlerService.sendMessage(message);
        } catch (error) {
            this.logger.error('Error sending message to Copilot chat', error);
            return false;
        }
    }
    
    public isActive(): boolean {
        return this.initService.isIntegrationActive();
    }
    
    public toggleIntegration(): boolean {
        return this.initService.toggleIntegration();
    }
}
