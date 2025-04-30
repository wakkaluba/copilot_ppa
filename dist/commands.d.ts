import * as vscode from 'vscode';
import { ConfigManager } from './config';
import { ICommandService } from './services/interfaces';
interface CommandHandler {
    execute: (...args: any[]) => Promise<void>;
}
export declare class CommandManager implements ICommandService {
    private readonly context;
    private readonly configManager;
    private readonly _modelService;
    private readonly _registeredCommands;
    private readonly errorHandler;
    private readonly agentService;
    private readonly configService;
    private readonly visualizationService;
    private readonly menuService;
    constructor(context: vscode.ExtensionContext, configManager: ConfigManager);
    initialize(): Promise<void>;
    registerCommand(command: string, handler: CommandHandler): void;
    registerCommands(): Promise<void>;
    startAgent(): Promise<void>;
    stopAgent(): Promise<void>;
    restartAgent(): Promise<void>;
    configureModel(): Promise<void>;
    clearConversation(): Promise<void>;
    openMenu(): Promise<void>;
    showMetrics(): Promise<void>;
    showMemoryVisualization(): Promise<void>;
    showPerformanceMetrics(): Promise<void>;
    exportMetrics(): Promise<void>;
    dispose(): void;
}
export {};
