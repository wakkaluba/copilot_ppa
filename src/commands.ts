import * as vscode from 'vscode';
import { ModelService } from './llm/modelService';
import { ConfigManager } from './config';
import { ICommandService } from './services/interfaces';
import { AgentCommandService } from './services/commands/AgentCommandService';
import { ConfigurationCommandService } from './services/commands/ConfigurationCommandService';
import { VisualizationCommandService } from './services/commands/VisualizationCommandService';
import { MenuCommandService } from './services/commands/MenuCommandService';
import { ErrorHandler } from './services/error/ErrorHandler';

interface CommandHandler {
    execute: (...args: any[]) => Promise<void>;
}

export class CommandManager implements ICommandService {
    private readonly _modelService: ModelService;
    private readonly _registeredCommands: Map<string, CommandHandler>;
    private readonly errorHandler: ErrorHandler;
    private readonly agentService: AgentCommandService;
    private readonly configService: ConfigurationCommandService;
    private readonly visualizationService: VisualizationCommandService;
    private readonly menuService: MenuCommandService;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly configManager: ConfigManager
    ) {
        this._modelService = new ModelService(context);
        this._registeredCommands = new Map();
        
        // Initialize services
        this.errorHandler = new ErrorHandler();
        this.agentService = new AgentCommandService(this._modelService, this.errorHandler);
        this.configService = new ConfigurationCommandService(this._modelService, this.configManager, this.errorHandler);
        this.visualizationService = new VisualizationCommandService(context, this.errorHandler);
        this.menuService = new MenuCommandService(
            this.agentService,
            this.configService,
            this.visualizationService,
            this.errorHandler
        );

        // Add services to disposables
        context.subscriptions.push(this.errorHandler);
    }

    async initialize(): Promise<void> {
        await this.registerCommands();
    }

    registerCommand(command: string, handler: CommandHandler): void {
        this._registeredCommands.set(command, handler);
        const disposable = vscode.commands.registerCommand(command, handler.execute);
        this.context.subscriptions.push(disposable);
    }

    async registerCommands(): Promise<void> {
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
    async startAgent(): Promise<void> {
        await this.agentService.startAgent();
    }

    async stopAgent(): Promise<void> {
        await this.agentService.stopAgent();
    }

    async restartAgent(): Promise<void> {
        await this.agentService.restartAgent();
    }

    async configureModel(): Promise<void> {
        await this.configService.configureModel();
    }

    async clearConversation(): Promise<void> {
        await this.configService.clearConversation();
    }

    async openMenu(): Promise<void> {
        await this.menuService.openMenu();
    }

    async showMetrics(): Promise<void> {
        await this.visualizationService.showMetrics();
    }

    async showMemoryVisualization(): Promise<void> {
        await this.visualizationService.showMemoryVisualization();
    }

    async showPerformanceMetrics(): Promise<void> {
        await this.visualizationService.showPerformanceMetrics();
    }

    async exportMetrics(): Promise<void> {
        await this.visualizationService.exportMetrics();
    }

    dispose(): void {
        this._modelService.dispose();
        this._registeredCommands.clear();
    }
}
