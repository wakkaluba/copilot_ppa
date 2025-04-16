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
exports.Config = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Configuration helper for accessing VS Code settings
 */
class Config {
    /**
     * Get the Ollama API endpoint URL
     */
    static get ollamaEndpoint() {
        const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
        return config.get('ollamaEndpoint', 'http://localhost:11434');
    }
    /**
     * Get the Ollama API URL (with /api suffix)
     */
    static get ollamaApiUrl() {
        return `${this.ollamaEndpoint}/api`;
    }
    /**
     * Get the default Ollama model name
     */
    static get ollamaModel() {
        const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
        return config.get('ollamaModel', 'llama2');
    }
    /**
     * Get the LM Studio API endpoint URL
     */
    static get lmStudioEndpoint() {
        const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
        return config.get('lmStudioEndpoint', 'http://localhost:1234');
    }
    /**
     * Get the LM Studio API URL (with /v1 suffix)
     */
    static get lmStudioApiUrl() {
        return `${this.lmStudioEndpoint}/v1`;
    }
    /**
     * Get the default provider (ollama or lmstudio)
     */
    static get defaultProvider() {
        const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
        return config.get('defaultProvider', 'ollama');
    }
    /**
     * Check if caching is enabled
     */
    static get cacheResponses() {
        const config = vscode.workspace.getConfiguration('vscodeLocalLLMAgent');
        return config.get('cacheResponses', true);
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map