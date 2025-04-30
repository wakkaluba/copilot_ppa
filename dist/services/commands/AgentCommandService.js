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
exports.AgentCommandService = void 0;
const vscode = __importStar(require("vscode"));
class AgentCommandService {
    modelService;
    errorHandler;
    constructor(modelService, errorHandler) {
        this.modelService = modelService;
        this.errorHandler = errorHandler;
    }
    async startAgent() {
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Starting Copilot PPA agent...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 50 });
                const recommendations = await this.modelService.getModelRecommendations();
                if (recommendations.length > 0) {
                    const defaultModel = recommendations[0];
                    if (defaultModel) {
                        await this.modelService.checkModelCompatibility(defaultModel.id);
                    }
                }
                progress.report({ increment: 50 });
                await vscode.window.showInformationMessage('Copilot PPA agent started successfully');
            });
        }
        catch (error) {
            this.errorHandler.handle('Failed to start Copilot PPA agent', error);
        }
    }
    async stopAgent() {
        try {
            await this.modelService.dispose();
            await vscode.window.showInformationMessage('Copilot PPA agent stopped');
        }
        catch (error) {
            this.errorHandler.handle('Failed to stop Copilot PPA agent', error);
        }
    }
    async restartAgent() {
        try {
            await this.stopAgent();
            await this.startAgent();
        }
        catch (error) {
            this.errorHandler.handle('Failed to restart Copilot PPA agent', error);
        }
    }
}
exports.AgentCommandService = AgentCommandService;
//# sourceMappingURL=AgentCommandService.js.map