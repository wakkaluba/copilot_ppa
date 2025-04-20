import * as vscode from 'vscode';
import { LoggingService } from '../utils/logging';
import { ConfigManager } from '../config';
import { StatusBarManager } from '../statusBar';
import { CommandManager } from '../commands';
import { TelemetryService } from '../utils/telemetry';

export class ServiceContainer implements vscode.Disposable {
    private readonly _context: vscode.ExtensionContext;
    private readonly _logging: LoggingService;
    
    private _config?: ConfigManager;
    private _statusBar?: StatusBarManager;
    private _commands?: CommandManager;
    private _telemetry?: TelemetryService;

    private constructor(context: vscode.ExtensionContext, logging: LoggingService) {
        this._context = context;
        this._logging = logging;
    }

    static async initialize(context: vscode.ExtensionContext, logging: LoggingService): Promise<ServiceContainer> {
        const container = new ServiceContainer(context, logging);
        await container.initializeServices();
        return container;
    }

    static async createMinimalStatusBar(context: vscode.ExtensionContext): Promise<StatusBarManager> {
        const statusBar = new StatusBarManager(context);
        await statusBar.initialize();
        return statusBar;
    }

    private async initializeServices(): Promise<void> {
        this._telemetry = new TelemetryService(this._context);
        this._config = await this.initializeConfig();
        this._statusBar = await this.initializeStatusBar();
        this._commands = await this.initializeCommands();
    }

    async startServices(): Promise<void> {
        if (!this._config || !this._statusBar || !this._commands) {
            throw new Error('Services not properly initialized');
        }

        await this._statusBar.show();
        await this.handleFirstTimeActivation();
    }

    private async initializeConfig(): Promise<ConfigManager> {
        this._logging.log('Initializing configuration manager');
        const config = new ConfigManager(this._context);
        await config.initialize();
        return config;
    }

    private async initializeStatusBar(): Promise<StatusBarManager> {
        this._logging.log('Initializing status bar');
        const statusBar = new StatusBarManager(this._context);
        await statusBar.initialize();
        return statusBar;
    }

    private async initializeCommands(): Promise<CommandManager> {
        this._logging.log('Registering extension commands');
        if (!this._config) {
            throw new Error('Config manager not initialized');
        }
        
        const commandManager = new CommandManager(this._context, this._config);
        await commandManager.registerCommands();
        return commandManager;
    }

    private async handleFirstTimeActivation(): Promise<void> {
        const isFirstActivation = this._context.globalState.get('firstActivation', true);
        if (isFirstActivation) {
            this._logging.log('First time activation detected');
            await vscode.commands.executeCommand('copilot-ppa.showWelcomeMessage');
            await this._context.globalState.update('firstActivation', false);
        }
    }

    dispose(): void {
        this._commands?.dispose();
        this._statusBar?.dispose();
        this._config?.dispose();
        this._telemetry?.dispose();
    }

    // Service accessors
    get config(): ConfigManager {
        if (!this._config) throw new Error('Config manager not initialized');
        return this._config;
    }

    get statusBar(): StatusBarManager {
        if (!this._statusBar) throw new Error('Status bar not initialized');
        return this._statusBar;
    }

    get commands(): CommandManager {
        if (!this._commands) throw new Error('Command manager not initialized');
        return this._commands;
    }

    get telemetry(): TelemetryService {
        if (!this._telemetry) throw new Error('Telemetry service not initialized');
        return this._telemetry;
    }
}