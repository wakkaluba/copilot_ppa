import * as vscode from 'vscode';

export interface IService extends vscode.Disposable {
    initialize(): Promise<void>;
}

export interface IConfigService extends IService {
    getConfig(): any;
    updateConfig<T>(section: string, value: T, configTarget?: vscode.ConfigurationTarget): Promise<void>;
}

export interface IStatusBarService extends IService {
    show(): Promise<void>;
    hide(): Promise<void>;
    update(message: string): void;
}

export interface ICommandService extends IService {
    registerCommands(): Promise<void>;
}

export interface ITelemetryService extends IService {
    trackEvent(eventName: string, properties?: { [key: string]: string }): void;
    trackError(error: Error, properties?: { [key: string]: string }): void;
}

export interface IServiceContainer extends IService {
    get<T>(serviceIdentifier: symbol): T;
    register<T>(serviceIdentifier: symbol, instance: T): void;
}

export const Services = {
    Config: Symbol('Config'),
    StatusBar: Symbol('StatusBar'),
    Commands: Symbol('Commands'),
    Telemetry: Symbol('Telemetry'),
    Logger: Symbol('Logger'),
    ModelService: Symbol('ModelService'),
    ChatService: Symbol('ChatService'),
    CacheService: Symbol('CacheService')
};
