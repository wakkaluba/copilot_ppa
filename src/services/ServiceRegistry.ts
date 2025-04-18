import * as vscode from 'vscode';
import { LLMProvider } from '../llm/llm-provider';
import { LLMConnectionManager } from './llm/LLMConnectionManager';
import { LLMHostManager } from './llm/LLMHostManager';
import { LLMSessionManager } from './llm/LLMSessionManager';
import { ContextManager } from './conversation/ContextManager';
import { PromptManager } from './PromptManager';
import { ThemeManager } from './themeManager';
import { DisplaySettingsService } from './displaySettingsService';

export interface IServiceRegistry {
    get<T>(serviceType: symbol): T;
    register<T>(serviceType: symbol, instance: T): void;
}

export const Services = {
    LLMProvider: Symbol('LLMProvider'),
    LLMConnectionManager: Symbol('LLMConnectionManager'),
    LLMHostManager: Symbol('LLMHostManager'),
    LLMSessionManager: Symbol('LLMSessionManager'),
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

    dispose(): void {
        this.services.forEach(service => {
            if (typeof service.dispose === 'function') {
                service.dispose();
            }
        });
        this.services.clear();
    }
}

export function initializeServices(context: vscode.ExtensionContext): void {
    const registry = ServiceRegistry.getInstance();

    // Initialize core services
    const hostManager = new LLMHostManager();
    const connectionManager = new LLMConnectionManager();
    const sessionManager = new LLMSessionManager(connectionManager, hostManager);
    const promptManager = new PromptManager();
    const contextManager = new ContextManager(context);
    const themeManager = new ThemeManager(context);
    const displaySettings = new DisplaySettingsService();

    // Register services
    registry.register(Services.LLMHostManager, hostManager);
    registry.register(Services.LLMConnectionManager, connectionManager);
    registry.register(Services.LLMSessionManager, sessionManager);
    registry.register(Services.ContextManager, contextManager);
    registry.register(Services.PromptManager, promptManager);
    registry.register(Services.ThemeManager, themeManager);
    registry.register(Services.DisplaySettings, displaySettings);
}