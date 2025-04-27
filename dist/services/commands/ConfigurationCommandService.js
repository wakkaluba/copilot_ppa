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
exports.ConfigurationCommandService = void 0;
const vscode = __importStar(require("vscode"));
class ConfigurationCommandService {
    constructor(modelService, configManager, errorHandler) {
        this.modelService = modelService;
        this.configManager = configManager;
        this.errorHandler = errorHandler;
    }
    async configureModel() {
        try {
            const config = this.configManager.getConfig();
            const providers = ['ollama', 'lmstudio', 'huggingface', 'custom'];
            const selectedProvider = await vscode.window.showQuickPick(providers, {
                placeHolder: 'Select LLM provider',
                title: 'Configure LLM Model'
            });
            if (selectedProvider) {
                await this.configManager.updateConfig('llm.provider', selectedProvider);
                if (selectedProvider === 'custom') {
                    const endpoint = await vscode.window.showInputBox({
                        prompt: 'Enter custom LLM endpoint URL',
                        value: config.llm.endpoint,
                        validateInput: this.validateEndpointUrl
                    });
                    if (endpoint) {
                        await this.configManager.updateConfig('llm.endpoint', endpoint);
                    }
                }
                await vscode.window.showInformationMessage(`Model provider updated to ${selectedProvider}`);
            }
        }
        catch (error) {
            this.errorHandler.handle('Failed to configure model', error);
        }
    }
    async clearConversation() {
        try {
            await this.modelService.dispose();
            await vscode.window.showInformationMessage('Conversation history cleared');
        }
        catch (error) {
            this.errorHandler.handle('Failed to clear conversation', error);
        }
    }
    validateEndpointUrl(url) {
        try {
            new URL(url);
            return undefined;
        }
        catch {
            return 'Please enter a valid URL';
        }
    }
}
exports.ConfigurationCommandService = ConfigurationCommandService;
//# sourceMappingURL=ConfigurationCommandService.js.map