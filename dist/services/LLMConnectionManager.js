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
exports.LLMConnectionManager = void 0;
const vscode = __importStar(require("vscode"));
const LLMHostManager_1 = require("./LLMHostManager");
class LLMConnectionManager {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 3;
        this.connectionTimeout = null;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.updateStatus('disconnected');
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LLMConnectionManager();
        }
        return this.instance;
    }
    async connectToLLM() {
        try {
            this.updateStatus('connecting');
            const hostManager = LLMHostManager_1.LLMHostManager.getInstance();
            // Ensure host is running
            if (!hostManager.isRunning()) {
                await hostManager.startHost();
            }
            // Try to establish connection
            const success = await this.testConnection();
            if (success) {
                this.updateStatus('connected');
                this.retryCount = 0;
                return true;
            }
            return await this.handleConnectionFailure();
        }
        catch (error) {
            console.error('Connection error:', error);
            return await this.handleConnectionFailure();
        }
    }
    async handleConnectionFailure() {
        this.updateStatus('error');
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.connectionTimeout = setTimeout(() => {
                this.connectToLLM();
            }, 5000);
            return false;
        }
        return false;
    }
    async testConnection() {
        try {
            // Simple ping test to LLM
            const response = await fetch('http://localhost:11434/api/health');
            return response.ok;
        }
        catch {
            return false;
        }
    }
    updateStatus(status) {
        const icons = {
            connected: '$(link)',
            connecting: '$(sync~spin)',
            disconnected: '$(unlink)',
            error: '$(warning)'
        };
        this.statusBarItem.text = `${icons[status]} LLM: ${status}`;
        this.statusBarItem.show();
    }
    dispose() {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
        }
        this.statusBarItem.dispose();
    }
}
exports.LLMConnectionManager = LLMConnectionManager;
//# sourceMappingURL=LLMConnectionManager.js.map