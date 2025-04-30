import * as vscode from 'vscode';
import { IDisposable } from '../types';
export declare class WorkspaceManager implements IDisposable {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): WorkspaceManager;
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<void>;
    deleteFile(filePath: string): Promise<void>;
    createDirectory(dirPath: string): Promise<void>;
    listFiles(dirPath: string): Promise<string[]>;
    resolveFilePath(filePath: string): string;
    fileExists(filePath: string): Promise<boolean>;
    findFiles(pattern: string): Promise<vscode.Uri[]>;
    getConfiguration(section: string): vscode.WorkspaceConfiguration;
    updateConfiguration(section: string, value: any, target?: vscode.ConfigurationTarget): Promise<void>;
    formatDocument(document: vscode.TextDocument): Promise<void>;
    parseTodoFile(content: string): string[];
    updateTodoFile(filePath: string, lines: string[]): Promise<void>;
    moveCompletedTasks(sourceFile: string, targetFile: string): Promise<void>;
    updateTaskStatus(filePath: string, lineNumber: number, completed: boolean): Promise<void>;
    dispose(): void;
}
