"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebviews = setupWebviews;
var vscode = require("vscode");
var chatView_1 = require("./chatView");
var ServiceRegistry_1 = require("../services/ServiceRegistry");
function setupWebviews(context, registry) {
    // Get required services
    var llmProviderManager = registry.get(ServiceRegistry_1.Services.LLMProviderManager);
    var sessionManager = registry.get(ServiceRegistry_1.Services.LLMSessionManager);
    var contextManager = registry.get(ServiceRegistry_1.Services.ContextManager);
    var connectionStatus = registry.get(ServiceRegistry_1.Services.ConnectionStatus);
    // Register chat view provider
    var chatViewProvider = new chatView_1.ChatViewProvider(context.extensionUri, llmProviderManager, sessionManager, contextManager, connectionStatus);
    var chatView = vscode.window.registerWebviewViewProvider(chatView_1.ChatViewProvider.viewType, chatViewProvider);
    context.subscriptions.push(chatView);
}
