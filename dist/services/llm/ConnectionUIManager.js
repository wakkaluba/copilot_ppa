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
exports.ConnectionUIManager = void 0;
const vscode = __importStar(require("vscode"));
const ConnectionStatusService_1 = require("../ui/ConnectionStatusService");
const ModelInfoService_1 = require("../ui/ModelInfoService");
const ConnectionDetailsService_1 = require("../ui/ConnectionDetailsService");
class ConnectionUIManager {
    statusService;
    modelInfoService;
    detailsService;
    disposables = [];
    connectionManager;
    constructor() {
        this.statusService = new ConnectionStatusService_1.ConnectionStatusService();
        this.modelInfoService = new ModelInfoService_1.ModelInfoService();
        this.detailsService = new ConnectionDetailsService_1.ConnectionDetailsService();
        this.disposables.push(this.statusService, this.modelInfoService, this.detailsService);
        this.registerCommands();
    }
    setConnectionManager(manager) {
        this.connectionManager = manager;
        this.subscribeToEvents();
        this.updateUI(this.connectionManager.getStatus());
    }
    subscribeToEvents() {
        if (!this.connectionManager) {
            return;
        }
        this.connectionManager.on('stateChanged', status => {
            this.updateUI(status);
        });
        this.connectionManager.on('modelChanged', status => {
            this.modelInfoService.updateModelInfo(status.modelInfo);
        });
        this.connectionManager.on('error', status => {
            this.statusService.showError(status.error);
        });
    }
    updateUI(status) {
        this.statusService.updateStatus(status);
        vscode.commands.executeCommand('setContext', 'copilot-ppa.isConnected', status.isConnected);
        vscode.commands.executeCommand('setContext', 'copilot-ppa.isAvailable', status.isAvailable);
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.toggleConnection', () => {
            this.handleToggleConnection();
        }), vscode.commands.registerCommand('copilot-ppa.showConnectionDetails', () => {
            this.showConnectionDetails();
        }), vscode.commands.registerCommand('copilot-ppa.configureModel', () => {
            this.handleConfigure();
        }));
    }
    async handleToggleConnection() {
        if (!this.connectionManager) {
            return;
        }
        try {
            const status = this.connectionManager.getStatus();
            if (status.isConnected) {
                await this.connectionManager.disconnect();
            }
            else {
                await this.connectionManager.connect();
            }
        }
        catch (error) {
            this.statusService.showError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    async handleConfigure() {
        if (!this.connectionManager) {
            return;
        }
        try {
            const providers = await this.connectionManager.getAvailableProviders();
            const selected = await this.modelInfoService.selectProvider(providers);
            if (selected) {
                await this.connectionManager.configureProvider(selected);
            }
        }
        catch (error) {
            this.statusService.showError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    async showConnectionDetails() {
        if (!this.connectionManager) {
            return;
        }
        const status = this.connectionManager.getStatus();
        this.detailsService.showConnectionDetails(status);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.ConnectionUIManager = ConnectionUIManager;
//# sourceMappingURL=ConnectionUIManager.js.map