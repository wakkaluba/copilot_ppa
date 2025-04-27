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
exports.ErrorHandler = void 0;
const vscode = __importStar(require("vscode"));
class ErrorHandler {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Copilot PPA');
    }
    handle(message, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.outputChannel.appendLine(`${message}: ${errorMessage}`);
        this.outputChannel.appendLine(`Stack: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
    }
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map