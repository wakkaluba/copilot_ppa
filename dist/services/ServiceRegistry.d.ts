import * as vscode from 'vscode';
export interface IServiceRegistry {
    get<T>(serviceType: symbol): T;
    register<T>(serviceType: symbol, instance: T): void;
}
export declare const Services: {
    LLMProvider: symbol;
    LLMConnectionManager: symbol;
    LLMHostManager: symbol;
    LLMSessionManager: symbol;
    LLMProviderManager: symbol;
    ConnectionStatus: symbol;
    ContextManager: symbol;
    PromptManager: symbol;
    ThemeManager: symbol;
    DisplaySettings: symbol;
};
export declare class ServiceRegistry implements IServiceRegistry {
    private static instance;
    private services;
    private constructor();
    static getInstance(): ServiceRegistry;
    get<T>(serviceType: symbol): T;
    register<T>(serviceType: symbol, instance: T): void;
    initialize(): Promise<void>;
    dispose(): void;
}
export declare function initializeServices(context: vscode.ExtensionContext): Promise<void>;
