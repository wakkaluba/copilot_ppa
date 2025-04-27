"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusReporterService = void 0;
var vscode = require("vscode");
var StatusReporterService = /** @class */ (function () {
    function StatusReporterService() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    }
    StatusReporterService.prototype.updateStatusBar = function (state, providerName) {
        var displayName = providerName || 'LLM';
        switch (state) {
            case 'connected':
                this.statusBarItem.text = "$(check) ".concat(displayName);
                this.statusBarItem.show();
                break;
            case 'connecting':
                this.statusBarItem.text = "$(sync~spin) ".concat(displayName);
                this.statusBarItem.show();
                break;
            case 'disconnected':
                this.statusBarItem.text = "$(circle-slash) ".concat(displayName);
                this.statusBarItem.show();
                break;
            case 'error':
                this.statusBarItem.text = "$(error) ".concat(displayName);
                this.statusBarItem.show();
                break;
            default:
                this.statusBarItem.hide();
        }
    };
    StatusReporterService.prototype.dispose = function () {
        this.statusBarItem.dispose();
    };
    return StatusReporterService;
}());
exports.StatusReporterService = StatusReporterService;
