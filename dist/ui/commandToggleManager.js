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
exports.CommandToggleManager = void 0;
const vscode = __importStar(require("vscode"));
const ToggleStateService_1 = require("./services/ToggleStateService");
const ToggleStorageService_1 = require("./services/ToggleStorageService");
const ToggleConfigurationService_1 = require("./services/ToggleConfigurationService");
const ToggleOperationsService_1 = require("./services/ToggleOperationsService");
class CommandToggleManager {
    constructor(context) {
        this._onToggleChange = new vscode.EventEmitter();
        this.onToggleChange = this._onToggleChange.event;
        this.configService = new ToggleConfigurationService_1.ToggleConfigurationService();
        this.storageService = new ToggleStorageService_1.ToggleStorageService(context);
        this.stateService = new ToggleStateService_1.ToggleStateService(this.configService.getAvailableToggles());
        this.operationsService = new ToggleOperationsService_1.ToggleOperationsService(this.stateService, this.storageService, this._onToggleChange);
        this.initialize();
    }
    static getInstance(context) {
        if (!CommandToggleManager.instance) {
            CommandToggleManager.instance = new CommandToggleManager(context);
        }
        return CommandToggleManager.instance;
    }
    async initialize() {
        const storedStates = await this.storageService.loadToggleStates();
        this.stateService.initializeStates(storedStates);
    }
    getToggleState(id) {
        return this.stateService.getState(id);
    }
    async setToggleState(id, state) {
        if (!this.configService.isToggleAvailable(id)) {
            throw new Error(`Toggle with ID "${id}" is not available`);
        }
        await this.operationsService.setState(id, state);
    }
    async toggleState(id) {
        return this.operationsService.toggleState(id);
    }
    getAllToggles() {
        const availableToggles = this.configService.getAvailableToggles();
        return Object.entries(availableToggles).map(([id, config]) => ({
            id,
            label: config.label,
            description: config.description,
            state: this.getToggleState(id)
        }));
    }
    async resetToggles() {
        await this.operationsService.resetToggles();
    }
    getActiveTogglesPrefix() {
        return this.operationsService.getActivePrefix();
    }
}
exports.CommandToggleManager = CommandToggleManager;
//# sourceMappingURL=commandToggleManager.js.map