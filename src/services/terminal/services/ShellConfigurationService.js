"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellConfigurationService = void 0;
var types_1 = require("../types");
var inversify_1 = require("inversify");
var ShellConfigurationService = /** @class */ (function () {
    function ShellConfigurationService() {
        this.maxHistorySize = 100;
    }
    ShellConfigurationService.prototype.getHistoryLimit = function () {
        return this.maxHistorySize;
    };
    ShellConfigurationService.prototype.getShellConfig = function (shellType) {
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
    };
    ShellConfigurationService = __decorate([
        (0, inversify_1.injectable)()
    ], ShellConfigurationService);
    return ShellConfigurationService;
}());
exports.ShellConfigurationService = ShellConfigurationService;
