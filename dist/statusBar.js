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
class StatusBarManager {
    _mainStatusBarItem;
    _metricsStatusBarItem;
    _configListener;
    _workingAnimation;
    _state = {
        mainText: '$(copilot) PPA',
        isWorking: false,
        isVisible: true,
        isError: false
    };
    constructor(context) {
        this._mainStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this._mainStatusBarItem.command = 'copilot-ppa.openMenu';
        this._mainStatusBarItem.tooltip = 'Copilot PPA';
        this._metricsStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this._metricsStatusBarItem.command = 'copilot-ppa.showMetrics';
        this._metricsStatusBarItem.tooltip = 'PPA Metrics';
        // Setup configuration change listener
        this._configListener = vscode.workspace.onDidChangeConfiguration(this.handleConfigChange.bind(this));
        context.subscriptions.push(this._mainStatusBarItem, this._metricsStatusBarItem, this._configListener);
    }
    async initialize() {
        try {
            await this.loadInitialState();
            this.updateUI();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to initialize status bar: ${message}`);
            this.setErrorState();
        }
    }
    async loadInitialState() {
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        this._state.isVisible = config.get('showStatusBar', true);
        await this.updateUI();
    }
    async handleConfigChange(event) {
        if (event.affectsConfiguration('copilot-ppa.showStatusBar')) {
            const config = vscode.workspace.getConfiguration('copilot-ppa');
            this._state.isVisible = config.get('showStatusBar', true);
            await this.updateUI();
        }
    }
    updateMainStatusBar(text) {
        if (text) {
            this._state.mainText = text;
        }
        this.updateUI();
    }
    updateMetricsStatusBar(perfScore) {
        this._state.metricsScore = perfScore;
        this.updateUI();
    }
    showWorkingAnimation(message) {
        // Clear any existing animation
        this.clearWorkingAnimation();
        this._state.isWorking = true;
        this._state.workingMessage = message || 'Analyzing...';
        let dots = '.';
        let count = 0;
        this._workingAnimation = setInterval(() => {
            const text = `$(sync~spin) ${this._state.workingMessage}${dots}`;
            this._mainStatusBarItem.text = text;
            count = (count + 1) % 3;
            dots = '.'.repeat(count + 1);
        }, 500);
        const animation = {
            message: this._state.workingMessage,
            updateMessage: (newMessage) => {
                this._state.workingMessage = newMessage;
            },
            dispose: () => {
                this.clearWorkingAnimation();
                this._state.isWorking = false;
                this._state.workingMessage = undefined;
                this.updateUI();
            }
        };
        return animation;
    }
    clearWorkingAnimation() {
        if (this._workingAnimation) {
            clearInterval(this._workingAnimation);
            this._workingAnimation = undefined;
        }
    }
    async setErrorState() {
        this._state.isError = true;
        this._state.mainText = '$(error) PPA Error';
        this._mainStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.updateUI();
    }
    async clearErrorState() {
        this._state.isError = false;
        this._state.mainText = '$(copilot) PPA';
        this._mainStatusBarItem.backgroundColor = undefined;
        this.updateUI();
    }
    async show() {
        this._state.isVisible = true;
        this.updateUI();
    }
    async hide() {
        this._state.isVisible = false;
        this.updateUI();
    }
    update(message) {
        this.updateMainStatusBar(message);
    }
    updateUI() {
        try {
            // Update main status bar
            this._mainStatusBarItem.text = this._state.mainText;
            // Update metrics status bar if score is available
            if (this._state.metricsScore !== undefined) {
                const icon = this.getMetricsIcon(this._state.metricsScore);
                this._metricsStatusBarItem.text = `${icon} ${this._state.metricsScore}`;
                this._metricsStatusBarItem.show();
            }
            else {
                this._metricsStatusBarItem.hide();
            }
            // Update visibility
            if (this._state.isVisible) {
                this._mainStatusBarItem.show();
            }
            else {
                this._mainStatusBarItem.hide();
                this._metricsStatusBarItem.hide();
            }
        }
        catch (error) {
            console.error('Error updating status bar UI:', error);
        }
    }
    getMetricsIcon(score) {
        if (score < 50) {
            return '$(warning)';
        }
        if (score < 80) {
            return '$(info)';
        }
        return '$(check)';
    }
    dispose() {
        this.clearWorkingAnimation();
        this._mainStatusBarItem.dispose();
        this._metricsStatusBarItem.dispose();
        this._configListener.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=statusBar.js.map