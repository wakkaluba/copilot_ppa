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
exports.MemoryManagementService = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class MemoryManagementService {
    history;
    services;
    onMemoryCleared = new events_1.EventEmitter();
    onChangedFilesReset = new events_1.EventEmitter();
    onCopilotRestarted = new events_1.EventEmitter();
    changedFiles = new Set();
    constructor(history, services) {
        this.history = history;
        this.services = services;
    }
    async clearMemory() {
        // Clear conversation history
        await this.history.clearAllConversations();
        // Clear service caches
        await this.services.clearAllCaches();
        // Reset workspace state
        await vscode.workspace.getConfiguration('copilot-ppa').update('lastSession', undefined, true);
        this.onMemoryCleared.emit();
    }
    async resetChangedFiles() {
        this.changedFiles.clear();
        this.onChangedFilesReset.emit();
    }
    async restartCopilot() {
        // Stop all active services
        await this.services.dispose();
        // Clear memory and caches
        await this.clearMemory();
        // Reinitialize services
        await this.services.initialize();
        this.onCopilotRestarted.emit();
    }
    trackChangedFile(filePath) {
        this.changedFiles.add(filePath);
    }
    getChangedFiles() {
        return Array.from(this.changedFiles);
    }
    dispose() {
        this.onMemoryCleared.removeAllListeners();
        this.onChangedFilesReset.removeAllListeners();
        this.onCopilotRestarted.removeAllListeners();
    }
}
exports.MemoryManagementService = MemoryManagementService;
//# sourceMappingURL=MemoryManagementService.js.map