import { IDisposable } from '../types';
type CommandHandler = (args: any) => Promise<any>;
export declare class CommandParser implements IDisposable {
    private static instance;
    private workspaceManager;
    private logger;
    private commands;
    private constructor();
    static resetInstance(): void;
    static getInstance(): CommandParser;
    registerCommand(name: string, handler: CommandHandler): void;
    parseAndExecute(command: string): Promise<any>;
    parseCommand(command: string): {
        name: string;
        args: any;
    } | null;
    parseArgs(argsString: string): any;
    createFile(args: any): Promise<void>;
    modifyFile(args: any): Promise<void>;
    deleteFile(args: any): Promise<void>;
    dispose(): void;
    private escapeRegExp;
}
export {};
