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
exports.UISettingsPanel = void 0;
const vscode = __importStar(require("vscode"));
const UISettingsWebviewService_1 = require("./services/UISettingsWebviewService");
const themeManager_1 = require("../services/ui/themeManager");
const logger_1 = require("../utils/logger");
class UISettingsPanel {
    constructor(context) {
        this.context = context;
        this.disposables = [];
        this.logger = logger_1.Logger.getInstance();
        this.webviewService = new UISettingsWebviewService_1.UISettingsWebviewService(themeManager_1.ThemeService.getInstance());
    }
    static getInstance(context) {
        if (!UISettingsPanel.instance) {
            UISettingsPanel.instance = new UISettingsPanel(context);
        }
        return UISettingsPanel.instance;
    }
    async show() {
        try {
            if (this.panel) {
                this.panel.reveal();
                return;
            }
            this.panel = vscode.window.createWebviewPanel('uiSettingsPanel', 'Settings', vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
            });
            const tabs = [
                {
                    id: 'general',
                    label: 'General',
                    content: this.getGeneralSettingsContent()
                },
                {
                    id: 'advanced',
                    label: 'Advanced',
                    content: this.getAdvancedSettingsContent()
                }
            ];
            this.panel.webview.html = this.webviewService.generateWebviewContent(tabs);
            this.registerMessageHandlers();
            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this.dispose();
            }, null, this.disposables);
        }
        catch (error) {
            this.logger.error('Error showing UI settings panel', error);
            throw error;
        }
    }
    registerMessageHandlers() {
        if (!this.panel) {
            return;
        }
        this.panel.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.command) {
                    case 'tabChanged':
                        await this.handleTabChange(message.tab);
                        break;
                    case 'updateSetting':
                        await this.handleSettingUpdate(message.key, message.value);
                        break;
                    default:
                        this.logger.warn(`Unknown message command: ${message.command}`);
                }
            }
            catch (error) {
                this.logger.error('Error handling settings panel message', error);
                this.showErrorMessage('Failed to process command');
            }
        }, undefined, this.disposables);
    }
    selectTab(tabName) {
        if (!this.panel?.visible) {
            return;
        }
        try {
            this.panel.webview.postMessage({
                command: 'selectTab',
                tab: tabName
            });
        }
        catch (error) {
            this.logger.error('Error selecting tab', error);
            this.showErrorMessage('Failed to switch tab');
        }
    }
    showErrorMessage(message) {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'showError',
                message
            });
        }
    }
    getGeneralSettingsContent() {
        return `
            <div class="setting-group">
                <h2>General Settings</h2>
                <div class="setting-item">
                    <label for="theme">Theme</label>
                    <select id="theme">
                        <option value="system">System Default</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label for="language">Language</label>
                    <select id="language">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </select>
                </div>
            </div>
        `;
    }
    getAdvancedSettingsContent() {
        return `
            <div class="setting-group">
                <h2>Advanced Settings</h2>
                <div class="setting-item">
                    <label for="caching">Enable Caching</label>
                    <input type="checkbox" id="caching" />
                </div>
                <div class="setting-item">
                    <label for="logging">Logging Level</label>
                    <select id="logging">
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                    </select>
                </div>
            </div>
        `;
    }
    async handleTabChange(tab) {
        // Implementation for tab change handling
    }
    async handleSettingUpdate(key, value) {
        // Implementation for setting update handling
    }
    dispose() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        UISettingsPanel.instance = undefined;
    }
}
exports.UISettingsPanel = UISettingsPanel;
//# sourceMappingURL=uiSettingsPanel.js.map