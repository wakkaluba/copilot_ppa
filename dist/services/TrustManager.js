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
exports.TrustManager = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
class TrustManager {
    static instance;
    logger;
    constructor() {
        this.logger = logger_1.Logger.getInstance();
    }
    static getInstance() {
        if (!TrustManager.instance) {
            TrustManager.instance = new TrustManager();
        }
        return TrustManager.instance;
    }
    isWorkspaceTrusted() {
        // In recent versions of VS Code, workspace trust is available as a property
        if ('isTrusted' in vscode.workspace) {
            return vscode.workspace.isTrusted;
        }
        // For older versions or environments where trust isn't supported
        return true;
    }
    async requestWorkspaceTrust() {
        try {
            // If the workspace is already trusted, return true
            if (this.isWorkspaceTrusted()) {
                return true;
            }
            // If the workspace trust API is available, use it
            // Check if the method exists on the workspace object in a type-safe way
            const workspace = vscode.workspace;
            if (workspace.requestWorkspaceTrust && typeof workspace.requestWorkspaceTrust === 'function') {
                this.logger.info('Requesting workspace trust from the user');
                const isTrusted = await workspace.requestWorkspaceTrust();
                return isTrusted;
            }
            // If the workspace trust API is not available, ask the user
            const result = await vscode.window.showWarningMessage('This extension requires trust to modify workspace files. Do you trust this workspace?', 'Yes, I trust this workspace', 'No');
            return result === 'Yes, I trust this workspace';
        }
        catch (error) {
            this.logger.error('Error requesting workspace trust', error instanceof Error ? error : new Error(String(error)));
            return false;
        }
    }
    async requireTrust(message) {
        // If the workspace is already trusted, return true immediately
        if (this.isWorkspaceTrusted()) {
            return true;
        }
        // Show a warning and ask for trust
        const warningMessage = message ||
            'This operation requires workspace trust. Please trust this workspace to continue.';
        const result = await vscode.window.showWarningMessage(warningMessage, 'Trust Workspace', 'Cancel');
        // If the user clicked "Trust Workspace", request trust
        if (result === 'Trust Workspace') {
            return await this.requestWorkspaceTrust();
        }
        return false;
    }
}
exports.TrustManager = TrustManager;
//# sourceMappingURL=TrustManager.js.map