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
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const terminalManager_1 = require("./terminalManager");
const interactiveShell_1 = require("./interactiveShell");
const aiTerminalHelper_1 = require("./aiTerminalHelper");
const commandGenerationWebview_1 = require("./commandGenerationWebview");
const TerminalConfigurationService_1 = require("./services/TerminalConfigurationService");
const TerminalCommandRegistrar_1 = require("./commands/TerminalCommandRegistrar");
__exportStar(require("./types"), exports);
__exportStar(require("./terminalManager"), exports);
__exportStar(require("./interactiveShell"), exports);
__exportStar(require("./aiTerminalHelper"), exports);
let TerminalModule = class TerminalModule {
    constructor(logger, context) {
        this.logger = logger;
        this.context = context;
        this.disposables = [];
        this.container = new inversify_1.Container();
        this.configureContainer();
        this.registerDisposables();
    }
    configureContainer() {
        this.container.bind(ILogger_1.ILogger).toConstantValue(this.logger);
        this.container.bind(terminalManager_1.TerminalManager).toSelf().inSingletonScope();
        this.container.bind(interactiveShell_1.InteractiveShell).toSelf().inSingletonScope();
        this.container.bind(TerminalConfigurationService_1.TerminalConfigurationService).toSelf().inSingletonScope();
        this.container.bind(TerminalCommandRegistrar_1.TerminalCommandRegistrar).toSelf().inSingletonScope();
    }
    registerDisposables() {
        this.disposables.push(this.container.get(terminalManager_1.TerminalManager), this.container.get(interactiveShell_1.InteractiveShell), this.container.get(TerminalCommandRegistrar_1.TerminalCommandRegistrar));
    }
    setLLMManager(llmManager) {
        try {
            const aiHelper = new aiTerminalHelper_1.AITerminalHelper(llmManager, this.container.get(interactiveShell_1.InteractiveShell), this.context);
            this.container.bind('AITerminalHelper').toConstantValue(aiHelper);
            this.container.bind('CommandGenerationWebview').toDynamicValue(() => {
                return new commandGenerationWebview_1.CommandGenerationWebview(this.context, aiHelper, this.container.get(interactiveShell_1.InteractiveShell));
            });
            this.logger.info('LLM manager configured successfully');
        }
        catch (error) {
            this.logger.error('Failed to configure LLM manager:', error);
            throw error;
        }
    }
    initialize() {
        try {
            this.container.get(TerminalCommandRegistrar_1.TerminalCommandRegistrar).register(this.context);
            this.logger.info('Terminal module initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize terminal module:', error);
            throw error;
        }
    }
    getTerminalManager() {
        return this.container.get(terminalManager_1.TerminalManager);
    }
    getInteractiveShell() {
        return this.container.get(interactiveShell_1.InteractiveShell);
    }
    getAIHelper() {
        return this.container.isBound('AITerminalHelper')
            ? this.container.get('AITerminalHelper')
            : null;
    }
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
};
exports.TerminalModule = TerminalModule;
exports.TerminalModule = TerminalModule = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, inject(ILogger_1.ILogger)),
    __metadata("design:paramtypes", [Object, Object])
], TerminalModule);
//# sourceMappingURL=index.js.map