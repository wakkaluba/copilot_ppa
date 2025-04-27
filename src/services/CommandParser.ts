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
    private readonly agentCommands: Map<string, (args: any) => Promise<void>>;
    private workspaceManager: WorkspaceManager;

    private constructor() {
        this.commands = new Map();
        this.agentCommands = new Map();
        this.workspaceManager = WorkspaceManager.getInstance();
        this.registerDefaultCommands();
        this.registerDefaultAgentCommands();
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

    private registerDefaultAgentCommands(): void {
        this.registerAgentCommand('Continue', this.continueIteration.bind(this));
    }

    registerCommand(name: string, handler: (args: any) => Promise<void>): void {
        this.commands.set(name, handler);
    }

    registerAgentCommand(name: string, handler: (args: any) => Promise<void>): void {
        this.agentCommands.set(name.toLowerCase(), handler);
    }

    async parseAndExecute(input: string): Promise<void> {
        // Try to parse as a standard #command
        const command = this.parseCommand(input);
        if (command) {
            const handler = this.commands.get(command.name);
            if (!handler) {
                throw new Error(`Unknown command: ${command.name}`);
            }
            await handler(command.args);
            return;
        }

        // Try to parse as an @agent command
        const agentCommand = this.parseAgentCommand(input);
        if (agentCommand) {
            const handler = this.agentCommands.get(agentCommand.name.toLowerCase());
            if (!handler) {
                throw new Error(`Unknown agent command: ${agentCommand.name}`);
            }
            await handler(agentCommand.args);
            return;
        }

        throw new Error('Invalid command format');
    }

    private parseCommand(input: string): Command | null {
        try {
            // Format: /command arg1="value1" arg2="value2"
            const match = input.match(/^\/(\w+)(?:\s+(.*))?$/);
            if (!match) {
                // Fallback to old format: #command(arg1="value1", arg2="value2")
                const oldFormatMatch = input.match(/^#(\w+)\((.*)\)$/);
                if (!oldFormatMatch) {return null;}
                
                const [, name, argsString] = oldFormatMatch;
                const args = this.parseArgs(argsString);
                return { name, args };
            }

            const [, name, argsString] = match;
            const args = argsString ? this.parseArgs(argsString) : {};
            return { name, args };
        } catch {
            return null;
        }
    }

    private parseAgentCommand(input: string): Command | null {
        try {
            // Format: @agent Command(arg1="value1", arg2="value2")
            // Or simply: @agent Command
            const match = input.match(/^@agent\s+(\w+)(?:\((.*)\))?$/i);
            if (!match) {return null;}

            const [, name, argsString] = match;
            const args = argsString ? this.parseArgs(argsString) : {};

            return { name, args };
        } catch {
            return null;
        }
    }

    private parseArgs(argsString: string): Record<string, any> {
        if (!argsString || argsString.trim() === '') {
            return {};
        }

        const args: Record<string, any> = {};
        
        // Match arguments in format key="value" or key=value
        const argPairs = argsString.match(/(\w+)=(?:"([^"]*)"|(true|false|[-+]?[0-9]*\.?[0-9]+))/g) || [];
        
        for (const pair of argPairs) {
            const [key, rawValue] = pair.split('=');
            if (!key || rawValue === undefined) continue;
            
            let value: any;
            
            // Handle quoted string values
            if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
                value = rawValue.slice(1, -1);
            } 
            // Handle boolean values
            else if (rawValue === 'true' || rawValue === 'false') {
                value = rawValue === 'true';
            } 
            // Handle numeric values
            else if (!isNaN(Number(rawValue))) {
                value = Number(rawValue);
            } 
            // Default to string
            else {
                value = rawValue;
            }
            
            args[key] = value;
        }
        
        // Handle simple boolean flags (key without a value)
        const booleanFlags = argsString.match(/\b(\w+)\b(?!\s*=)/g) || [];
        for (const flag of booleanFlags) {
            if (!args.hasOwnProperty(flag)) {
                args[flag] = true;
            }
        }
        
        return args;
    }

    private async createFile(args: { path: string; content: string }): Promise<void> {
        await this.workspaceManager.writeFile(vscode.Uri.file(args.path), args.content);
    }

    private async modifyFile(args: { path: string; changes: string }): Promise<void> {
        const content = await this.workspaceManager.readFile(vscode.Uri.file(args.path));
        // TODO: Implement smart content merging
        await this.workspaceManager.writeFile(vscode.Uri.file(args.path), args.changes);
    }

    private async deleteFile(args: { path: string }): Promise<void> {
        await this.workspaceManager.deleteFile(vscode.Uri.file(args.path));
    }

    private async analyzeCode(_args: { path: string }): Promise<void> {
        // TODO: Implement code analysis
    }

    private async explainCode(_args: { code: string }): Promise<void> {
        // TODO: Implement code explanation
    }

    private async suggestImprovements(_args: { code: string }): Promise<void> {
        // TODO: Implement improvement suggestions
    }

    private async continueIteration(args: any): Promise<void> {
        // Show the "Continue to iterate?" prompt
        const response = await vscode.window.showInformationMessage(
            'Continue to iterate?',
            { modal: false },
            'Yes',
            'No'
        );

        if (response === 'Yes') {
            // Get the CoreAgent instance directly since we're in the same extension
            const CoreAgent = require('./CoreAgent').CoreAgent;
            const coreAgent = CoreAgent.getInstance();
            
            try {
                // If we have a continueCodingIteration method, call it
                if (coreAgent && typeof coreAgent.continueCodingIteration === 'function') {
                    await coreAgent.continueCodingIteration();
                } else {
                    // Otherwise, just show a message that we're continuing
                    await vscode.window.showInformationMessage('Continuing iteration process...');
                    // You can add additional logic here for what happens when continuing
                }
            } catch (error) {
                console.error('Error during continue iteration:', error);
                await vscode.window.showErrorMessage(`Failed to continue iteration: ${error instanceof Error ? error.message : String(error)}`);
            }
        } else {
            // User chose not to continue
            await vscode.window.showInformationMessage('Iteration stopped.');
        }
    }
}
