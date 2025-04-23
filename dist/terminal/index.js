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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalModule = void 0;
const inversify_1 = require("inversify");
const terminalManager_1 = require("./terminalManager");
const interactiveShell_1 = require("./interactiveShell");
const aiTerminalHelper_1 = require("./aiTerminalHelper");
const commandGenerationWebview_1 = require("./commandGenerationWebview");
const ILogger_1 = require("../logging/ILogger");
const TerminalConfigurationService_1 = require("./services/TerminalConfigurationService");
const TerminalCommandRegistrar_1 = require("./commands/TerminalCommandRegistrar");
__exportStar(require("./types"), exports);
__exportStar(require("./terminalManager"), exports);
__exportStar(require("./interactiveShell"), exports);
__exportStar(require("./aiTerminalHelper"), exports);
let TerminalModule = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TerminalModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TerminalModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        context;
        disposables = [];
        container;
        constructor(logger, context) {
            this.logger = logger;
            this.context = context;
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
    return TerminalModule = _classThis;
})();
exports.TerminalModule = TerminalModule;
//# sourceMappingURL=index.js.map