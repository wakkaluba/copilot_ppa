import * as vscode from 'vscode';
import { IFilePreferences } from './types';

interface StoredFilePreferences {
    recentExtensions: string[];
    recentDirectories: string[];
    namingPatterns: string[];
}

export class FilePreferences implements IFilePreferences {
    private readonly _context: vscode.ExtensionContext;
    private _recentExtensions: string[] = [];
    private _recentDirectories: string[] = [];
    private _namingPatterns: string[] = [];
    private readonly _storageKey = 'fileManagementPreferences';
    
    private readonly _maxExtensions = 10;
    private readonly _maxDirectories = 5;
    private readonly _maxPatterns = 5;

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
    }

    async initialize(): Promise<void> {
        try {
            const storedData = this._context.globalState.get<StoredFilePreferences>(this._storageKey);
            
            if (storedData) {
                this._recentExtensions = storedData.recentExtensions || [];
                this._recentDirectories = storedData.recentDirectories || [];
                this._namingPatterns = storedData.namingPatterns || [];
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize file preferences: ${errorMessage}`);
        }
    }

    addRecentExtension(extension: string): void {
        // Move to front if exists, otherwise add to front
        this._recentExtensions = [
            extension,
            ...this._recentExtensions.filter(ext => ext !== extension)
        ];
        
        // Keep the list within size limit
        if (this._recentExtensions.length > this._maxExtensions) {
            this._recentExtensions = this._recentExtensions.slice(0, this._maxExtensions);
        }
        
        this.saveToStorage().catch(error => {
            console.error('Failed to save file preferences:', error);
        });
    }

    getRecentExtensions(limit: number): string[] {
        return this._recentExtensions.slice(0, Math.min(limit, this._maxExtensions));
    }

    addRecentDirectory(directory: string): void {
        // Move to front if exists, otherwise add to front
        this._recentDirectories = [
            directory,
            ...this._recentDirectories.filter(dir => dir !== directory)
        ];
        
        // Keep the list within size limit
        if (this._recentDirectories.length > this._maxDirectories) {
            this._recentDirectories = this._recentDirectories.slice(0, this._maxDirectories);
        }
        
        this.saveToStorage().catch(error => {
            console.error('Failed to save file preferences:', error);
        });
    }

    getRecentDirectories(limit: number): string[] {
        return this._recentDirectories.slice(0, Math.min(limit, this._maxDirectories));
    }

    addNamingPattern(pattern: string): void {
        if (!this._namingPatterns.includes(pattern)) {
            this._namingPatterns.push(pattern);
            
            // Keep the list within size limit
            if (this._namingPatterns.length > this._maxPatterns) {
                this._namingPatterns = this._namingPatterns.slice(-this._maxPatterns);
            }
            
            this.saveToStorage().catch(error => {
                console.error('Failed to save file preferences:', error);
            });
        }
    }

    getNamingPatterns(): string[] {
        return [...this._namingPatterns];
    }

    async clearPreferences(): Promise<void> {
        try {
            this._recentExtensions = [];
            this._recentDirectories = [];
            this._namingPatterns = [];
            await this._context.globalState.update(this._storageKey, undefined);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear file preferences: ${errorMessage}`);
        }
    }

    private async saveToStorage(): Promise<void> {
        try {
            const data: StoredFilePreferences = {
                recentExtensions: this._recentExtensions,
                recentDirectories: this._recentDirectories,
                namingPatterns: this._namingPatterns
            };
            await this._context.globalState.update(this._storageKey, data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to save file preferences: ${errorMessage}`);
        }
    }
}