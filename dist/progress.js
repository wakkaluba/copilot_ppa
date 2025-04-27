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
exports.ProgressHandler = void 0;
const vscode = __importStar(require("vscode"));
class ProgressHandler {
    constructor() { }
    static getInstance() {
        if (!ProgressHandler.instance) {
            ProgressHandler.instance = new ProgressHandler();
        }
        return ProgressHandler.instance;
    }
    async showProgress(title, totalSteps) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title,
            cancellable: true
        }, async (progress, token) => {
            this.currentProgress = progress;
            this.currentToken = token;
            token.onCancellationRequested(() => {
                this.currentProgress = undefined;
                this.currentToken = undefined;
            });
            progress.report({ increment: 0 });
        });
    }
    updateProgress(increment, message) {
        if (this.currentProgress && !this.currentToken?.isCancellationRequested) {
            this.currentProgress.report({ increment, message });
        }
    }
}
exports.ProgressHandler = ProgressHandler;
//# sourceMappingURL=progress.js.map