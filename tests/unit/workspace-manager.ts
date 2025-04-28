import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class TestWorkspaceManager {
  private rootPath: string = '/test-workspace';
  
  constructor(rootPath?: string) {
    if (rootPath) {
      this.rootPath = rootPath;
    }
  }
  
  async readFile(filePath: string): Promise<string> {
    // This is a test function that mimics the behavior
    return "test file content";
  }
  
  async writeFile(filePath: string, content: string): Promise<void> {
    // This is a test function that mimics the behavior
    // Nothing to do in tests
  }
  
  async fileExists(filePath: string): Promise<boolean> {
    // For testing, just return true for specific test paths
    return filePath.includes('exists');
  }
  
  async listFiles(dirPath: string): Promise<string[]> {
    // Return mock file list
    return ['file1.txt', 'file2.ts'];
  }
  
  async createDirectory(dirPath: string): Promise<void> {
    // This is a test function that mimics the behavior
    // Nothing to do in tests
  }
  
  async findFiles(pattern: string): Promise<vscode.Uri[]> {
    // Return mock URIs
    return [
      { fsPath: path.join(this.rootPath, 'file1.ts') } as any as vscode.Uri,
      { fsPath: path.join(this.rootPath, 'file2.ts') } as any as vscode.Uri
    ];
  }
  
  getConfiguration(section: string): vscode.WorkspaceConfiguration {
    // Return mock configuration
    return {
      get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
      update: jest.fn(),
      has: jest.fn(),
      inspect: jest.fn()
    } as any as vscode.WorkspaceConfiguration;
  }
  
  async updateConfiguration(section: string, value: any, target?: vscode.ConfigurationTarget): Promise<void> {
    // This is a test function that mimics the behavior
    // Nothing to do in tests
  }
}

// Create a mock manager for tests
export const testWorkspaceManager = new TestWorkspaceManager();
