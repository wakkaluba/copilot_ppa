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
exports.UserInteractionService = void 0;
const vscode = __importStar(require("vscode"));
class UserInteractionService {
    async selectPackageJson(files) {
        if (files.length === 1) {
            return files[0];
        }
        return vscode.window.showQuickPick(files.map(file => ({
            label: file.split('/').pop() || file,
            description: file,
            file
        })), {
            placeHolder: 'Select package.json to optimize',
            title: 'Select Package JSON'
        }).then(selected => selected?.file);
    }
    async selectOptimizations(optimizations) {
        if (optimizations.length === 0) {
            return [];
        }
        const items = optimizations.map((opt, index) => ({
            label: opt.title,
            description: `Complexity: ${opt.complexity}`,
            detail: opt.description,
            picked: opt.complexity === 'low',
            index
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select optimizations to apply',
            canPickMany: true,
            title: 'Select Build Script Optimizations'
        });
        if (!selected) {
            return [];
        }
        // Filter out any potential undefined values
        return selected.map(item => optimizations[item.index]).filter((opt) => opt !== undefined);
    }
    showInfo(message) {
        vscode.window.showInformationMessage(message);
    }
    showError(message) {
        vscode.window.showErrorMessage(message);
    }
    async confirmDependencyInstallation(packages) {
        const response = await vscode.window.showInformationMessage(`The selected optimizations require installing these packages: ${packages.join(', ')}. Install them?`, 'Yes', 'No');
        return response === 'Yes';
    }
}
exports.UserInteractionService = UserInteractionService;
//# sourceMappingURL=UserInteractionService.js.map