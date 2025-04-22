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
exports.ConnectionStatusService = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class ConnectionStatusService extends events_1.EventEmitter {
    hostManager;
    connectionManager;
    _status = {
        state: 'disconnected',
        lastUpdate: new Date()
    };
    _onStatusChanged = new vscode.EventEmitter();
    onStatusChanged = this._onStatusChanged.event;
    constructor(hostManager, connectionManager) {
        super();
        this.hostManager = hostManager;
        this.connectionManager = connectionManager;
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.hostManager.on('stateChanged', (state) => {
            this.updateFromHostState(state);
        });
        this.connectionManager.on('stateChanged', (state) => {
            this.updateFromConnectionState(state);
        });
        this.connectionManager.on('error', (error) => {
            this.setStatus('error', error.message, error);
        });
    }
    updateFromHostState(hostState) {
        switch (hostState) {
            case 'RUNNING':
                // Only update if we're not already connected
                if (this._status.state !== 'connected') {
                    this.setStatus('connecting', 'LLM host is running, establishing connection...');
                }
                break;
            case 'STOPPED':
                this.setStatus('disconnected', 'LLM host is stopped');
                break;
            case 'ERROR':
                this.setStatus('error', 'LLM host encountered an error');
                break;
        }
    }
    updateFromConnectionState(connectionState) {
        switch (connectionState) {
            case 'CONNECTED':
                this.setStatus('connected', 'Connected to LLM service');
                break;
            case 'CONNECTING':
                this.setStatus('connecting', 'Establishing connection to LLM service...');
                break;
            case 'DISCONNECTED':
                this.setStatus('disconnected', 'Disconnected from LLM service');
                break;
            case 'ERROR':
                this.setStatus('error', 'Connection error');
                break;
        }
    }
    setStatus(state, message, error) {
        this._status = {
            state,
            message,
            error,
            lastUpdate: new Date()
        };
        this._onStatusChanged.fire(state);
        this.emit('statusChanged', this._status);
    }
    get status() {
        return this._status.state;
    }
    getFullStatus() {
        return { ...this._status };
    }
    dispose() {
        this._onStatusChanged.dispose();
        this.removeAllListeners();
    }
}
exports.ConnectionStatusService = ConnectionStatusService;
//# sourceMappingURL=connectionStatusService.js.map