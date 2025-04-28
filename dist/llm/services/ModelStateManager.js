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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelStateManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const logging_1 = require("../../common/logging");
const IPersistenceService_1 = require("../interfaces/IPersistenceService");
let ModelStateManager = class ModelStateManager extends events_1.EventEmitter {
    constructor(logger, persistence) {
        super();
        this.logger = logger;
        this.persistence = persistence;
        this.stateMap = new Map();
        this.stateHistory = new Map();
        this.maxHistorySize = 1000;
        this.storageKey = 'model-states';
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
        if (!state) {
            return undefined;
        }
        return {
            modelId,
            state,
            timestamp: new Date(),
            transitions: this.getStateHistory(modelId)
        };
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
            await this.persistence.saveData(this.storageKey, stateData);
        }
        catch (error) {
            this.handleError('Failed to persist states', error);
        }
    }
    async loadPersistedStates() {
        try {
            const stateData = await this.persistence.loadData(this.storageKey) || [];
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
    trackStateTransition(modelId, oldState, newState) {
        const history = this.stateHistory.get(modelId) || [];
        const transition = {
            from: oldState || 'initial',
            to: newState,
            timestamp: new Date()
        };
        history.push(transition);
        if (history.length > this.maxHistorySize) {
            history.shift(); // Remove oldest entry
        }
        this.stateHistory.set(modelId, history);
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
exports.ModelStateManager = ModelStateManager;
exports.ModelStateManager = ModelStateManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
    __param(1, (0, inversify_1.inject)(IPersistenceService_1.IPersistenceService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof IPersistenceService_1.IPersistenceService !== "undefined" && IPersistenceService_1.IPersistenceService) === "function" ? _b : Object])
], ModelStateManager);
//# sourceMappingURL=ModelStateManager.js.map