import * as vscode from 'vscode';
import { WorkspaceManager } from './WorkspaceManager';
import { Logger } from '../utils/logger';
import * as path from 'path';
import { IDisposable } from '../types';

type CommandHandler = (args: any) => Promise<any>;

interface Command {
  name: string;
  handler: CommandHandler;
  description?: string;
}

export class CommandParser implements IDisposable {
  private static instance: CommandParser;
  private workspaceManager: WorkspaceManager;
  private logger: Logger;
  private commands: Map<string, CommandHandler> = new Map();
  
  private constructor(workspaceManager: WorkspaceManager, logger: Logger) {
    this.workspaceManager = workspaceManager;
    this.logger = logger;
    
    // Register built-in commands
    this.registerCommand('createFile', this.createFile.bind(this));
    this.registerCommand('modifyFile', this.modifyFile.bind(this));
    this.registerCommand('deleteFile', this.deleteFile.bind(this));
  }
  
  // For testing purposes only - allows resetting the singleton instance
  public static resetInstance(): void {
    CommandParser.instance = undefined as any;
  }
  
  public static getInstance(): CommandParser {
    if (!CommandParser.instance) {
      const workspaceManager = WorkspaceManager.getInstance();
      const logger = Logger.getInstance();
      
      if (!workspaceManager || !logger) {
        throw new Error("WorkspaceManager and Logger required for initial CommandParser initialization");
      }
      
      CommandParser.instance = new CommandParser(workspaceManager, logger);
    }
    
    return CommandParser.instance;
  }
  
  public registerCommand(name: string, handler: CommandHandler): void {
    this.commands.set(name.toLowerCase(), handler);
  }
  
  public async parseAndExecute(command: string): Promise<any> {
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
  
  public parseCommand(command: string): { name: string; args: any } | null {
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
    } catch (error) {
      this.logger.error(`Error parsing command: ${command}`, error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }
  
  public parseArgs(argsString: string): any {
    const args: any = {};
    
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
  
  public async createFile(args: any): Promise<void> {
    const { path: filePath, content } = args;
    
    if (!filePath) {
      throw new Error('File path is required');
    }
    
    await this.workspaceManager.writeFile(filePath, content || '');
    this.logger.info(`Created file: ${filePath}`);
  }
  
  public async modifyFile(args: any): Promise<void> {
    const { path: filePath, content, find, replace } = args;
    
    if (!filePath) {
      throw new Error('File path is required');
    }
    
    let fileContent = await this.workspaceManager.readFile(filePath);
    
    if (content !== undefined) {
      fileContent = content;
    } else if (find !== undefined && replace !== undefined) {
      // Simple string replacement
      fileContent = fileContent.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    }
    
    await this.workspaceManager.writeFile(filePath, fileContent);
    this.logger.info(`Modified file: ${filePath}`);
  }
  
  public async deleteFile(args: any): Promise<void> {
    const { path: filePath } = args;
    
    if (!filePath) {
      throw new Error('File path is required');
    }
    
    await this.workspaceManager.deleteFile(filePath);
    this.logger.info(`Deleted file: ${filePath}`);
  }
  
  public dispose(): void {
    // Clean up any resources if needed
  }
  
  // Helper function to escape special regex characters in strings
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
