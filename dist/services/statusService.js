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
exports.StatusService = exports.ConnectionStatus = void 0;
const vscode = __importStar(require("vscode"));
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["Disconnected"] = "disconnected";
    ConnectionStatus["Connecting"] = "connecting";
    ConnectionStatus["Connected"] = "connected";
    ConnectionStatus["Error"] = "error";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
/**
 * Service to track and notify about LLM connection status
 */
class StatusService {
    constructor() {
        this._statusEventEmitter = new vscode.EventEmitter();
        this._currentStatus = { status: ConnectionStatus.Disconnected };
    }
    static getInstance() {
        if (!StatusService.instance) {
            StatusService.instance = new StatusService();
        }
        return StatusService.instance;
    }
    get onStatusChange() {
        return this._statusEventEmitter.event;
    }
    get currentStatus() {
        return this._currentStatus;
    }
    updateStatus(status) {
        this._currentStatus = status;
        this._statusEventEmitter.fire(status);
    }
    setConnecting(providerName) {
        this.updateStatus({
            status: ConnectionStatus.Connecting,
            message: `Connecting to ${providerName}...`,
            providerName
        });
    }
    setConnected(providerName, modelName) {
        this.updateStatus({
            status: ConnectionStatus.Connected,
            message: `Connected to ${modelName} via ${providerName}`,
            providerName,
            modelName
        });
    }
    setDisconnected() {
        this.updateStatus({
            status: ConnectionStatus.Disconnected,
            message: 'Disconnected from LLM'
        });
    }
    setError(errorMessage, providerName) {
        this.updateStatus({
            status: ConnectionStatus.Error,
            message: `Error: ${errorMessage}`,
            providerName
        });
    }
}
exports.StatusService = StatusService;
//# sourceMappingURL=statusService.js.map