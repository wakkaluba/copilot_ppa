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
exports.ToggleStatusBarItem = void 0;
const vscode = __importStar(require("vscode"));
const commandToggleManager_1 = require("./commandToggleManager");
const quickAccessMenu_1 = require("./quickAccessMenu");
/**
 * Status bar item to display and control command toggles
 */
class ToggleStatusBarItem {
    constructor(context) {
        this.context = context;
        this.toggleManager = commandToggleManager_1.CommandToggleManager.getInstance(context);
        this.quickAccessMenu = new quickAccessMenu_1.QuickAccessMenu(context);
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'copilot-ppa.showCommandToggles';
        // Listen for toggle changes to update status bar
        this.toggleManager.onToggleChange(() => {
            this.updateStatusBar();
        });
        // Initialize status bar
        this.updateStatusBar();
        this.statusBarItem.show();
        // Register with the context for cleanup
        context.subscriptions.push(this.statusBarItem);
    }
    /**
     * Update the status bar item based on current toggle states
     */
    updateStatusBar() {
        const toggles = this.toggleManager.getAllToggles();
        const activeToggles = toggles.filter(t => t.state);
        if (activeToggles.length === 0) {
            this.statusBarItem.text = '$(circle-outline) AI Commands';
            this.statusBarItem.tooltip = 'No command toggles active. Click to configure.';
        }
        else if (activeToggles.length === 1) {
            this.statusBarItem.text = `$(circle-filled) ${activeToggles[0].label}`;
            this.statusBarItem.tooltip = `1 command toggle active: ${activeToggles[0].label}`;
        }
        else {
            this.statusBarItem.text = `$(circle-filled) ${activeToggles.length} Toggles`;
            this.statusBarItem.tooltip = `${activeToggles.length} command toggles active:\n${activeToggles.map(t => t.label).join(', ')}`;
        }
    }
    /**
     * Show the command toggles menu
     */
    showMenu() {
        this.quickAccessMenu.show();
    }
}
exports.ToggleStatusBarItem = ToggleStatusBarItem;
//# sourceMappingURL=toggleStatusBarItem.js.map