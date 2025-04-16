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
exports.DisplaySettingsService = void 0;
const vscode = __importStar(require("vscode"));
class DisplaySettingsService {
    constructor() {
        this._onSettingsChanged = new vscode.EventEmitter();
        this.onSettingsChanged = this._onSettingsChanged.event;
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('copilot-ppa.display')) {
                this._onSettingsChanged.fire(this.getSettings());
            }
        });
    }
    static getInstance() {
        if (!DisplaySettingsService.instance) {
            DisplaySettingsService.instance = new DisplaySettingsService();
        }
        return DisplaySettingsService.instance;
    }
    getSettings() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const displayConfig = config.get('display') || {};
        return {
            fontSize: displayConfig.fontSize || 14,
            messageSpacing: displayConfig.messageSpacing || 12,
            codeBlockTheme: displayConfig.codeBlockTheme || 'default',
            userMessageColor: displayConfig.userMessageColor || '#569cd6',
            agentMessageColor: displayConfig.agentMessageColor || '#4ec9b0',
            timestampDisplay: displayConfig.timestampDisplay !== false,
            compactMode: !!displayConfig.compactMode
        };
    }
    async updateSetting(setting, value) {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const displayConfig = config.get('display') || {};
        displayConfig[setting] = value;
        await config.update('display', displayConfig, vscode.ConfigurationTarget.Global);
        this._onSettingsChanged.fire(this.getSettings());
    }
    applySettingsToElement(element) {
        const settings = this.getSettings();
        // Apply font size to the element
        element.style.fontSize = `${settings.fontSize}px`;
        // Apply compact mode if enabled
        if (settings.compactMode) {
            element.classList.add('compact-mode');
        }
        else {
            element.classList.remove('compact-mode');
        }
    }
    getCssVariables() {
        const settings = this.getSettings();
        return `
            :root {
                --agent-font-size: ${settings.fontSize}px;
                --agent-message-spacing: ${settings.messageSpacing}px;
                --agent-user-message-color: ${settings.userMessageColor};
                --agent-assistant-message-color: ${settings.agentMessageColor};
                --agent-code-theme: ${settings.codeBlockTheme};
            }
        `;
    }
}
exports.DisplaySettingsService = DisplaySettingsService;
//# sourceMappingURL=displaySettingsService.js.map