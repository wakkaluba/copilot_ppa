"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceStatusService = void 0;
var vscode = require("vscode");
var PerformanceStatusService = /** @class */ (function () {
    function PerformanceStatusService() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.show();
    }
    PerformanceStatusService.prototype.updateStatusBar = function (result) {
        var issues = result.issues;
        var criticalCount = issues.filter(function (i) { return i.severity === 'critical'; }).length;
        var highCount = issues.filter(function (i) { return i.severity === 'high'; }).length;
        if (criticalCount > 0) {
            this.statusBarItem.text = "$(error) ".concat(criticalCount, " critical issues");
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        }
        else if (highCount > 0) {
            this.statusBarItem.text = "$(warning) ".concat(highCount, " high severity issues");
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        else if (issues.length > 0) {
            this.statusBarItem.text = "$(info) ".concat(issues.length, " performance issues");
            this.statusBarItem.backgroundColor = undefined;
        }
        else {
            this.statusBarItem.text = "$(check) No performance issues";
            this.statusBarItem.backgroundColor = undefined;
        }
    };
    PerformanceStatusService.prototype.dispose = function () {
        this.statusBarItem.dispose();
    };
    return PerformanceStatusService;
}());
exports.PerformanceStatusService = PerformanceStatusService;
