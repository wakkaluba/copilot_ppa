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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ServiceRegistry_1 = require("./services/ServiceRegistry");
const commands_1 = require("./commands");
const webview_1 = require("./webview");
const statusBar_1 = require("./statusBar");
async function activate(context) {
    // Initialize service registry
    (0, ServiceRegistry_1.initializeServices)(context);
    const registry = ServiceRegistry_1.ServiceRegistry.getInstance();
    // Setup core extension components
    (0, commands_1.registerCommands)(context, registry);
    (0, webview_1.setupWebviews)(context, registry);
    (0, statusBar_1.setupStatusBar)(context, registry);
    // Get LLM services
    const connectionManager = registry.get(ServiceRegistry_1.Services.LLMConnectionManager);
    const hostManager = registry.get(ServiceRegistry_1.Services.LLMHostManager);
    const sessionManager = registry.get(ServiceRegistry_1.Services.LLMSessionManager);
    // Auto-connect if configured
    const config = vscode.workspace.getConfiguration('copilot-ppa');
    if (config.get('autoConnect', false)) {
        connectionManager.connectToLLM().catch(error => {
            console.error('Auto-connect failed:', error);
        });
    }
    return {
        serviceRegistry: registry
    };
}
function deactivate() {
    const registry = ServiceRegistry_1.ServiceRegistry.getInstance();
    registry.dispose();
}
//# sourceMappingURL=extension.js.map