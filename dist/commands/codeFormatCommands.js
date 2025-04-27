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
exports.registerCodeFormatCommands = void 0;
const vscode = __importStar(require("vscode"));
const codeFormatService_1 = require("../services/codeFormatService");
function registerCodeFormatCommands(context) {
    const codeFormatService = new codeFormatService_1.CodeFormatService();
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.formatCode', async () => {
        return await codeFormatService.formatCode();
    }), vscode.commands.registerCommand('localLLMAgent.optimizeImports', async () => {
        return await codeFormatService.optimizeImports();
    }), vscode.commands.registerCommand('localLLMAgent.applyCodeStyle', async () => {
        return await codeFormatService.applyCodeStyle();
    }), vscode.commands.registerCommand('localLLMAgent.optimizeCode', async () => {
        return await codeFormatService.optimizeCode();
    }));
}
exports.registerCodeFormatCommands = registerCodeFormatCommands;
//# sourceMappingURL=codeFormatCommands.js.map