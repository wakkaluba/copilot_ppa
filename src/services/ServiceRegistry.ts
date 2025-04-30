import { Container } from 'inversify';
import * as vscode from 'vscode';
import { ConnectionStatusService } from '../status/connectionStatusService';
import { ContextManager } from './conversation/ContextManager';
import { DisplaySettingsService } from './displaySettingsService';
import { ExtensionManager } from './ExtensionManager';
import { ExtensionTelemetryService } from './ExtensionTelemetryService';
import { ExtensionValidationService } from './ExtensionValidationService';
import { LLMConnectionManager } from './llm/LLMConnectionManager';
import { LLMHostManager } from './llm/LLMHostManager';
import { LLMSessionManager } from './llm/LLMSessionManager';
import { LLMProviderManager } from './llm/services/LLMProviderManager';
import { PromptManager } from './PromptManager';
import { ThemeManager } from './themeManager';

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
    DisplaySettings: Symbol('DisplaySettings'),
    ExtensionAccess: Symbol('ExtensionAccess'),
    ExtensionConfig: Symbol('ExtensionConfig'),
    ExtensionInstallation: Symbol('ExtensionInstallation'),
    ExtensionManager: Symbol('ExtensionManager'),
    ExtensionValidation: Symbol('ExtensionValidation'),
    ExtensionTelemetry: Symbol('ExtensionTelemetry'),
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

export function initializeServices(context: vscode.ExtensionContext): void {
    const registry = ServiceRegistry.getInstance();
    const container = new Container();

    // Bind extension context
    container.bind('ExtensionContext').toConstantValue(context);

    // Initialize extension management services
    const validationService = new ExtensionValidationService();
    const telemetryService = new ExtensionTelemetryService(context);
    const extensionManager = new ExtensionManager(context);

    // Initialize core services
    const hostManager = new LLMHostManager();
    const connectionManager = new LLMConnectionManager();
    const sessionManager = new LLMSessionManager(connectionManager, hostManager);
    const connectionStatus = new ConnectionStatusService();
    const contextManager = ContextManager.getInstance(context);
    const themeManager = new ThemeManager(context);
    const displaySettings = new DisplaySettingsService(themeManager, context);
    const promptManager = new PromptManager(context);

    // Initialize provider management
    const providerManager = new LLMProviderManager(connectionManager);

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
    registry.register(Services.ExtensionValidation, validationService);
    registry.register(Services.ExtensionTelemetry, telemetryService);
    registry.register(Services.ExtensionManager, extensionManager);

    // Initialize all registered services
    registry.initialize().catch(error => {
        console.error('Failed to initialize services:', error);
    });
}
