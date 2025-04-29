import * as vscode from 'vscode';
import { LLMProvider } from '../llm/types';
import { LLMConnectionManager } from './llm/LLMConnectionManager';
import { LLMHostManager } from './llm/LLMHostManager';
import { LLMSessionManager } from './llm/LLMSessionManager';
import { ContextManager } from './conversation/ContextManager';
import { PromptManager } from './PromptManager';
import { ThemeManager } from './themeManager';
import { DisplaySettingsService } from './displaySettingsService';
import { ConnectionStatusService } from '../status/connectionStatusService';
import { LLMProviderManager } from './llm/services/LLMProviderManager';

export interface IServiceRegistry {
    get<T>(serviceType: symbol): T;
    register<T>(serviceType: symbol, instance: T): void;
}

export const Services = {
    LLMProvider: Symbol('LLMProvider'),
    LLMConnectionManager: Symbol('LLMConnectionManager'),
    LLMHostManager: Symbol('LLMHostManager'),
    LLMSessionManager: Symbol('LLMSessionManager'),
    LLMProviderManager: Symbol('LLMProviderManager'),
    ConnectionStatus: Symbol('ConnectionStatus'),
    ContextManager: Symbol('ContextManager'),
    PromptManager: Symbol('PromptManager'),
    ThemeManager: Symbol('ThemeManager'),
    DisplaySettings: Symbol('DisplaySettings')
};

export class ServiceRegistry implements IServiceRegistry {
    private static instance: ServiceRegistry;
    private services: Map<symbol, any> = new Map();

    private constructor() {}

    static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    get<T>(serviceType: symbol): T {
        const service = this.services.get(serviceType);
        if (!service) {
            throw new Error(`Service not registered: ${serviceType.toString()}`);
        }
        return service as T;
    }

    register<T>(serviceType: symbol, instance: T): void {
        this.services.set(serviceType, instance);
    }

    async initialize(): Promise<void> {
        // Initialize all services that have an initialize method
        const initPromises = Array.from(this.services.values())
            .filter(service => service && typeof service.initialize === 'function')
            .map(service => service.initialize());
            
        await Promise.all(initPromises);
    }

    dispose(): void {
        this.services.forEach(service => {
            if (typeof service.dispose === 'function') {
                service.dispose();
            }
        });
        this.services.clear();
    }
}

export async function initializeServices(context: vscode.ExtensionContext): Promise<void> {
    const registry = ServiceRegistry.getInstance();

    // Initialize core services
    const hostManager = new LLMHostManager();
    const connectionManager = new LLMConnectionManager();
    const connectionStatus = new ConnectionStatusService(hostManager, connectionManager);
    const sessionManager = new LLMSessionManager(connectionManager, hostManager);
    const promptManager = new PromptManager(context);
    
    // Use the singleton pattern for ContextManager
    const contextManager = ContextManager.getInstance(context);
    
    const themeManager = new ThemeManager(context);
    const displaySettings = new DisplaySettingsService(themeManager, context);
    
    // Initialize provider management
    const providerManager = new LLMProviderManager(
        connectionManager,
        hostManager,
        connectionStatus
    );

    // Register all services
    registry.register(Services.LLMHostManager, hostManager);
    registry.register(Services.LLMConnectionManager, connectionManager);
    registry.register(Services.LLMSessionManager, sessionManager);
    registry.register(Services.ConnectionStatus, connectionStatus);
    registry.register(Services.LLMProviderManager, providerManager);
    registry.register(Services.ContextManager, contextManager);
    registry.register(Services.PromptManager, promptManager);
    registry.register(Services.ThemeManager, themeManager);
    registry.register(Services.DisplaySettings, displaySettings);
    
    // Initialize all registered services
    await registry.initialize();
}