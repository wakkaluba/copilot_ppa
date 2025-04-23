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
exports.ModelStateManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelStateManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelStateManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelStateManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        stateMap = new Map();
        stateHistory = new Map();
        outputChannel;
        maxHistorySize = 1000;
        storageKey = 'model-states';
        constructor(logger) {
            super();
            this.logger = logger;
            this.outputChannel = vscode.window.createOutputChannel('Model State');
            this.loadPersistedStates();
        }
        async updateState(modelId, state) {
            try {
                const oldState = this.stateMap.get(modelId);
                this.stateMap.set(modelId, state);
                this.trackStateTransition(modelId, oldState, state);
                this.emitStateChange(modelId, state);
                this.logStateChange(modelId, oldState, state);
                await this.persistStates();
            }
            catch (error) {
                this.handleError('Failed to update state', error);
            }
        }
        getState(modelId) {
            return this.stateMap.get(modelId);
        }
        getStateHistory(modelId) {
            return [...(this.stateHistory.get(modelId) || [])];
        }
        getStateSnapshot(modelId) {
            const state = this.getState(modelId);
            if (!state)
                return undefined;
            return {
                modelId,
                state,
                timestamp: Date.now(),
                transitions: this.getStateHistory(modelId)
            };
        }
        trackStateTransition(modelId, oldState, newState) {
            const history = this.stateHistory.get(modelId) || [];
            const transition = {
                from: oldState || 'initial',
                to: newState,
                timestamp: Date.now()
            };
            history.push(transition);
            if (history.length > this.maxHistorySize) {
                history.shift(); // Remove oldest entry
            }
            this.stateHistory.set(modelId, history);
        }
        emitStateChange(modelId, state) {
            this.emit('stateChanged', { modelId, state });
        }
        async persistStates() {
            try {
                const stateData = Array.from(this.stateMap.entries()).map(([id, state]) => ({
                    modelId: id,
                    state,
                    history: this.getStateHistory(id)
                }));
                await vscode.workspace.getConfiguration().update(this.storageKey, stateData, vscode.ConfigurationTarget.Global);
            }
            catch (error) {
                this.handleError('Failed to persist states', error);
            }
        }
        async loadPersistedStates() {
            try {
                const stateData = vscode.workspace.getConfiguration().get(this.storageKey) || [];
                for (const data of stateData) {
                    if (data.modelId && data.state) {
                        this.stateMap.set(data.modelId, data.state);
                        if (data.history) {
                            this.stateHistory.set(data.modelId, data.history);
                        }
                    }
                }
            }
            catch (error) {
                this.handleError('Failed to load persisted states', error);
            }
        }
        logStateChange(modelId, oldState, newState) {
            this.outputChannel.appendLine('\nModel State Change:');
            this.outputChannel.appendLine(`Model: ${modelId}`);
            this.outputChannel.appendLine(`Previous State: ${oldState || 'initial'}`);
            this.outputChannel.appendLine(`New State: ${newState}`);
            this.outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
        }
        handleError(message, error) {
            this.logger.error('[ModelStateManager]', message, error);
            this.emit('error', error);
            this.outputChannel.appendLine(`\nError: ${message}`);
            this.outputChannel.appendLine(error.stack || error.message);
        }
        dispose() {
            this.outputChannel.dispose();
            this.removeAllListeners();
            this.stateMap.clear();
            this.stateHistory.clear();
        }
    };
    return ModelStateManager = _classThis;
})();
exports.ModelStateManager = ModelStateManager;
//# sourceMappingURL=ModelStateManager.js.map