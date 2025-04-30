import * as vscode from 'vscode';
import { ServiceRegistry } from './services/ServiceRegistry';
export declare function activate(context: vscode.ExtensionContext): Promise<{
    serviceRegistry: ServiceRegistry;
}>;
export declare function deactivate(): void;
