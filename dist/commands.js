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
exports.CommandManager = void 0;
const vscode = __importStar(require("vscode"));
const modelService_1 = require("./llm/modelService");
const AgentCommandService_1 = require("./services/commands/AgentCommandService");
const ConfigurationCommandService_1 = require("./services/commands/ConfigurationCommandService");
const VisualizationCommandService_1 = require("./services/commands/VisualizationCommandService");
const MenuCommandService_1 = require("./services/commands/MenuCommandService");
const ErrorHandler_1 = require("./services/error/ErrorHandler");
class CommandManager {
    constructor(context, configManager) {
        this.context = context;
        this.configManager = configManager;
        this._modelService = new modelService_1.ModelService(context);
        this._registeredCommands = new Map();
        // Initialize services
        this.errorHandler = new ErrorHandler_1.ErrorHandler();
        this.agentService = new AgentCommandService_1.AgentCommandService(this._modelService, this.errorHandler);
        this.configService = new ConfigurationCommandService_1.ConfigurationCommandService(this._modelService, this.configManager, this.errorHandler);
        this.visualizationService = new VisualizationCommandService_1.VisualizationCommandService(context, this.errorHandler);
        this.menuService = new MenuCommandService_1.MenuCommandService(this.agentService, this.configService, this.visualizationService, this.errorHandler);
        // Add services to disposables
        context.subscriptions.push(this.errorHandler);
    }
    async initialize() {
        await this.registerCommands();
    }
    registerCommand(command, handler) {
        this._registeredCommands.set(command, handler);
        const disposable = vscode.commands.registerCommand(command, handler.execute);
        this.context.subscriptions.push(disposable);
    }
    async registerCommands() {
        // Agent commands
        this.registerCommand('copilot-ppa.startAgent', { execute: this.agentService.startAgent.bind(this.agentService) });
        this.registerCommand('copilot-ppa.stopAgent', { execute: this.agentService.stopAgent.bind(this.agentService) });
        this.registerCommand('copilot-ppa.restartAgent', { execute: this.agentService.restartAgent.bind(this.agentService) });
        // Configuration commands
        this.registerCommand('copilot-ppa.configureModel', { execute: this.configService.configureModel.bind(this.configService) });
        this.registerCommand('copilot-ppa.clearConversation', { execute: this.configService.clearConversation.bind(this.configService) });
        // Menu commands
        this.registerCommand('copilot-ppa.openMenu', { execute: this.menuService.openMenu.bind(this.menuService) });
        this.registerCommand('copilot-ppa.showMetrics', { execute: this.visualizationService.showMetrics.bind(this.visualizationService) });
        // Visualization commands
        this.registerCommand('copilot-ppa.showMemoryVisualization', { execute: this.visualizationService.showMemoryVisualization.bind(this.visualizationService) });
        this.registerCommand('copilot-ppa.showPerformanceMetrics', { execute: this.visualizationService.showPerformanceMetrics.bind(this.visualizationService) });
        this.registerCommand('copilot-ppa.exportMetrics', { execute: this.visualizationService.exportMetrics.bind(this.visualizationService) });
    }
    // ICommandService implementation - delegate to specialized services
    async startAgent() {
        await this.agentService.startAgent();
    }
    async stopAgent() {
        await this.agentService.stopAgent();
    }
    async restartAgent() {
        await this.agentService.restartAgent();
    }
    async configureModel() {
        await this.configService.configureModel();
    }
    async clearConversation() {
        await this.configService.clearConversation();
    }
    async openMenu() {
        await this.menuService.openMenu();
    }
    async showMetrics() {
        await this.visualizationService.showMetrics();
    }
    async showMemoryVisualization() {
        await this.visualizationService.showMemoryVisualization();
    }
    async showPerformanceMetrics() {
        await this.visualizationService.showPerformanceMetrics();
    }
    async exportMetrics() {
        await this.visualizationService.exportMetrics();
    }
    dispose() {
        this._modelService.dispose();
        this._registeredCommands.clear();
    }
}
exports.CommandManager = CommandManager;
//# sourceMappingURL=commands.js.map