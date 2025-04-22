"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotIntegrationWebview = void 0;
const CopilotIntegrationWebviewService_1 = require("./services/CopilotIntegrationWebviewService");
/**
 * WebView implementation for Copilot integration UI
 */
class CopilotIntegrationWebview {
    context;
    static viewType = 'copilotIntegration.webview';
    service;
    /**
     * Creates a new instance of the CopilotIntegrationWebview
     * @param context The extension context
     * @param copilotService The Copilot integration service
     */
    constructor(context, copilotService) {
        this.context = context;
        this.service = new CopilotIntegrationWebviewService_1.CopilotIntegrationWebviewService(context, copilotService);
    }
    /**
     * Creates and shows the webview panel
     */
    async show() {
        await this.service.show();
    }
    /**
     * Disposes of the webview panel
     */
    dispose() {
        this.service.dispose();
    }
}
exports.CopilotIntegrationWebview = CopilotIntegrationWebview;
//# sourceMappingURL=copilotIntegrationWebview.js.map