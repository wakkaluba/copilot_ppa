import * as vscode from 'vscode';
import { LoggingService } from '../utils/logging';
import { IServiceContainer } from './interfaces';
export declare class ServiceContainer implements IServiceContainer {
    private readonly context;
    private readonly logging;
    private static instance;
    private services;
    private initialized;
    private constructor();
    static initialize(context: vscode.ExtensionContext, logging: LoggingService): Promise<ServiceContainer>;
    private initializeServices;
    get<T>(serviceIdentifier: symbol): T;
    register<T>(serviceIdentifier: symbol, instance: T): void;
    initialize(): Promise<void>;
    dispose(): void;
}
