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
exports.ModelSelector = void 0;
const vscode = __importStar(require("vscode"));
const LLMConnectionManager_1 = require("../services/LLMConnectionManager");
class ModelSelector {
    constructor() {
        this.currentModel = '';
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
        this.statusBarItem.command = 'copilot-ppa.selectModel';
        this.updateStatusBarItem();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ModelSelector();
        }
        return this.instance;
    }
    async promptModelSelection() {
        const models = await this.getAvailableModels();
        const selected = await vscode.window.showQuickPick(models, {
            placeHolder: 'Select an LLM model',
            title: 'Model Selection'
        });
        if (selected) {
            await this.setModel(selected);
        }
    }
    async getAvailableModels() {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            const data = await response.json();
            return data.models || [];
        }
        catch {
            return ['codellama', 'llama2', 'mistral']; // Fallback defaults
        }
    }
    async setModel(modelName) {
        this.currentModel = modelName;
        await vscode.workspace.getConfiguration('copilot-ppa').update('model', modelName, true);
        this.updateStatusBarItem();
        // Restart connection with new model
        const connectionManager = LLMConnectionManager_1.LLMConnectionManager.getInstance();
        await connectionManager.reconnect();
    }
    updateStatusBarItem() {
        this.statusBarItem.text = `$(symbol-enum) Model: ${this.currentModel || 'Not Selected'}`;
        this.statusBarItem.show();
    }
    async initialize() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        this.currentModel = config.get('model', '');
        this.updateStatusBarItem();
    }
}
exports.ModelSelector = ModelSelector;
//# sourceMappingURL=ModelSelector.js.map