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
exports.registerCodeFormatCommands = registerCodeFormatCommands;
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
//# sourceMappingURL=codeFormatCommands.js.map