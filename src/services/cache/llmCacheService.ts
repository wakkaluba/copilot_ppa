import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

interface CacheEntry {
  timestamp: number;
  response: any;
}

interface TaskProgress {
  status: 'not-started' | 'in-progress' | 'completed' | 'do-not-touch';
  percentage: number;
}

export class LLMCacheService {
  private cacheDir: string;
  private cacheTTL: number; // Time-to-live in milliseconds
  private cacheEnabled: boolean;
  private todoPath: string;
  private finishedPath: string;
  
  constructor() {
    this.cacheDir = path.join(this.getExtensionPath(), 'cache');
    this.ensureCacheDirectory();
    this.cacheTTL = this.getCacheTTLFromConfig();
    this.cacheEnabled = this.getCacheEnabledFromConfig();
    this.todoPath = path.join(this.getExtensionPath(), 'zzztodo.md');
    this.finishedPath = path.join(this.getExtensionPath(), 'finished.md');
    
    // Listen to configuration changes
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('localLLMAgent.cache')) {
        this.cacheTTL = this.getCacheTTLFromConfig();
        this.cacheEnabled = this.getCacheEnabledFromConfig();
      }
    });
  }
  
  private getExtensionPath(): string {
    const extension = vscode.extensions.getExtension('vscode-local-llm-agent');
    if (!extension) {
      throw new Error('Extension not found');
    }
    return extension.extensionPath;
  }
  
  private ensureCacheDirectory(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }
  
  private getCacheTTLFromConfig(): number {
    const config = vscode.workspace.getConfiguration('localLLMAgent.cache');
    // Default to 1 hour (in milliseconds)
    return (config.get<number>('ttlMinutes') || 60) * 60 * 1000;
  }
  
  private getCacheEnabledFromConfig(): boolean {
    const config = vscode.workspace.getConfiguration('localLLMAgent.cache');
    return config.get<boolean>('enabled') || true;
  }
  
  private generateCacheKey(prompt: string, model: string, params: any): string {
    const data = JSON.stringify({ prompt, model, params });
    return crypto.createHash('md5').update(data).digest('hex');
  }
  
  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }
  
  public async get(prompt: string, model: string, params: any): Promise<any | null> {
    if (!this.cacheEnabled) {
      return null;
    }
    
    const cacheKey = this.generateCacheKey(prompt, model, params);
    const cacheFilePath = this.getCacheFilePath(cacheKey);
    
    if (!fs.existsSync(cacheFilePath)) {
      return null;
    }
    
    try {
      const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8')) as CacheEntry;
      
      // Check if cache entry is still valid
      if (Date.now() - cacheData.timestamp > this.cacheTTL) {
        // Cache expired
        fs.unlinkSync(cacheFilePath);
        return null;
      }
      
      return cacheData.response;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }
  
  public set(prompt: string, model: string, params: any, response: any): void {
    if (!this.cacheEnabled) {
      return;
    }
    
    const cacheKey = this.generateCacheKey(prompt, model, params);
    const cacheFilePath = this.getCacheFilePath(cacheKey);
    
    const cacheEntry: CacheEntry = {
      timestamp: Date.now(),
      response
    };
    
    try {
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheEntry), 'utf8');
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }
  
  public clearCache(): void {
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
  
  public clearExpiredCache(): void {
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        try {
          const cacheData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as CacheEntry;
          if (Date.now() - cacheData.timestamp > this.cacheTTL) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          // If there's an error reading the file, remove it
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  public updateTaskProgress(taskDescription: string, status: 'not-started' | 'in-progress' | 'completed' | 'do-not-touch', percentage: number): void {
    try {
      if (!fs.existsSync(this.todoPath)) {
        return;
      }
      
      let todoContent = fs.readFileSync(this.todoPath, 'utf8');
      const taskLines = todoContent.split('\n');
      
      for (let i = 0; i < taskLines.length; i++) {
        const line = taskLines[i];
        if (line.includes(taskDescription)) {
          // Extract task description without status prefix or percentage suffix
          const cleanedDescription = this.extractTaskDescription(line);
          
          // Create updated task line with new status and percentage
          const statusPrefix = this.getStatusPrefix(status);
          const updatedLine = `${statusPrefix} ${cleanedDescription} (${percentage}%)`;
          
          taskLines[i] = updatedLine;
          
          // If task is completed, move to finished.md
          if (status === 'completed' && percentage === 100) {
            this.moveTaskToFinished(updatedLine);
            taskLines.splice(i, 1);
            i--;
          }
          
          break;
        }
      }
      
      todoContent = taskLines.join('\n');
      fs.writeFileSync(this.todoPath, todoContent, 'utf8');
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  }
  
  private extractTaskDescription(taskLine: string): string {
    // Remove status prefix
    let description = taskLine.replace(/^- \[[^\]]*\]\s*/, '');
    // Remove percentage suffix
    description = description.replace(/\s*\(\d+%\)\s*$/, '');
    return description.trim();
  }
  
  private getStatusPrefix(status: 'not-started' | 'in-progress' | 'completed' | 'do-not-touch'): string {
    switch (status) {
      case 'not-started':
        return '- [ ]';
      case 'in-progress':
        return '- [/]';
      case 'completed':
        return '- [X]';
      case 'do-not-touch':
        return '- [-]';
      default:
        return '- [ ]';
    }
  }
  
  private moveTaskToFinished(taskLine: string): void {
    try {
      if (!fs.existsSync(this.finishedPath)) {
        fs.writeFileSync(this.finishedPath, '', 'utf8');
      }
      
      let finishedContent = fs.readFileSync(this.finishedPath, 'utf8');
      finishedContent += `\n${taskLine}`;
      fs.writeFileSync(this.finishedPath, finishedContent, 'utf8');
    } catch (error) {
      console.error('Error moving task to finished:', error);
    }
  }
  
  public getTaskProgress(taskDescription: string): TaskProgress | null {
    try {
      if (!fs.existsSync(this.todoPath)) {
        return null;
      }
      
      const todoContent = fs.readFileSync(this.todoPath, 'utf8');
      const taskLines = todoContent.split('\n');
      
      for (const line of taskLines) {
        if (line.includes(taskDescription)) {
          // Extract status
          const statusMatch = line.match(/^- \[([^\]]*)\]/);
          let status: 'not-started' | 'in-progress' | 'completed' | 'do-not-touch' = 'not-started';
          
          if (statusMatch) {
            const statusChar = statusMatch[1];
            if (statusChar === '/') {status = 'in-progress';}
            else if (statusChar === 'X') {status = 'completed';}
            else if (statusChar === '-') {status = 'do-not-touch';}
            else {status = 'not-started';}
          }
          
          // Extract percentage
          const percentageMatch = line.match(/\((\d+)%\)$/);
          const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 0;
          
          return { status, percentage };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting task progress:', error);
      return null;
    }
  }
}
