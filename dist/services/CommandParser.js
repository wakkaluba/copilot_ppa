"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandParser = void 0;
const WorkspaceManager_1 = require("./WorkspaceManager");
const logger_1 = require("../utils/logger");
class CommandParser {
    static instance;
    workspaceManager;
    logger;
    commands = new Map();
    constructor(workspaceManager, logger) {
        this.workspaceManager = workspaceManager;
        this.logger = logger;
        // Register built-in commands
        this.registerCommand('createFile', this.createFile.bind(this));
        this.registerCommand('modifyFile', this.modifyFile.bind(this));
        this.registerCommand('deleteFile', this.deleteFile.bind(this));
    }
    // For testing purposes only - allows resetting the singleton instance
    static resetInstance() {
        CommandParser.instance = undefined;
    }
    static getInstance() {
        if (!CommandParser.instance) {
            const workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
            const logger = logger_1.Logger.getInstance();
            if (!workspaceManager || !logger) {
                throw new Error("WorkspaceManager and Logger required for initial CommandParser initialization");
            }
            CommandParser.instance = new CommandParser(workspaceManager, logger);
        }
        return CommandParser.instance;
    }
    registerCommand(name, handler) {
        this.commands.set(name.toLowerCase(), handler);
    }
    async parseAndExecute(command) {
        const parsedCommand = this.parseCommand(command);
        if (!parsedCommand) {
            throw new Error(`Invalid command format: ${command}`);
        }
        const handler = this.commands.get(parsedCommand.name.toLowerCase());
        if (!handler) {
            throw new Error(`Unknown command: ${parsedCommand.name}`);
        }
        return await handler(parsedCommand.args);
    }
    parseCommand(command) {
        try {
            // Improved command format handling: commandName(arg1=value1, arg2=value2)
            // Trim any leading/trailing whitespace first
            command = command.trim();
            // Extract command name - everything before the first parenthesis
            const nameEndIndex = command.indexOf('(');
            if (nameEndIndex === -1) {
                return null;
            }
            const name = command.substring(0, nameEndIndex).trim();
            if (!name || !/^[a-zA-Z0-9_]+$/.test(name)) {
                return null; // Invalid command name format
            }
            // Extract arguments string - everything between the outer parentheses
            const argsStartIndex = nameEndIndex + 1;
            const argsEndIndex = command.lastIndexOf(')');
            if (argsEndIndex === -1 || argsEndIndex <= argsStartIndex) {
                return null; // No closing parenthesis or empty args section
            }
            const argsString = command.substring(argsStartIndex, argsEndIndex);
            const args = this.parseArgs(argsString);
            return { name, args };
        }
        catch (error) {
            this.logger.error(`Error parsing command: ${command}`, error instanceof Error ? error : new Error(String(error)));
            return null;
        }
    }
    parseArgs(argsString) {
        const args = {};
        if (!argsString.trim()) {
            return args;
        }
        // Split by commas not inside quotes
        const argPairs = argsString.match(/(?:[^\s,"]|"(?:\\"|[^"])*")+/g) || [];
        for (const pair of argPairs) {
            const parts = pair.split('=');
            if (parts.length !== 2) {
                continue;
            }
            const key = parts[0].trim();
            let value = parts[1].trim();
            // Handle quoted strings
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            // Handle numbers
            else if (!isNaN(Number(value))) {
                value = Number(value);
            }
            // Handle booleans
            else if (value === 'true' || value === 'false') {
                value = value === 'true';
            }
            args[key] = value;
        }
        return args;
    }
    // Built-in command handlers
    async createFile(args) {
        const { path: filePath, content } = args;
        if (!filePath) {
            throw new Error('File path is required');
        }
        await this.workspaceManager.writeFile(filePath, content || '');
        this.logger.info(`Created file: ${filePath}`);
    }
    async modifyFile(args) {
        const { path: filePath, content, find, replace } = args;
        if (!filePath) {
            throw new Error('File path is required');
        }
        let fileContent = await this.workspaceManager.readFile(filePath);
        if (content !== undefined) {
            fileContent = content;
        }
        else if (find !== undefined && replace !== undefined) {
            // Simple string replacement
            fileContent = fileContent.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
        }
        await this.workspaceManager.writeFile(filePath, fileContent);
        this.logger.info(`Modified file: ${filePath}`);
    }
    async deleteFile(args) {
        const { path: filePath } = args;
        if (!filePath) {
            throw new Error('File path is required');
        }
        await this.workspaceManager.deleteFile(filePath);
        this.logger.info(`Deleted file: ${filePath}`);
    }
    dispose() {
        // Clean up any resources if needed
    }
    // Helper function to escape special regex characters in strings
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
exports.CommandParser = CommandParser;
//# sourceMappingURL=CommandParser.js.map