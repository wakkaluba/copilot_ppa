"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellConfigurationService = void 0;
const types_1 = require("../types");
const inversify_1 = require("inversify");
let ShellConfigurationService = class ShellConfigurationService {
    maxHistorySize = 100;
    getHistoryLimit() {
        return this.maxHistorySize;
    }
    getShellConfig(shellType) {
        switch (shellType) {
            case types_1.TerminalShellType.PowerShell:
                return {
                    executable: 'powershell.exe',
                    args: ['-NoLogo', '-NoProfile']
                };
            case types_1.TerminalShellType.GitBash:
                return {
                    executable: 'bash.exe',
                    args: ['--login', '-i']
                };
            case types_1.TerminalShellType.WSLBash:
                return {
                    executable: 'wsl.exe',
                    args: ['bash', '-i']
                };
            default:
                return {
                    executable: undefined,
                    args: []
                };
        }
    }
};
exports.ShellConfigurationService = ShellConfigurationService;
exports.ShellConfigurationService = ShellConfigurationService = __decorate([
    (0, inversify_1.injectable)()
], ShellConfigurationService);
//# sourceMappingURL=ShellConfigurationService.js.map