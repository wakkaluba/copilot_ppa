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
exports.LLMHostManager = void 0;
const events_1 = require("events");
const vscode = __importStar(require("vscode"));
const llm_1 = require("../../types/llm");
const LLMHostProcessService_1 = require("./services/LLMHostProcessService");
const LLMHostHealthMonitorService_1 = require("./services/LLMHostHealthMonitorService");
const LLMHostStateService_1 = require("./services/LLMHostStateService");
const LLMHostErrorHandlerService_1 = require("./services/LLMHostErrorHandlerService");
class LLMHostManager extends events_1.EventEmitter {
    static instance;
    outputChannel;
    processService;
    healthMonitorService;
    stateService;
    errorHandlerService;
    constructor() {
        super();
        this.outputChannel = vscode.window.createOutputChannel('LLM Host');
        this.processService = new LLMHostProcessService_1.LLMHostProcessService(this.outputChannel);
        this.healthMonitorService = new LLMHostHealthMonitorService_1.LLMHostHealthMonitorService(this.outputChannel);
        this.stateService = new LLMHostStateService_1.LLMHostStateService();
        this.errorHandlerService = new LLMHostErrorHandlerService_1.LLMHostErrorHandlerService(this.outputChannel);
        this.setupEventListeners();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LLMHostManager();
        }
        return this.instance;
    }
    get state() {
        return this.stateService.getCurrentState();
    }
    async startHost(config) {
        try {
            if (this.state === llm_1.HostState.RUNNING) {
                return;
            }
            this.stateService.updateState(llm_1.HostState.STARTING);
            const process = await this.processService.startProcess(config);
            this.healthMonitorService.startMonitoring(process);
            this.stateService.updateState(llm_1.HostState.RUNNING);
        }
        catch (error) {
            this.errorHandlerService.handleError(error);
            throw error;
        }
    }
    async stopHost() {
        if (this.state === llm_1.HostState.STOPPED) {
            return;
        }
        try {
            this.healthMonitorService.stopMonitoring();
            await this.processService.stopProcess();
            this.stateService.updateState(llm_1.HostState.STOPPED);
            this.emit('stopped');
        }
        catch (error) {
            this.errorHandlerService.handleError(error);
            throw error;
        }
    }
    getProcessInfo() {
        if (this.state !== llm_1.HostState.RUNNING) {
            return null;
        }
        return this.processService.getProcessInfo();
    }
    isRunning() {
        return this.state === llm_1.HostState.RUNNING && this.processService.hasProcess();
    }
    setupEventListeners() {
        this.stateService.on('stateChanged', (event) => {
            this.emit('stateChanged', event);
        });
        this.errorHandlerService.on('error', (error) => {
            this.emit('error', error);
        });
        this.processService.on('processError', (error) => {
            this.errorHandlerService.handleError(error);
        });
        this.processService.on('processExit', (code) => {
            if (code !== 0) {
                this.errorHandlerService.handleError(new Error(`Process exited with code ${code}`));
            }
            this.stateService.updateState(llm_1.HostState.STOPPED);
        });
        this.healthMonitorService.on('healthError', (error) => {
            this.errorHandlerService.handleError(error);
        });
    }
    dispose() {
        this.stopHost().catch(console.error);
        this.outputChannel.dispose();
        this.healthMonitorService.dispose();
        this.processService.dispose();
        this.removeAllListeners();
    }
}
exports.LLMHostManager = LLMHostManager;
//# sourceMappingURL=LLMHostManager.js.map