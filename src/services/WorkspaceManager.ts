import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { IDisposable } from '../types';

export class WorkspaceManager implements IDisposable {
  private static instance: WorkspaceManager;
  private logger: Logger;
  
  private constructor() {
    this.logger = Logger.getInstance();
  }
  
  public static getInstance(): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager();
    }
    return WorkspaceManager.instance;
  }
  
  public async readFile(filePath: string): Promise<string> {
    try {
      const resolvedPath = this.resolveFilePath(filePath);
      this.logger.debug(`Reading file: ${resolvedPath}`);
      
      const data = await fs.promises.readFile(resolvedPath, 'utf8');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      this.logger.error(`Failed to read file: ${errorMessage}`);
      throw new Error(`Failed to read file: ${errorMessage}`);
    }
  }
  
  public async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const resolvedPath = this.resolveFilePath(filePath);
      this.logger.debug(`Writing to file: ${resolvedPath}`);
      
      // Ensure the directory exists
      await this.createDirectory(path.dirname(resolvedPath));
      
      await fs.promises.writeFile(resolvedPath, content, 'utf8');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      this.logger.error(`Failed to write to file: ${errorMessage}`);
      throw new Error(`Failed to write to file: ${errorMessage}`);
    }
  }
  
  public async deleteFile(filePath: string): Promise<void> {
    try {
      const resolvedPath = this.resolveFilePath(filePath);
      this.logger.debug(`Deleting file: ${resolvedPath}`);
      
      await fs.promises.unlink(resolvedPath);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      this.logger.error(`Failed to delete file: ${errorMessage}`);
      throw new Error(`Failed to delete file: ${errorMessage}`);
    }
  }
  
  public async createDirectory(dirPath: string): Promise<void> {
    try {
      const resolvedPath = this.resolveFilePath(dirPath);
      this.logger.debug(`Creating directory: ${resolvedPath}`);
      
      await fs.promises.mkdir(resolvedPath, { recursive: true });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      this.logger.error(`Failed to create directory: ${errorMessage}`);
      throw new Error(`Failed to create directory: ${errorMessage}`);
    }
  }
  
  public async listFiles(dirPath: string): Promise<string[]> {
    try {
      const resolvedPath = this.resolveFilePath(dirPath);
      this.logger.debug(`Listing files in directory: ${resolvedPath}`);
      
      const files = await fs.promises.readdir(resolvedPath);
      return files;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      this.logger.error(`Failed to list files: ${errorMessage}`);
      throw new Error(`Failed to list files: ${errorMessage}`);
    }
  }
  
  public resolveFilePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder is open');
    }
    
    return path.join(workspaceFolders[0].uri.fsPath, filePath);
  }
  
  public async fileExists(filePath: string): Promise<boolean> {
    try {
      const resolvedPath = this.resolveFilePath(filePath);
      await fs.promises.access(resolvedPath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
  
  public async findFiles(pattern: string): Promise<vscode.Uri[]> {
    try {
      this.logger.debug(`Finding files matching pattern: ${pattern}`);
      return await vscode.workspace.findFiles(pattern);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      throw new Error(`Failed to find files: ${errorMessage}`);
    }
  }
  
  public getConfiguration(section: string): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(section);
  }
  
  public async updateConfiguration(section: string, value: any, target?: vscode.ConfigurationTarget): Promise<void> {
    try {
      const config = this.getConfiguration('');
      await config.update(section, value, target);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      throw new Error(`Failed to update configuration: ${errorMessage}`);
    }
  }
  
  public async formatDocument(document: vscode.TextDocument): Promise<void> {
    try {
      await vscode.commands.executeCommand('editor.action.formatDocument', document);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      this.logger.error(`Failed to format document: ${errorMessage}`);
      throw new Error(`Failed to format document: ${errorMessage}`);
    }
  }
  
  // Methods for todo operations
  public parseTodoFile(content: string): string[] {
    return content.split('\n');
  }
  
  public async updateTodoFile(filePath: string, lines: string[]): Promise<void> {
    const content = lines.join('\n');
    await this.writeFile(filePath, content);
  }
  
  public async moveCompletedTasks(sourceFile: string, targetFile: string): Promise<void> {
    const sourceContent = await this.readFile(sourceFile);
    const sourceLines = this.parseTodoFile(sourceContent);
    
    const completedPattern = /^\s*- \[x\]/i;
    const completedTasks = sourceLines.filter(line => completedPattern.test(line));
    const remainingTasks = sourceLines.filter(line => !completedPattern.test(line));
    
    // Read the target file if it exists
    let targetLines: string[] = [];
    if (await this.fileExists(targetFile)) {
      const targetContent = await this.readFile(targetFile);
      targetLines = this.parseTodoFile(targetContent);
    }
    
    // Update both files
    await this.updateTodoFile(sourceFile, remainingTasks);
    await this.updateTodoFile(targetFile, [...targetLines, ...completedTasks]);
  }
  
  public async updateTaskStatus(filePath: string, lineNumber: number, completed: boolean): Promise<void> {
    const content = await this.readFile(filePath);
    const lines = this.parseTodoFile(content);
    
    if (lineNumber < 0 || lineNumber >= lines.length) {
      throw new Error(`Invalid line number: ${lineNumber}`);
    }
    
    const line = lines[lineNumber];
    if (completed) {
      lines[lineNumber] = line.replace(/^\s*- \[ \]/i, '- [x]');
    } else {
      lines[lineNumber] = line.replace(/^\s*- \[x\]/i, '- [ ]');
    }
    
    await this.updateTodoFile(filePath, lines);
  }
  
  public dispose(): void {
    // Cleanup resources if needed
  }
}
