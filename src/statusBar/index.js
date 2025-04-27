"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStatusBar = setupStatusBar;
var ServiceRegistry_1 = require("../services/ServiceRegistry");
var connectionStatus_1 = require("./connectionStatus");
var providerStatus_1 = require("./providerStatus");
function setupStatusBar(context, registry) {
    // Get required services
    var connectionStatus = registry.get(ServiceRegistry_1.Services.ConnectionStatus);
    var providerManager = registry.get(ServiceRegistry_1.Services.LLMProviderManager);
    var themeManager = registry.get(ServiceRegistry_1.Services.ThemeManager);
    var displaySettings = registry.get(ServiceRegistry_1.Services.DisplaySettings);
    // Create and register status bar items
    var connectionStatusBar = new connectionStatus_1.ConnectionStatusBar(connectionStatus, themeManager, displaySettings);
    var providerStatusBar = new providerStatus_1.ProviderStatusBar(providerManager, themeManager, displaySettings);
    context.subscriptions.push(connectionStatusBar, providerStatusBar);
}
