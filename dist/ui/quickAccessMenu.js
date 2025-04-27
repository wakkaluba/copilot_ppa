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
exports.QuickAccessMenu = void 0;
const vscode = __importStar(require("vscode"));
const WebviewService_1 = require("../services/ui/WebviewService");
const ToggleService_1 = require("../services/ui/ToggleService");
/**
 * Provides a burger menu with quick access to command toggles
 */
class QuickAccessMenu {
    constructor(context) {
        this.webviewService = new WebviewService_1.WebviewService(context);
        this.toggleService = new ToggleService_1.ToggleService(context);
        this.toggleService.onToggleChange(() => {
            if (this.panel) {
                this.updatePanel();
            }
        });
    }
    /**
     * Show the quick access menu
     */
    show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        // Create a new panel
        this.panel = this.webviewService.createWebviewPanel('quickAccessMenu', 'Command Toggles', { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true });
        // Set initial content
        this.updatePanel();
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(this.handleWebviewMessage.bind(this), undefined, this.webviewService.getDisposables());
        // Clean up resources when the panel is closed
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        }, null, this.webviewService.getDisposables());
    }
    /**
     * Update the panel content
     */
    updatePanel() {
        if (!this.panel) {
            return;
        }
        this.panel.webview.html = this.webviewService.getToggleMenuContent(this.toggleService.getAllToggles());
    }
    /**
     * Handle messages from the webview
     */
    async handleWebviewMessage(message) {
        switch (message.command) {
            case 'toggleSwitch':
                await this.toggleService.toggleState(message.id);
                break;
            case 'resetAll':
                await this.toggleService.resetToggles();
                break;
            case 'close':
                if (this.panel) {
                    this.panel.dispose();
                }
                break;
        }
    }
}
exports.QuickAccessMenu = QuickAccessMenu;
//# sourceMappingURL=quickAccessMenu.js.map