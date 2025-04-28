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
exports.MenuCommandService = void 0;
const vscode = __importStar(require("vscode"));
class MenuCommandService {
    constructor(agentService, configService, visualizationService, errorHandler) {
        this.agentService = agentService;
        this.configService = configService;
        this.visualizationService = visualizationService;
        this.errorHandler = errorHandler;
    }
    async openMenu() {
        const options = [
            'Start Agent',
            'Stop Agent',
            'Configure Model',
            'Show Metrics Dashboard',
            'Clear Conversation History',
            'View Documentation'
        ];
        const result = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select an action'
        });
        if (result) {
            try {
                switch (result) {
                    case 'Start Agent':
                        await this.agentService.startAgent();
                        break;
                    case 'Stop Agent':
                        await this.agentService.stopAgent();
                        break;
                    case 'Configure Model':
                        await this.configService.configureModel();
                        break;
                    case 'Show Metrics Dashboard':
                        await this.visualizationService.showMetrics();
                        break;
                    case 'Clear Conversation History':
                        await this.configService.clearConversation();
                        break;
                    case 'View Documentation':
                        await vscode.env.openExternal(vscode.Uri.parse('https://github.com/your-repo/copilot-ppa/docs'));
                        break;
                }
            }
            catch (error) {
                this.errorHandler.handle('Failed to execute menu action', error);
            }
        }
    }
}
exports.MenuCommandService = MenuCommandService;
//# sourceMappingURL=MenuCommandService.js.map