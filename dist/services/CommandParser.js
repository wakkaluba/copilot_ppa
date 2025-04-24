"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandParser = void 0;
const vscode = __importStar(require("vscode"));
const WorkspaceManager_1 = require("./WorkspaceManager");
class CommandParser {
    static instance;
    commands;
    agentCommands;
    workspaceManager;
    constructor() {
        this.commands = new Map();
        this.agentCommands = new Map();
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
        this.registerDefaultCommands();
        this.registerDefaultAgentCommands();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new CommandParser();
        }
        return this.instance;
    }
    registerDefaultCommands() {
        this.registerCommand('createFile', this.createFile.bind(this));
        this.registerCommand('modifyFile', this.modifyFile.bind(this));
        this.registerCommand('deleteFile', this.deleteFile.bind(this));
        this.registerCommand('analyze', this.analyzeCode.bind(this));
        this.registerCommand('explain', this.explainCode.bind(this));
        this.registerCommand('suggest', this.suggestImprovements.bind(this));
    }
    registerDefaultAgentCommands() {
        this.registerAgentCommand('Continue', this.continueIteration.bind(this));
    }
    registerCommand(name, handler) {
        this.commands.set(name, handler);
    }
    registerAgentCommand(name, handler) {
        this.agentCommands.set(name.toLowerCase(), handler);
    }
    async parseAndExecute(input) {
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
    parseCommand(input) {
        try {
            // Format: #command(arg1="value1", arg2="value2")
            const match = input.match(/^#(\w+)\((.*)\)$/);
            if (!match) {
                return null;
            }
            const [, name, argsString] = match;
            const args = this.parseArgs(argsString);
            return { name, args };
        }
        catch {
            return null;
        }
    }
    parseAgentCommand(input) {
        try {
            // Format: @agent Command(arg1="value1", arg2="value2")
            // Or simply: @agent Command
            const match = input.match(/^@agent\s+(\w+)(?:\((.*)\))?$/i);
            if (!match) {
                return null;
            }
            const [, name, argsString] = match;
            const args = argsString ? this.parseArgs(argsString) : {};
            return { name, args };
        }
        catch {
            return null;
        }
    }
    parseArgs(argsString) {
        const args = {};
        const matches = argsString.match(/(\w+)="([^"]*?)"/g) || [];
        for (const match of matches) {
            const [keyWithEqual, valueWithQuotes] = match.split('=');
            if (keyWithEqual && valueWithQuotes) {
                const key = keyWithEqual.trim();
                const value = valueWithQuotes.replace(/^"|"$/g, '');
                args[key] = value;
            }
        }
        return args;
    }
    async createFile(args) {
        await this.workspaceManager.writeFile(args.path, args.content);
    }
    async modifyFile(args) {
        const content = await this.workspaceManager.readFile(args.path);
        // TODO: Implement smart content merging
        await this.workspaceManager.writeFile(args.path, args.changes);
    }
    async deleteFile(args) {
        await this.workspaceManager.deleteFile(args.path);
    }
    async analyzeCode(args) {
        // TODO: Implement code analysis
    }
    async explainCode(args) {
        // TODO: Implement code explanation
    }
    async suggestImprovements(args) {
        // TODO: Implement improvement suggestions
    }
    async continueIteration(args) {
        // Show the "Continue to iterate?" prompt
        const response = await vscode.window.showInformationMessage('Continue to iterate?', { modal: false }, 'Yes', 'No');
        if (response === 'Yes') {
            // Get the CoreAgent instance directly since we're in the same extension
            const CoreAgent = require('./CoreAgent').CoreAgent;
            const coreAgent = CoreAgent.getInstance();
            try {
                // If we have a continueCodingIteration method, call it
                if (coreAgent && typeof coreAgent.continueCodingIteration === 'function') {
                    await coreAgent.continueCodingIteration();
                }
                else {
                    // Otherwise, just show a message that we're continuing
                    await vscode.window.showInformationMessage('Continuing iteration process...');
                    // You can add additional logic here for what happens when continuing
                }
            }
            catch (error) {
                console.error('Error during continue iteration:', error);
                await vscode.window.showErrorMessage(`Failed to continue iteration: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        else {
            // User chose not to continue
            await vscode.window.showInformationMessage('Iteration stopped.');
        }
    }
}
exports.CommandParser = CommandParser;
//# sourceMappingURL=CommandParser.js.map