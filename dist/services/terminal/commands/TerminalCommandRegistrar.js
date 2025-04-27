"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalCommandRegistrar = void 0;
const inversify_1 = require("inversify");
const terminalManager_1 = require("../terminalManager");
const interactiveShell_1 = require("../interactiveShell");
const TerminalConfigurationService_1 = require("../services/TerminalConfigurationService");
let TerminalCommandRegistrar = class TerminalCommandRegistrar {
    constructor(logger, terminalManager, interactiveShell, config, aiHelper) {
        this.logger = logger;
        this.terminalManager = terminalManager;
        this.interactiveShell = interactiveShell;
        this.config = config;
        this.aiHelper = aiHelper;
        this.disposables = [];
    }
    register(context) {
        this.registerTerminalCreation(context);
        this.registerCommandExecution(context);
        if (this.aiHelper) {
            this.registerAICommands(context);
        }
    }
    registerTerminalCreation(context) {
        // ... similar to original command registration but with error handling ...
    }
    registerCommandExecution(context) {
        // ... similar to original command registration but with error handling ...
    }
    registerAICommands(context) {
        // ... similar to original command registration but with error handling ...
    }
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
};
TerminalCommandRegistrar = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(terminalManager_1.TerminalManager)),
    __param(2, (0, inversify_1.inject)(interactiveShell_1.InteractiveShell)),
    __param(3, (0, inversify_1.inject)(TerminalConfigurationService_1.TerminalConfigurationService)),
    __param(4, (0, inversify_1.inject)('AITerminalHelper')),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof terminalManager_1.TerminalManager !== "undefined" && terminalManager_1.TerminalManager) === "function" ? _a : Object, typeof (_b = typeof interactiveShell_1.InteractiveShell !== "undefined" && interactiveShell_1.InteractiveShell) === "function" ? _b : Object, TerminalConfigurationService_1.TerminalConfigurationService, Object])
], TerminalCommandRegistrar);
exports.TerminalCommandRegistrar = TerminalCommandRegistrar;
//# sourceMappingURL=TerminalCommandRegistrar.js.map