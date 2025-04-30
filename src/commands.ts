import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { ErrorHandler } from './error/ErrorHandler';
import { CodeQualityService } from './services/codeQuality';
import { ConfigurationService } from './services/configuration/ConfigurationService';
import { StructureReorganizer } from './services/refactoring/structureReorganizer';
import { ServiceIdentifiers } from './services/ServiceRegistry';
import { IDisposable } from './types';
import { Logger } from './utils/logger';

export interface ICommand {
    id: string;
    handler: (...args: any[]) => Promise<any>;
    description?: string;
}

@injectable()
export class CommandManager implements IDisposable {
    private readonly _commands: Map<string, ICommand>;
    private readonly _logger: Logger;
    private readonly _disposables: IDisposable[];

    constructor(
        @inject('Context') private readonly context: ExtensionContext,
        @inject(ServiceIdentifiers.ErrorHandler) private readonly errorHandler: ErrorHandler,
        @inject(ServiceIdentifiers.StructureReorganizer) private readonly structureReorganizer: StructureReorganizer,
        @inject(ServiceIdentifiers.CodeQualityService) private readonly codeQualityService: CodeQualityService,
        @inject(ServiceIdentifiers.ConfigurationService) private readonly configService: ConfigurationService
    ) {
        this._commands = new Map();
        this._logger = Logger.for('CommandManager');
        this._disposables = [];
        this.registerCommands();
    }

    public registerCommand(command: ICommand): void {
        if (this._commands.has(command.id)) {
            this._logger.warn(`Command ${command.id} is already registered`);
            return;
        }

        const wrappedHandler = async (...args: any[]) => {
            try {
                await command.handler(...args);
            } catch (error) {
                this.errorHandler.handle(`Error executing command ${command.id}`, error);
            }
        };

        const disposable = this.context.subscriptions.push(
            vscode.commands.registerCommand(command.id, wrappedHandler)
        );
        this._commands.set(command.id, command);
        this._disposables.push({ dispose: () => disposable });
        this._logger.info(`Registered command: ${command.id}`);
    }

    private registerCommands(): void {
        // Core commands
        this.registerCommand({
            id: 'copilot-ppa.start',
            handler: () => this.configService.start(),
            description: 'Start Copilot PPA'
        });

        // Code structure commands
        this.registerCommand({
            id: 'copilot-ppa.analyzeStructure',
            handler: () => this.structureReorganizer.analyzeCurrentFile(),
            description: 'Analyze code structure'
        });

        this.registerCommand({
            id: 'copilot-ppa.reorganizeStructure',
            handler: () => this.structureReorganizer.reorganizeCurrentFile(),
            description: 'Reorganize code structure'
        });

        // Code quality commands
        this.registerCommand({
            id: 'copilot-ppa.analyzeCodeQuality',
            handler: () => this.codeQualityService.analyzeCurrentFile(),
            description: 'Analyze code quality'
        });

        this.registerCommand({
            id: 'copilot-ppa.optimizeCode',
            handler: () => this.codeQualityService.optimizeCurrentFile(),
            description: 'Optimize code quality'
        });

        // Configuration commands
        this.registerCommand({
            id: 'copilot-ppa.configure',
            handler: () => this.configService.configure(),
            description: 'Configure Copilot PPA'
        });

        this.registerCommand({
            id: 'copilot-ppa.resetConfig',
            handler: () => this.configService.reset(),
            description: 'Reset configuration'
        });

        // Confirmation settings commands
        this.registerCommand({
            id: 'copilot-ppa.openConfirmationSettings',
            handler: () => {
                const { ConfirmationSettingsPanel } = require('./webviews/ConfirmationSettingsPanel');
                ConfirmationSettingsPanel.createOrShow(this.context.extensionUri);
            },
            description: 'Open confirmation settings panel'
        });

        this.registerCommand({
            id: 'copilot-ppa.resetConfirmationSettings',
            handler: async () => {
                const { UserConfirmationService } = require('./services/UserConfirmationService');
                try {
                    const confirmationService = UserConfirmationService.getInstance();
                    // Reset all confirmation types
                    await confirmationService.enableConfirmation('file');
                    await confirmationService.enableConfirmation('workspace');
                    await confirmationService.enableConfirmation('process');
                    await confirmationService.enableConfirmation('other');

                    vscode.window.showInformationMessage('All confirmation settings have been reset');
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to reset confirmation settings: ${error}`);
                }
            },
            description: 'Reset all confirmation settings'
        });

        this._logger.info('All commands registered successfully');
    }

    public async dispose(): Promise<void> {
        try {
            for (const disposable of this._disposables) {
                await disposable.dispose();
            }
            this._disposables.length = 0;
            this._commands.clear();
            this._logger.info('CommandManager disposed successfully');
        } catch (error) {
            this._logger.error('Error disposing CommandManager', error);
            throw error;
        }
    }
}
