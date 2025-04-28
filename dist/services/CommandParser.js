"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandParser = void 0;
/**
 * Parse and execute commands from text input
 */
class CommandParser {
    constructor(workspaceManager, logger) {
        this.commands = new Map();
        this.agentCommands = new Map();
        this.workspaceManager = workspaceManager;
        this.logger = logger;
        this.registerDefaultCommands();
        this.registerDefaultAgentCommands();
    }
    static getInstance(workspaceManager, logger) {
        if (!CommandParser.instance) {
            if (!workspaceManager || !logger) {
                throw new Error('WorkspaceManager and Logger required for initial CommandParser initialization');
            }
            CommandParser.instance = new CommandParser(workspaceManager, logger);
        }
        return CommandParser.instance;
    }
    // Add resetInstance method for testing purposes
    static resetInstance() {
        CommandParser.instance = undefined;
    }
    /**
     * Register default built-in commands
     */
    registerDefaultCommands() {
        this.registerCommand('createFile', async (args) => {
            if (!args.path || !args.content) {
                throw new Error('createFile requires path and content arguments');
            }
            await this.workspaceManager.writeFile(args.path, args.content);
            return `File ${args.path} created`;
        });
        this.registerCommand('modifyFile', async (args) => {
            if (!args.path || !args.find || args.replace === undefined) {
                throw new Error('modifyFile requires path, find, and replace arguments');
            }
            const content = await this.workspaceManager.readFile(args.path);
            const modified = content.replace(new RegExp(args.find, 'g'), args.replace);
            await this.workspaceManager.writeFile(args.path, modified);
            return `File ${args.path} modified`;
        });
        this.registerCommand('deleteFile', async (args) => {
            if (!args.path) {
                throw new Error('deleteFile requires a path argument');
            }
            await this.workspaceManager.deleteFile(args.path);
            return `File ${args.path} deleted`;
        });
    }
    /**
     * Register a custom command
     */
    registerCommand(name, handler) {
        this.commands.set(name, handler);
    }
    /**
     * Parse and execute a command string
     */
    async parseAndExecute(commandString) {
        // First check if it's an agent command
        const agentCommand = this.parseAgentCommand(commandString);
        if (agentCommand) {
            return this.executeAgentCommand(agentCommand);
        }
        // Otherwise treat it as a regular command
        const parsed = this.parseCommand(commandString);
        if (!parsed) {
            return null;
        }
        const command = this.commands.get(parsed.name);
        if (!command) {
            throw new Error(`Unknown command: ${parsed.name}`);
        }
        // Take the first args object if it's an array
        const argsToUse = Array.isArray(parsed.args) ? parsed.args[0] : parsed.args;
        return await command(argsToUse);
    }
    /**
     * Parse a command string into name and arguments
     */
    parseCommand(input) {
        // Basic command parsing regex
        const commandMatch = input.match(/^(\w+)\s*\((.*)\)$/);
        if (!commandMatch) {
            return null;
        }
        const name = commandMatch[1];
        const argsString = commandMatch[2];
        return {
            name,
            args: this.parseArgs(argsString)
        };
    }
    /**
     * Parse arguments string into object
     */
    parseArgs(argsString) {
        if (!argsString.trim()) {
            return [{}];
        }
        const result = {};
        // Match key-value pairs
        const regex = /(\w+)\s*=\s*(?:"([^"]*)"|(\d+(?:\.\d+)?)|(\w+))/g;
        let match;
        while ((match = regex.exec(argsString)) !== null) {
            const key = match[1];
            const stringValue = match[2];
            const numValue = match[3];
            const boolOrIdentifier = match[4];
            if (stringValue !== undefined) {
                result[key] = stringValue;
            }
            else if (numValue !== undefined) {
                result[key] = parseFloat(numValue);
            }
            else if (boolOrIdentifier) {
                if (boolOrIdentifier === 'true') {
                    result[key] = true;
                }
                else if (boolOrIdentifier === 'false') {
                    result[key] = false;
                }
                else {
                    result[key] = boolOrIdentifier;
                }
            }
        }
        return [result];
    }
    /**
     * Parse agent commands like @agent Continue
     */
    parseAgentCommand(input) {
        const match = input.match(/@agent\s+(\w+)(?:\s*:\s*(.*))?$/i);
        if (!match) {
            return null;
        }
        return match[1].toLowerCase();
    }
    /**
     * Execute agent-specific commands
     */
    async executeAgentCommand(command) {
        // This would be implemented to handle agent commands
        throw new Error(`Unknown agent command: ${command}`);
    }
    registerDefaultAgentCommands() {
        // Register default agent commands
        this.agentCommands.set('help', async () => {
            this.logger.log('Available agent commands:');
            this.agentCommands.forEach((_, command) => {
                this.logger.log(`- @agent ${command}`);
            });
        });
        // Add other default agent commands here
        this.agentCommands.set('clear', async () => {
            // Clear command implementation
            this.logger.log('Context cleared');
        });
    }
}
exports.CommandParser = CommandParser;
//# sourceMappingURL=CommandParser.js.map