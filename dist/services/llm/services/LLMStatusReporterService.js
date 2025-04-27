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
exports.StatusReporterService = void 0;
const vscode = __importStar(require("vscode"));
class StatusReporterService {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    }
    updateStatusBar(state, providerName) {
        const displayName = providerName || 'LLM';
        switch (state) {
            case 'connected':
                this.statusBarItem.text = `$(check) ${displayName}`;
                this.statusBarItem.show();
                break;
            case 'connecting':
                this.statusBarItem.text = `$(sync~spin) ${displayName}`;
                this.statusBarItem.show();
                break;
            case 'disconnected':
                this.statusBarItem.text = `$(circle-slash) ${displayName}`;
                this.statusBarItem.show();
                break;
            case 'error':
                this.statusBarItem.text = `$(error) ${displayName}`;
                this.statusBarItem.show();
                break;
            default:
                this.statusBarItem.hide();
        }
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusReporterService = StatusReporterService;
//# sourceMappingURL=LLMStatusReporterService.js.map