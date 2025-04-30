import { IDisposable } from '../../types';
export interface ICommandService extends IDisposable {
    initialize(): Promise<void>;
}
export interface ICodeStructureCommands extends ICommandService {
    analyzeCurrentFile(): Promise<void>;
    reorganizeCurrentFile(): Promise<void>;
}
export interface ICodeQualityCommands extends ICommandService {
    analyzeCurrentFile(): Promise<void>;
    optimizeCurrentFile(): Promise<void>;
}
export interface IConfigurationCommands extends ICommandService {
    start(): Promise<void>;
    configure(): Promise<void>;
    reset(): Promise<void>;
}
export interface ICommandResult<T = any> {
    success: boolean;
    data?: T;
    error?: Error;
}
