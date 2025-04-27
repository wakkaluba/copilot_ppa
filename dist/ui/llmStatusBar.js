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
exports.LLMStatusBar = void 0;
const vscode = __importStar(require("vscode"));
class LLMStatusBar {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.show();
    }
    updateStatus(connected, modelName) {
        if (connected) {
            this.statusBarItem.text = `$(check) LLM: ${modelName || 'Connected'}`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.successBackground');
        }
        else {
            this.statusBarItem.text = '$(error) LLM: Disconnected';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        }
        this.statusBarItem.tooltip = `LLM Connection Status${modelName ? ': ' + modelName : ''}`;
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.LLMStatusBar = LLMStatusBar;
//# sourceMappingURL=llmStatusBar.js.map