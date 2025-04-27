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
exports.PerformanceStatusService = void 0;
const vscode = __importStar(require("vscode"));
class PerformanceStatusService {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.show();
    }
    updateStatusBar(result) {
        const { issues } = result;
        const criticalCount = issues.filter(i => i.severity === 'critical').length;
        const highCount = issues.filter(i => i.severity === 'high').length;
        if (criticalCount > 0) {
            this.statusBarItem.text = `$(error) ${criticalCount} critical issues`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        }
        else if (highCount > 0) {
            this.statusBarItem.text = `$(warning) ${highCount} high severity issues`;
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        else if (issues.length > 0) {
            this.statusBarItem.text = `$(info) ${issues.length} performance issues`;
            this.statusBarItem.backgroundColor = undefined;
        }
        else {
            this.statusBarItem.text = `$(check) No performance issues`;
            this.statusBarItem.backgroundColor = undefined;
        }
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.PerformanceStatusService = PerformanceStatusService;
//# sourceMappingURL=PerformanceStatusService.js.map