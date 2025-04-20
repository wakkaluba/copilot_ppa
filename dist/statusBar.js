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
exports.StatusBarManager = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Manages status bar items for the extension
 */
class StatusBarManager {
    context;
    mainStatusBarItem;
    metricsStatusBarItem;
    /**
     * Creates a new status bar manager
     * @param context The extension context
     */
    constructor(context) {
        this.context = context;
        // Create the main status bar item
        this.mainStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.mainStatusBarItem.command = 'copilot-ppa.openMenu';
        this.mainStatusBarItem.tooltip = 'Copilot PPA';
        // Create the metrics status bar item
        this.metricsStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.metricsStatusBarItem.command = 'copilot-ppa.showMetrics';
        this.metricsStatusBarItem.tooltip = 'PPA Metrics';
        // Add the status bar items to context subscriptions
        context.subscriptions.push(this.mainStatusBarItem);
        context.subscriptions.push(this.metricsStatusBarItem);
    }
    /**
     * Initialize status bar items
     */
    initialize() {
        this.updateMainStatusBar();
        this.updateMetricsStatusBar();
        // Show status bar items if enabled in settings
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        if (config.get('showStatusBar', true)) {
            this.mainStatusBarItem.show();
        }
        // Add configuration change listener to show/hide status bar
        this.context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('copilot-ppa.showStatusBar')) {
                this.updateVisibility();
            }
        }));
    }
    /**
     * Update the main status bar item's text and visibility
     * @param text Optional text to set (uses default if not provided)
     */
    updateMainStatusBar(text) {
        this.mainStatusBarItem.text = text || '$(copilot) PPA';
    }
    /**
     * Update the metrics status bar with performance information
     * @param perfScore Optional performance score (0-100)
     */
    updateMetricsStatusBar(perfScore) {
        if (perfScore !== undefined) {
            // Use different icons based on score
            let icon = '$(check)';
            if (perfScore < 50) {
                icon = '$(warning)';
            }
            else if (perfScore < 80) {
                icon = '$(info)';
            }
            this.metricsStatusBarItem.text = `${icon} ${perfScore}`;
            this.metricsStatusBarItem.show();
        }
        else {
            this.metricsStatusBarItem.hide();
        }
    }
    /**
     * Shows the working animation in the status bar
     * @param message Optional message to show while working
     */
    showWorkingAnimation(message) {
        const workingMessage = message || 'Analyzing...';
        let dots = '.';
        let count = 0;
        const interval = setInterval(() => {
            this.mainStatusBarItem.text = `$(sync~spin) ${workingMessage}${dots}`;
            count++;
            if (count % 3 === 0) {
                dots = '.';
            }
            else {
                dots += '.';
            }
        }, 500);
        return {
            dispose: () => {
                clearInterval(interval);
                this.updateMainStatusBar();
            }
        };
    }
    /**
     * Update the visibility of status bar items based on settings
     */
    updateVisibility() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const showStatusBar = config.get('showStatusBar', true);
        if (showStatusBar) {
            this.mainStatusBarItem.show();
        }
        else {
            this.mainStatusBarItem.hide();
            this.metricsStatusBarItem.hide();
        }
    }
    /**
     * Dispose of status bar resources
     */
    dispose() {
        this.mainStatusBarItem.dispose();
        this.metricsStatusBarItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=statusBar.js.map