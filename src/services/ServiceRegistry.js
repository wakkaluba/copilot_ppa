"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistry = exports.Services = void 0;
exports.initializeServices = initializeServices;
var LLMConnectionManager_1 = require("./llm/LLMConnectionManager");
var LLMHostManager_1 = require("./llm/LLMHostManager");
var LLMSessionManager_1 = require("./llm/LLMSessionManager");
var ContextManager_1 = require("./ContextManager");
var PromptManager_1 = require("./PromptManager");
var themeManager_1 = require("./themeManager");
var displaySettingsService_1 = require("./displaySettingsService");
var connectionStatusService_1 = require("../status/connectionStatusService");
var LLMProviderManager_1 = require("./llm/services/LLMProviderManager");
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
var ServiceRegistry = /** @class */ (function () {
    function ServiceRegistry() {
        this.services = new Map();
    }
    ServiceRegistry.getInstance = function () {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    };
    ServiceRegistry.prototype.get = function (serviceType) {
        var service = this.services.get(serviceType);
        if (!service) {
            throw new Error("Service not registered: ".concat(serviceType.toString()));
        }
        return service;
    };
    ServiceRegistry.prototype.register = function (serviceType, instance) {
        this.services.set(serviceType, instance);
    };
    ServiceRegistry.prototype.dispose = function () {
        this.services.forEach(function (service) {
            if (typeof service.dispose === 'function') {
                service.dispose();
            }
        });
        this.services.clear();
    };
    return ServiceRegistry;
}());
exports.ServiceRegistry = ServiceRegistry;
function initializeServices(context) {
    var registry = ServiceRegistry.getInstance();
    // Initialize core services
    var hostManager = new LLMHostManager_1.LLMHostManager();
    var connectionManager = new LLMConnectionManager_1.LLMConnectionManager();
    var connectionStatus = new connectionStatusService_1.ConnectionStatusService(hostManager, connectionManager);
    var sessionManager = new LLMSessionManager_1.LLMSessionManager(connectionManager, hostManager);
    var promptManager = new PromptManager_1.PromptManager(context);
    var contextManager = new ContextManager_1.ContextManager(context, promptManager);
    var themeManager = new themeManager_1.ThemeManager(context);
    var displaySettings = new displaySettingsService_1.DisplaySettingsService(themeManager, context);
    // Initialize provider management
    var providerManager = new LLMProviderManager_1.LLMProviderManager(connectionManager, hostManager, connectionStatus);
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
}
