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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandParser = void 0;
const vscode = __importStar(require("vscode"));
const WorkspaceManager_1 = require("./WorkspaceManager");
/**
 * Parses and executes commands
 */
class CommandParser {
    /**
     * Private constructor to enforce singleton pattern
     */
    constructor() {
        this.commands = new Map();
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
        this.registerDefaultCommands();
    }
    /**
     * Get singleton instance of CommandParser
     */
    static getInstance() {
        if (!CommandParser.instance) {
            CommandParser.instance = new CommandParser();
        }
        return CommandParser.instance;
    }
    /**
     * Reset the singleton instance (for testing purposes)
     */
    static resetInstance() {
        CommandParser.instance = null;
    }
    /**
     * Parse and execute a command string
     * @param commandStr The command string to parse and execute
     * @returns The result of the command execution
     */
    async parseAndExecute(commandStr) {
        // Check for agent commands
        if (commandStr.startsWith('@agent ')) {
            const agentCommand = this.parseAgentCommand(commandStr);
            if (agentCommand) {
                const { name, message } = agentCommand;
                const command = this.commands.get(name.toLowerCase());
                if (command) {
                    return command.execute(message);
                }
                else {
                    throw new Error(`Unknown agent command: ${name}`);
                }
            }
            return null;
        }
        const parsedCommand = this.parseCommand(commandStr);
        if (!parsedCommand)
            return null;
        const { name, args } = parsedCommand;
        const command = this.commands.get(name);
        if (!command) {
            throw new Error(`Unknown command: ${name}`);
        }
        return command.execute(...(args || []));
    }
    /**
     * Register a new command
     * @param name Command name
     * @param handler Command handler function
     */
    registerCommand(name, handler) {
        this.commands.set(name, {
            name,
            execute: handler
        });
    }
    /**
     * Parse a command string into name and arguments
     * @param commandStr Command string to parse
     * @returns Parsed command or null if invalid
     */
    parseCommand(commandStr) {
        if (!commandStr || typeof commandStr !== 'string')
            return null;
        const trimmed = commandStr.trim();
        if (!trimmed)
            return null;
        // Remove prefixes if present (/ or #)
        let name = trimmed.split(' ')[0];
        if (name.startsWith('/') || name.startsWith('#')) {
            name = name.substring(1);
        }
        // Extract arguments if present
        if (trimmed === name) {
            return { name };
        }
        let argsStr = trimmed.substring(name.length + 1).trim();
        // Handle parentheses-enclosed arguments: command(arg1="value1", arg2="value2")
        const argsRegex = /^(\w+)\((.*)\)$/;
        const match = trimmed.match(argsRegex);
        if (match && match[1] === name) {
            argsStr = match[2];
        }
        const args = this.parseArgs(argsStr);
        return { name, args };
    }
    /**
     * Parse agent-specific command
     * @param commandStr Command string starting with @agent
     * @returns Parsed agent command or null if invalid
     */
    parseAgentCommand(commandStr) {
        if (!commandStr.startsWith('@agent '))
            return null;
        const parts = commandStr.substring('@agent '.length).trim().split(' ');
        if (parts.length === 0)
            return null;
        const name = parts[0];
        const message = parts.slice(1).join(' ');
        return { name, message };
    }
    /**
     * Parse argument string into typed arguments
     * @param argsStr Argument string
     * @returns Array of typed arguments
     */
    parseArgs(argsStr) {
        if (!argsStr.trim())
            return [];
        // Parse key=value pairs
        const keyValuePairs = {};
        const keyValueRegex = /(\w+)=(?:"([^"]*)"|'([^']*)'|([^\s,]+))/g;
        let match;
        while ((match = keyValueRegex.exec(argsStr)) !== null) {
            const key = match[1];
            const value = match[2] || match[3] || match[4];
            keyValuePairs[key] = this.convertArgType(value);
        }
        if (Object.keys(keyValuePairs).length > 0) {
            return [keyValuePairs];
        }
        // If no key=value pairs, parse as positional arguments
        const args = [];
        let currentArg = '';
        let inQuotes = false;
        let quoteChar = '';
        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr[i];
            if (char === '"' || char === "'") {
                if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                }
                else if (char === quoteChar) {
                    inQuotes = false;
                    quoteChar = '';
                }
                else {
                    currentArg += char;
                }
            }
            else if (char === ',' && !inQuotes) {
                args.push(this.convertArgType(currentArg.trim()));
                currentArg = '';
            }
            else {
                currentArg += char;
            }
        }
        if (currentArg.trim()) {
            args.push(this.convertArgType(currentArg.trim()));
        }
        return args;
    }
    /**
     * Convert string argument to appropriate type
     * @param arg Argument as string
     * @returns Typed argument
     */
    convertArgType(arg) {
        const trimmed = arg.trim();
        // Remove surrounding quotes
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.substring(1, trimmed.length - 1);
        }
        // Boolean
        if (trimmed === 'true')
            return true;
        if (trimmed === 'false')
            return false;
        // Number
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            return Number(trimmed);
        }
        // String
        return trimmed;
    }
    /**
     * Register default commands
     */
    registerDefaultCommands() {
        // File operations
        this.registerCommand('createFile', this.createFile.bind(this));
        this.registerCommand('modifyFile', this.modifyFile.bind(this));
        this.registerCommand('deleteFile', this.deleteFile.bind(this));
        this.registerCommand('readFile', this.readFile.bind(this));
        this.registerCommand('fileExists', this.fileExists.bind(this));
    }
    /**
     * Create a new file
     * @param path File path
     * @param content File content
     */
    async createFile(path, content) {
        return this.workspaceManager.writeFile(path, content);
    }
    /**
     * Modify an existing file
     * @param path File path
     * @param content New content or function to modify content
     */
    async modifyFile(path, content) {
        const oldContent = await this.readFile(path);
        if (typeof content === 'function') {
            const newContent = content(oldContent);
            await this.workspaceManager.writeFile(path, newContent);
        }
        else {
            await this.workspaceManager.writeFile(path, content);
        }
    }
    /**
     * Delete a file
     * @param path File path
     */
    async deleteFile(path) {
        return this.workspaceManager.deleteFile(path);
    }
    /**
     * Read file content
     * @param path File path
     * @returns File content as string
     */
    async readFile(path) {
        const content = await this.workspaceManager.readFile(path);
        return Buffer.from(content).toString('utf8');
    }
    /**
     * Check if file exists
     * @param path File path
     * @returns True if file exists
     */
    async fileExists(path) {
        try {
            const uri = vscode.Uri.file(path);
            await this.workspaceManager.readFile(uri);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.CommandParser = CommandParser;
CommandParser.instance = null;
//# sourceMappingURL=CommandParser.js.map