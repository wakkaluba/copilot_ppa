import { Container } from 'inversify';
import * as vscode from 'vscode';
import { IConnectionStatusService } from '../status/connectionStatusService';
import { IContextManager } from './conversation/ContextManager';
import { IDisplaySettingsService } from './displaySettingsService';
import { IExtensionManager } from './ExtensionManager';
import { IExtensionTelemetryService } from './ExtensionTelemetryService';
import { IExtensionValidationService } from './ExtensionValidationService';
import { ILLMConnectionManager } from './llm/LLMConnectionManager';
import { ILLMHostManager } from './llm/LLMHostManager';
import { ILLMSessionManager } from './llm/LLMSessionManager';
import { ILLMProviderManager } from './llm/services/LLMProviderManager';
import { IPromptManager } from './PromptManager';
import { IThemeManager } from './themeManager';

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
    ExtensionTelemetry: Symbol('ExtensionTelemetry')
};

export class ServiceRegistry implements IServiceRegistry {
    private static instance: ServiceRegistry;
    private container: Container;

    private constructor() {
        this.container = new Container();
        this.setupBindings();
    }

    public static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    private setupBindings(): void {
        this.container.bind<ILLMConnectionManager>(Services.LLMConnectionManager).to(LLMConnectionManager);
        this.container.bind<ILLMHostManager>(Services.LLMHostManager).to(LLMHostManager);
        this.container.bind<ILLMSessionManager>(Services.LLMSessionManager).to(LLMSessionManager);
        this.container.bind<ILLMProviderManager>(Services.LLMProviderManager).to(LLMProviderManager);
        this.container.bind<IConnectionStatusService>(Services.ConnectionStatus).to(ConnectionStatusService);
        this.container.bind<IContextManager>(Services.ContextManager).to(ContextManager);
        this.container.bind<IPromptManager>(Services.PromptManager).to(PromptManager);
        this.container.bind<IThemeManager>(Services.ThemeManager).to(ThemeManager);
        this.container.bind<IDisplaySettingsService>(Services.DisplaySettings).to(DisplaySettingsService);
        this.container.bind<IExtensionManager>(Services.ExtensionManager).to(ExtensionManager);
        this.container.bind<IExtensionValidationService>(Services.ExtensionValidation).to(ExtensionValidationService);
        this.container.bind<IExtensionTelemetryService>(Services.ExtensionTelemetry).to(ExtensionTelemetryService);
    }

    public get<T>(serviceType: symbol): T {
        return this.container.get<T>(serviceType);
    }

    public register<T>(serviceType: symbol, instance: T): void {
        this.container.bind<T>(serviceType).toConstantValue(instance);
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
