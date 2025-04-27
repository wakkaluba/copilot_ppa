"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebviews = void 0;
const vscode = __importStar(require("vscode"));
const chatView_1 = require("./chatView");
const ServiceRegistry_1 = require("../services/ServiceRegistry");
function setupWebviews(context, registry) {
    // Get required services
    const llmProviderManager = registry.get(ServiceRegistry_1.Services.LLMProviderManager);
    const sessionManager = registry.get(ServiceRegistry_1.Services.LLMSessionManager);
    const contextManager = registry.get(ServiceRegistry_1.Services.ContextManager);
    const connectionStatus = registry.get(ServiceRegistry_1.Services.ConnectionStatus);
    // Register chat view provider
    const chatViewProvider = new chatView_1.ChatViewProvider(context.extensionUri, llmProviderManager, sessionManager, contextManager, connectionStatus);
    const chatView = vscode.window.registerWebviewViewProvider(chatView_1.ChatViewProvider.viewType, chatViewProvider);
    context.subscriptions.push(chatView);
}
exports.setupWebviews = setupWebviews;
//# sourceMappingURL=index.js.map