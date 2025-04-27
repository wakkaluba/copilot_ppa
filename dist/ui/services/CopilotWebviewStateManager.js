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
exports.CopilotWebviewStateManager = void 0;
const vscode = __importStar(require("vscode"));
class CopilotWebviewStateManager {
    constructor() {
        this.state = {
            isLocalLLMActive: false,
            isCopilotConnected: false,
            messages: []
        };
        this._onStateChanged = new vscode.EventEmitter();
        this.onStateChanged = this._onStateChanged.event;
    }
    getState() {
        return { ...this.state };
    }
    async toggleLLMMode() {
        this.state.isLocalLLMActive = !this.state.isLocalLLMActive;
        this._onStateChanged.fire();
    }
    updateConnectionState(isConnected) {
        this.state.isCopilotConnected = isConnected;
        this._onStateChanged.fire();
    }
    addMessage(role, content) {
        this.state.messages.push({ role, content });
        this._onStateChanged.fire();
    }
    clearMessages() {
        this.state.messages = [];
        this._onStateChanged.fire();
    }
    dispose() {
        this._onStateChanged.dispose();
    }
}
exports.CopilotWebviewStateManager = CopilotWebviewStateManager;
//# sourceMappingURL=CopilotWebviewStateManager.js.map