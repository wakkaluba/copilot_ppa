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
exports.LLMSessionManager = void 0;
/**
 * LLM Session Manager - Handles sessions for communicating with LLM services
 */
const vscode = __importStar(require("vscode"));
const LLMSessionConfigService_1 = require("./services/LLMSessionConfigService");
const LLMRequestExecutionService_1 = require("./services/LLMRequestExecutionService");
const LLMSessionTrackingService_1 = require("./services/LLMSessionTrackingService");
const types_1 = require("./types");
/**
 * Manager for LLM sessions - handles session lifecycle, configuration, and tracking
 */
class LLMSessionManager {
    static instance;
    disposables = [];
    configService;
    trackingService;
    requestService;
    connectionManager;
    constructor(connectionManager) {
        this.connectionManager = connectionManager;
        this.configService = new LLMSessionConfigService_1.LLMSessionConfigService();
        this.requestService = new LLMRequestExecutionService_1.LLMRequestExecutionService();
        this.trackingService = new LLMSessionTrackingService_1.LLMSessionTrackingService();
        this.setupEventListeners();
    }
    static getInstance(connectionManager) {
        if (!LLMSessionManager.instance) {
            LLMSessionManager.instance = new LLMSessionManager(connectionManager);
        }
        return LLMSessionManager.instance;
    }
    setupEventListeners() {
        // Listen for configuration changes
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.llm')) {
                this.configService.reloadConfig();
            }
        }));
        // Listen for connection events
        this.connectionManager.on(types_1.ConnectionEvent.Disconnected, () => {
            this.trackingService.stopAllSessions();
        });
        this.connectionManager.on(types_1.ConnectionEvent.Error, (error) => {
            this.trackingService.handleError(error);
        });
    }
    /**
     * Execute an LLM request within a session
     */
    async executeRequest(request, sessionConfig, sessionId = crypto.randomUUID()) {
        await this.connectionManager.connectToLLM();
        const config = this.configService.mergeConfig(sessionConfig);
        const session = this.trackingService.startSession(sessionId, config);
        try {
            const response = await this.requestService.execute(request, config);
            this.trackingService.recordSuccess(sessionId, response);
            return response;
        }
        catch (error) {
            this.trackingService.recordError(sessionId, error);
            throw error;
        }
        finally {
            this.trackingService.endSession(sessionId);
        }
    }
    /**
     * Abort an ongoing LLM session
     */
    abortSession(sessionId) {
        const aborted = this.requestService.abortRequest(sessionId);
        if (aborted) {
            this.trackingService.endSession(sessionId, 'aborted');
        }
        return aborted;
    }
    /**
     * Get current session statistics
     */
    getSessionStats() {
        return this.trackingService.getStats();
    }
    /**
     * Get current session configuration
     */
    getSessionConfig() {
        return this.configService.getCurrentConfig();
    }
    dispose() {
        this.trackingService.dispose();
        this.requestService.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
exports.LLMSessionManager = LLMSessionManager;
//# sourceMappingURL=LLMSessionManager.js.map