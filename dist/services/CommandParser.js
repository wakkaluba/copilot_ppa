"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandParser = void 0;
const WorkspaceManager_1 = require("./WorkspaceManager");
const logger_1 = require("../utils/logger");
class CommandParser {
    constructor(workspaceManager, logger) {
        this.commands = new Map();
        this.workspaceManager = workspaceManager;
        this.logger = logger;
        // Register built-in commands
        this.registerCommand('createFile', this.createFile.bind(this));
        this.registerCommand('modifyFile', this.modifyFile.bind(this));
        this.registerCommand('deleteFile', this.deleteFile.bind(this));
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
            // Simple command format: commandName(arg1=value1, arg2=value2)
            const match = command.match(/^([a-zA-Z0-9_]+)\s*\((.*)\)$/);
            if (!match) {
                return null;
            }
            const name = match[1];
            const argsString = match[2];
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
            fileContent = fileContent.replace(new RegExp(find, 'g'), replace);
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
}
exports.CommandParser = CommandParser;
//# sourceMappingURL=CommandParser.js.map