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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalModule = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var terminalManager_1 = require("./terminalManager");
var interactiveShell_1 = require("./interactiveShell");
var aiTerminalHelper_1 = require("./aiTerminalHelper");
var commandGenerationWebview_1 = require("./commandGenerationWebview");
var ILogger_1 = require("../logging/ILogger");
var TerminalConfigurationService_1 = require("./services/TerminalConfigurationService");
var TerminalCommandRegistrar_1 = require("./commands/TerminalCommandRegistrar");
__exportStar(require("./types"), exports);
__exportStar(require("./terminalManager"), exports);
__exportStar(require("./interactiveShell"), exports);
__exportStar(require("./aiTerminalHelper"), exports);
var TerminalModule = /** @class */ (function () {
    function TerminalModule(logger, context) {
        this.logger = logger;
        this.context = context;
        this.disposables = [];
        this.container = new inversify_1.Container();
        this.configureContainer();
        this.registerDisposables();
    }
    TerminalModule.prototype.configureContainer = function () {
        this.container.bind(ILogger_1.ILogger).toConstantValue(this.logger);
        this.container.bind(terminalManager_1.TerminalManager).toSelf().inSingletonScope();
        this.container.bind(interactiveShell_1.InteractiveShell).toSelf().inSingletonScope();
        this.container.bind(TerminalConfigurationService_1.TerminalConfigurationService).toSelf().inSingletonScope();
        this.container.bind(TerminalCommandRegistrar_1.TerminalCommandRegistrar).toSelf().inSingletonScope();
    };
    TerminalModule.prototype.registerDisposables = function () {
        this.disposables.push(this.container.get(terminalManager_1.TerminalManager), this.container.get(interactiveShell_1.InteractiveShell), this.container.get(TerminalCommandRegistrar_1.TerminalCommandRegistrar));
    };
    TerminalModule.prototype.setLLMManager = function (llmManager) {
        var _this = this;
        try {
            var aiHelper_1 = new aiTerminalHelper_1.AITerminalHelper(llmManager, this.container.get(interactiveShell_1.InteractiveShell), this.context);
            this.container.bind('AITerminalHelper').toConstantValue(aiHelper_1);
            this.container.bind('CommandGenerationWebview').toDynamicValue(function () {
                return new commandGenerationWebview_1.CommandGenerationWebview(_this.context, aiHelper_1, _this.container.get(interactiveShell_1.InteractiveShell));
            });
            this.logger.info('LLM manager configured successfully');
        }
        catch (error) {
            this.logger.error('Failed to configure LLM manager:', error);
            throw error;
        }
    };
    TerminalModule.prototype.initialize = function () {
        try {
            this.container.get(TerminalCommandRegistrar_1.TerminalCommandRegistrar).register(this.context);
            this.logger.info('Terminal module initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize terminal module:', error);
            throw error;
        }
    };
    TerminalModule.prototype.getTerminalManager = function () {
        return this.container.get(terminalManager_1.TerminalManager);
    };
    TerminalModule.prototype.getInteractiveShell = function () {
        return this.container.get(interactiveShell_1.InteractiveShell);
    };
    TerminalModule.prototype.getAIHelper = function () {
        return this.container.isBound('AITerminalHelper')
            ? this.container.get('AITerminalHelper')
            : null;
    };
    TerminalModule.prototype.dispose = function () {
        for (var _i = 0, _a = this.disposables; _i < _a.length; _i++) {
            var disposable = _a[_i];
            disposable.dispose();
        }
    };
    var _a;
    TerminalModule = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, inject(ILogger_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, Object])
    ], TerminalModule);
    return TerminalModule;
}());
exports.TerminalModule = TerminalModule;
