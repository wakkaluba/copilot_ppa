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
exports.LLMAutoConnector = void 0;
const vscode = __importStar(require("vscode"));
const LLMHostManager_1 = require("./LLMHostManager");
class LLMAutoConnector {
    constructor() {
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxAttempts = 5;
        this.retryDelay = 2000;
    }
    static getInstance() {
        if (!LLMAutoConnector.instance) {
            LLMAutoConnector.instance = new LLMAutoConnector();
        }
        return LLMAutoConnector.instance;
    }
    async tryConnect() {
        if (this.isConnected) {
            return true;
        }
        const hostManager = LLMHostManager_1.LLMHostManager.getInstance();
        if (!hostManager.isHostRunning()) {
            await hostManager.startHost();
            // Wait for host to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        while (this.connectionAttempts < this.maxAttempts) {
            try {
                const response = await fetch('http://localhost:11434/api/health');
                if (response.ok) {
                    this.isConnected = true;
                    vscode.window.showInformationMessage('Successfully connected to LLM host');
                    return true;
                }
            }
            catch (error) {
                this.connectionAttempts++;
                if (this.connectionAttempts >= this.maxAttempts) {
                    vscode.window.showErrorMessage('Failed to connect to LLM host after multiple attempts');
                    return false;
                }
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
        return false;
    }
    async disconnect() {
        this.isConnected = false;
        this.connectionAttempts = 0;
    }
    isLLMConnected() {
        return this.isConnected;
    }
}
exports.LLMAutoConnector = LLMAutoConnector;
//# sourceMappingURL=LLMAutoConnector.js.map