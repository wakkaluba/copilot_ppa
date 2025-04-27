"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMStatusBar = void 0;
var vscode = require("vscode");
var LLMStatusBar = /** @class */ (function () {
    function LLMStatusBar() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.show();
    }
    LLMStatusBar.prototype.updateStatus = function (connected, modelName) {
        if (connected) {
            this.statusBarItem.text = "$(check) LLM: ".concat(modelName || 'Connected');
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.successBackground');
        }
        else {
            this.statusBarItem.text = '$(error) LLM: Disconnected';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        }
        this.statusBarItem.tooltip = "LLM Connection Status".concat(modelName ? ': ' + modelName : '');
    };
    LLMStatusBar.prototype.dispose = function () {
        this.statusBarItem.dispose();
    };
    return LLMStatusBar;
}());
exports.LLMStatusBar = LLMStatusBar;
