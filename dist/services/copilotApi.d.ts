export declare class CopilotApiService {
    private static instance;
    private readonly logger;
    private readonly connectionService;
    private readonly chatService;
    private readonly suggestionService;
    private readonly dataTransformer;
    private constructor();
    static getInstance(): CopilotApiService;
    initialize(): Promise<boolean>;
    isConnected(): boolean;
    sendChatRequest(prompt: string, context?: any): Promise<string>;
    getCodeSuggestions(code: string, language: string): Promise<string[]>;
    registerResponseHandler(callback: (response: any) => void): void;
    transformData(data: any, targetFormat: 'copilot' | 'localLLM'): any;
}
