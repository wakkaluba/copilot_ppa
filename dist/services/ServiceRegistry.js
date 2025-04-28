"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistry = exports.Services = void 0;
exports.initializeServices = initializeServices;
const LLMConnectionManager_1 = require("./llm/LLMConnectionManager");
const LLMHostManager_1 = require("./llm/LLMHostManager");
const LLMSessionManager_1 = require("./llm/LLMSessionManager");
const ContextManager_1 = require("./ContextManager");
const PromptManager_1 = require("./PromptManager");
const themeManager_1 = require("./themeManager");
const displaySettingsService_1 = require("./displaySettingsService");
const connectionStatusService_1 = require("../status/connectionStatusService");
const LLMProviderManager_1 = require("./llm/services/LLMProviderManager");
exports.Services = {
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
class ServiceRegistry {
    constructor() {
        this.services = new Map();
    }
    static getInstance() {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }
    get(serviceType) {
        const service = this.services.get(serviceType);
        if (!service) {
            throw new Error(`Service not registered: ${serviceType.toString()}`);
        }
        return service;
    }
    register(serviceType, instance) {
        this.services.set(serviceType, instance);
    }
    async initialize() {
        // Initialize all services that have an initialize method
        const initPromises = Array.from(this.services.values())
            .filter(service => service && typeof service.initialize === 'function')
            .map(service => service.initialize());
        await Promise.all(initPromises);
    }
    dispose() {
        this.services.forEach(service => {
            if (typeof service.dispose === 'function') {
                service.dispose();
            }
        });
        this.services.clear();
    }
}
exports.ServiceRegistry = ServiceRegistry;
async function initializeServices(context) {
    const registry = ServiceRegistry.getInstance();
    // Initialize core services
    const hostManager = new LLMHostManager_1.LLMHostManager();
    const connectionManager = new LLMConnectionManager_1.LLMConnectionManager();
    const connectionStatus = new connectionStatusService_1.ConnectionStatusService(hostManager, connectionManager);
    const sessionManager = new LLMSessionManager_1.LLMSessionManager(connectionManager, hostManager);
    const promptManager = new PromptManager_1.PromptManager(context);
    const contextManager = new ContextManager_1.ContextManager(context, promptManager);
    const themeManager = new themeManager_1.ThemeManager(context);
    const displaySettings = new displaySettingsService_1.DisplaySettingsService(themeManager, context);
    // Initialize provider management
    const providerManager = new LLMProviderManager_1.LLMProviderManager(connectionManager, hostManager, connectionStatus);
    // Register all services
    registry.register(exports.Services.LLMHostManager, hostManager);
    registry.register(exports.Services.LLMConnectionManager, connectionManager);
    registry.register(exports.Services.LLMSessionManager, sessionManager);
    registry.register(exports.Services.ConnectionStatus, connectionStatus);
    registry.register(exports.Services.LLMProviderManager, providerManager);
    registry.register(exports.Services.ContextManager, contextManager);
    registry.register(exports.Services.PromptManager, promptManager);
    registry.register(exports.Services.ThemeManager, themeManager);
    registry.register(exports.Services.DisplaySettings, displaySettings);
    // Initialize all registered services
    await registry.initialize();
}
//# sourceMappingURL=ServiceRegistry.js.map