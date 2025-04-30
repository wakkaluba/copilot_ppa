export declare class CopilotChatIntegration {
    private static instance;
    private readonly logger;
    private readonly copilotApiService;
    private readonly initService;
    private readonly participantService;
    private readonly messageHandlerService;
    private readonly commandHandlerService;
    private constructor();
    static getInstance(): CopilotChatIntegration;
    initialize(): Promise<boolean>;
    private handleChatMessage;
    private handleCommandIntent;
    sendMessageToCopilotChat(message: string): Promise<boolean>;
    isActive(): boolean;
    toggleIntegration(): boolean;
}
