import * as vscode from 'vscode';
import { WorkspaceManager } from './WorkspaceManager';

export interface Command {
    name: string;
    args: Record<string, any>;
    context?: vscode.ExtensionContext;
}

export class CommandParser {
    private static instance: CommandParser;
    private readonly commands: Map<string, (args: any) => Promise<void>>;
    private workspaceManager: WorkspaceManager;

    private constructor() {
        this.commands = new Map();
        this.workspaceManager = WorkspaceManager.getInstance();
        this.registerDefaultCommands();
    }

    static getInstance(): CommandParser {
        if (!this.instance) {
            this.instance = new CommandParser();
        }
        return this.instance;
    }

    private registerDefaultCommands(): void {
        this.registerCommand('createFile', this.createFile.bind(this));
        this.registerCommand('modifyFile', this.modifyFile.bind(this));
        this.registerCommand('deleteFile', this.deleteFile.bind(this));
        this.registerCommand('analyze', this.analyzeCode.bind(this));
        this.registerCommand('explain', this.explainCode.bind(this));
        this.registerCommand('suggest', this.suggestImprovements.bind(this));
    }

    registerCommand(name: string, handler: (args: any) => Promise<void>): void {
        this.commands.set(name, handler);
    }

    async parseAndExecute(input: string): Promise<void> {
        const command = this.parseCommand(input);
        if (!command) {
            throw new Error('Invalid command format');
        }

        const handler = this.commands.get(command.name);
        if (!handler) {
            throw new Error(`Unknown command: ${command.name}`);
        }

        await handler(command.args);
    }

    private parseCommand(input: string): Command | null {
        try {
            // Format: #command(arg1="value1", arg2="value2")
            const match = input.match(/^#(\w+)\((.*)\)$/);
            if (!match) return null;

            const [, name, argsString] = match;
            const args = this.parseArgs(argsString);

            return { name, args };
        } catch {
            return null;
        }
    }

    private parseArgs(argsString: string): Record<string, any> {
        const args: Record<string, any> = {};
        const matches = argsString.match(/(\w+)="([^"]*?)"/g) || [];

        for (const match of matches) {
            const [key, value] = match.split('=');
            args[key] = value.replace(/^"|"$/g, '');
        }

        return args;
    }

    private async createFile(args: { path: string; content: string }): Promise<void> {
        await this.workspaceManager.writeFile(args.path, args.content);
    }

    private async modifyFile(args: { path: string; changes: string }): Promise<void> {
        const content = await this.workspaceManager.readFile(args.path);
        // TODO: Implement smart content merging
        await this.workspaceManager.writeFile(args.path, args.changes);
    }

    private async deleteFile(args: { path: string }): Promise<void> {
        await this.workspaceManager.deleteFile(args.path);
    }

    private async analyzeCode(args: { path: string }): Promise<void> {
        // TODO: Implement code analysis
    }

    private async explainCode(args: { code: string }): Promise<void> {
        // TODO: Implement code explanation
    }

    private async suggestImprovements(args: { code: string }): Promise<void> {
        // TODO: Implement improvement suggestions
    }
}
