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
exports.ExtensionAPI = void 0;
const vscode = __importStar(require("vscode"));
const ExtensionAccessService_1 = require("./ExtensionAccessService");
class ExtensionAPI {
    accessService;
    constructor(context) {
        this.accessService = new ExtensionAccessService_1.ExtensionAccessService(context);
    }
    async executeCommand(extensionId, command, ...args) {
        if (!await this.ensurePermission(extensionId, 'execute')) {
            throw new Error('Permission denied: execute');
        }
        return vscode.commands.executeCommand(command, ...args);
    }
    async readConfiguration(extensionId, section) {
        if (!await this.ensurePermission(extensionId, 'read')) {
            throw new Error('Permission denied: read');
        }
        return vscode.workspace.getConfiguration(section).get(section);
    }
    async updateConfiguration(extensionId, section, value) {
        if (!await this.ensurePermission(extensionId, 'write')) {
            throw new Error('Permission denied: write');
        }
        await vscode.workspace.getConfiguration().update(section, value, vscode.ConfigurationTarget.Global);
    }
    async accessDebugFeatures(extensionId) {
        if (!await this.ensurePermission(extensionId, 'debug')) {
            throw new Error('Permission denied: debug');
        }
        return vscode.debug;
    }
    async ensurePermission(extensionId, permission) {
        if (this.accessService.hasPermission(extensionId, permission)) {
            return true;
        }
        return this.accessService.requestAccess(extensionId, [permission]);
    }
    registerAPIProvider() {
        // Register the API for other extensions to consume
        return vscode.commands.registerCommand('copilot-ppa.getAPI', () => ({
            executeCommand: this.executeCommand.bind(this),
            readConfiguration: this.readConfiguration.bind(this),
            updateConfiguration: this.updateConfiguration.bind(this),
            accessDebugFeatures: this.accessDebugFeatures.bind(this)
        }));
    }
    dispose() {
        this.accessService.dispose();
    }
}
exports.ExtensionAPI = ExtensionAPI;
//# sourceMappingURL=ExtensionAPI.js.map