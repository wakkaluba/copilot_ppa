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
exports.LLMFactory = void 0;
/**
 * LLM Factory - Creates and provides access to LLM services
 */
const vscode = __importStar(require("vscode"));
const LLMConnectionManager_1 = require("./LLMConnectionManager");
const LLMHostManager_1 = require("./LLMHostManager");
const LLMSessionManager_1 = require("./LLMSessionManager");
const LLMCommandHandlerService_1 = require("./services/LLMCommandHandlerService");
const LLMProviderCreationService_1 = require("./services/LLMProviderCreationService");
const LLMInitializationService_1 = require("./services/LLMInitializationService");
/**
 * Factory for accessing LLM services
 */
class LLMFactory {
    /**
     * Creates a new LLM factory
     */
    constructor(options = {}) {
        this.disposables = [];
        this.connectionManager = LLMConnectionManager_1.LLMConnectionManager.getInstance(options);
        this.hostManager = LLMHostManager_1.LLMHostManager.getInstance();
        this.sessionManager = LLMSessionManager_1.LLMSessionManager.getInstance();
        this.commandHandler = new LLMCommandHandlerService_1.LLMCommandHandlerService(this.connectionManager, this.hostManager);
        this.providerCreator = new LLMProviderCreationService_1.LLMProviderCreationService();
        this.initService = new LLMInitializationService_1.LLMInitializationService(this.connectionManager);
        this.registerCommands();
    }
    /**
     * Gets the singleton instance of the LLM factory
     */
    static getInstance(options = {}) {
        if (!this.instance) {
            this.instance = new LLMFactory(options);
        }
        return this.instance;
    }
    /**
     * Gets the connection manager
     */
    getConnectionManager() {
        return this.connectionManager;
    }
    /**
     * Gets the host manager
     */
    getHostManager() {
        return this.hostManager;
    }
    /**
     * Gets the session manager
     */
    getSessionManager() {
        return this.sessionManager;
    }
    /**
     * Creates a new stream provider
     */
    createStreamProvider(endpoint) {
        return this.providerCreator.createStreamProvider(endpoint);
    }
    /**
     * Initializes the LLM services
     */
    async initialize() {
        await this.initService.initialize();
    }
    /**
     * Register commands related to LLM services
     */
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.llm.connect', () => this.commandHandler.handleConnect()), vscode.commands.registerCommand('copilot-ppa.llm.disconnect', () => this.commandHandler.handleDisconnect()), vscode.commands.registerCommand('copilot-ppa.llm.restart', () => this.commandHandler.handleRestart()));
    }
    /**
     * Disposes resources
     */
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.commandHandler.dispose();
    }
}
exports.LLMFactory = LLMFactory;
//# sourceMappingURL=LLMFactory.js.map