"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStatusBar = void 0;
const ServiceRegistry_1 = require("../services/ServiceRegistry");
const connectionStatus_1 = require("./connectionStatus");
const providerStatus_1 = require("./providerStatus");
function setupStatusBar(context, registry) {
    // Get required services
    const connectionStatus = registry.get(ServiceRegistry_1.Services.ConnectionStatus);
    const providerManager = registry.get(ServiceRegistry_1.Services.LLMProviderManager);
    const themeManager = registry.get(ServiceRegistry_1.Services.ThemeManager);
    const displaySettings = registry.get(ServiceRegistry_1.Services.DisplaySettings);
    // Create and register status bar items
    const connectionStatusBar = new connectionStatus_1.ConnectionStatusBar(connectionStatus, themeManager, displaySettings);
    const providerStatusBar = new providerStatus_1.ProviderStatusBar(providerManager, themeManager, displaySettings);
    context.subscriptions.push(connectionStatusBar, providerStatusBar);
}
exports.setupStatusBar = setupStatusBar;
//# sourceMappingURL=index.js.map