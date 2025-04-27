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
exports.TelemetryService = void 0;
const vscode = __importStar(require("vscode"));
class TelemetryService {
    constructor() {
        this._reporter = vscode.env.createTelemetryLogger({
            sendEventData: async (eventName, data) => {
                console.log(`[Telemetry] Event: ${eventName}`, data);
            },
            sendErrorData: async (error, data) => {
                console.error(`[Telemetry] Error: ${error.message}`, data);
            }
        });
    }
    async initialize() {
        return Promise.resolve();
    }
    trackEvent(eventName, properties) {
        this._reporter.logUsage(eventName, properties);
    }
    trackError(error, properties) {
        this._reporter.logError(error, properties);
    }
    dispose() {
        this._reporter.dispose();
    }
}
exports.TelemetryService = TelemetryService;
//# sourceMappingURL=telemetry.js.map