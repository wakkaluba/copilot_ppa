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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.TerminalConfigurationService = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const types_1 = require("../types");
let TerminalConfigurationService = class TerminalConfigurationService {
    getAvailableShells() {
        const shells = [
            { label: 'Default VS Code Terminal', value: types_1.TerminalShellType.VSCodeDefault },
            { label: 'PowerShell', value: types_1.TerminalShellType.PowerShell },
            { label: 'Git Bash', value: types_1.TerminalShellType.GitBash }
        ];
        if (process.platform === 'win32') {
            shells.push({ label: 'WSL Bash', value: types_1.TerminalShellType.WSLBash });
        }
        return shells;
    }
    async selectShellType() {
        const shells = this.getAvailableShells();
        const selected = await vscode.window.showQuickPick(shells, {
            placeHolder: 'Select shell type'
        });
        return selected?.value;
    }
};
exports.TerminalConfigurationService = TerminalConfigurationService;
exports.TerminalConfigurationService = TerminalConfigurationService = __decorate([
    (0, inversify_1.injectable)()
], TerminalConfigurationService);
//# sourceMappingURL=TerminalConfigurationService.js.map