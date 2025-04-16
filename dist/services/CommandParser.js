"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandParser = void 0;
const WorkspaceManager_1 = require("./WorkspaceManager");
class CommandParser {
    constructor() {
        this.commands = new Map();
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
        this.registerDefaultCommands();
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
    registerCommand(name, handler) {
        this.commands.set(name, handler);
    }
    async parseAndExecute(input) {
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
    parseCommand(input) {
        try {
            // Format: #command(arg1="value1", arg2="value2")
            const match = input.match(/^#(\w+)\((.*)\)$/);
            if (!match)
                return null;
            const [, name, argsString] = match;
            const args = this.parseArgs(argsString);
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
            const [key, value] = match.split('=');
            args[key] = value.replace(/^"|"$/g, '');
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
}
exports.CommandParser = CommandParser;
//# sourceMappingURL=CommandParser.js.map