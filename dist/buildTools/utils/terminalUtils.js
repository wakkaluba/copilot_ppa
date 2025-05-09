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
exports.run_in_terminal = run_in_terminal;
const vscode = __importStar(require("vscode"));
async function run_in_terminal(options) {
    const terminal = vscode.window.createTerminal('Build Script Optimizer');
    try {
        terminal.show();
        terminal.sendText(options.command);
        if (!options.isBackground) {
            // For non-background commands, we want to dispose the terminal after completion
            const disposable = vscode.window.onDidCloseTerminal(closedTerminal => {
                if (closedTerminal === terminal) {
                    disposable.dispose();
                    if (closedTerminal.exitStatus && closedTerminal.exitStatus.code !== 0) {
                        throw new Error(`Command failed with exit code ${closedTerminal.exitStatus.code}`);
                    }
                }
            });
        }
    }
    catch (error) {
        terminal.dispose();
        throw error;
    }
}
//# sourceMappingURL=terminalUtils.js.map