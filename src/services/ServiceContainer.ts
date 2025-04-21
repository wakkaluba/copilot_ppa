import * as vscode from 'vscode';
import { LoggingService } from '../utils/logging';
import { IServiceContainer, Services } from './interfaces';
import { ConfigManager } from '../config';
import { StatusBarManager } from '../statusBar';
import { CommandManager } from '../commands';
import { TelemetryService } from './../utils/telemetry';

export class ServiceContainer implements IServiceContainer {
    private static instance: ServiceContainer;
    private services: Map<symbol, any> = new Map();
    private initialized = false;

    private constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly logging: LoggingService
    ) {}

    static async initialize(context: vscode.ExtensionContext, logging: LoggingService): Promise<ServiceContainer> {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer(context, logging);
            await ServiceContainer.instance.initializeServices();
        }
        return ServiceContainer.instance;
    }

    private async initializeServices(): Promise<void> {
        if (this.initialized) return;

        this.logging.log('Initializing core services');

        // Initialize core services
        const config = new ConfigManager(this.context);
        const statusBar = new StatusBarManager(this.context);
        const commands = new CommandManager(this.context, config);
        const telemetry = new TelemetryService();

        // Register services
        this.register(Services.Config, config);
        this.register(Services.StatusBar, statusBar);
        this.register(Services.Commands, commands);
        this.register(Services.Telemetry, telemetry);

        // Initialize services
        await Promise.all([
            config.initialize(),
            statusBar.initialize(),
            commands.initialize(),
            telemetry.initialize()
        ]);

        this.initialized = true;
    }

    get<T>(serviceIdentifier: symbol): T {
        const service = this.services.get(serviceIdentifier);
        if (!service) {
            throw new Error(`Service not found: ${serviceIdentifier.toString()}`);
        }
        return service as T;
    }

    register<T>(serviceIdentifier: symbol, instance: T): void {
        this.services.set(serviceIdentifier, instance);
    }

    async initialize(): Promise<void> {
        await this.initializeServices();
    }

    dispose(): void {
        for (const service of this.services.values()) {
            if (service && typeof service.dispose === 'function') {
                service.dispose();
            }
        }
        this.services.clear();
    }
}