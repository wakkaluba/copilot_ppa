import * as vscode from 'vscode';
import { IUserPreferences } from './types';

interface StoredUserPreferences {
    preferredLanguage?: string;
    preferredFramework?: string;
    languageUsage: Record<string, number>;
}

export class UserPreferences implements IUserPreferences {
    private readonly _context: vscode.ExtensionContext;
    private _preferredLanguage?: string;
    private _preferredFramework?: string;
    private _languageUsage: Record<string, number> = {};
    private readonly _storageKey = 'userProgrammingPreferences';

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
    }

    async initialize(): Promise<void> {
        try {
            const storedData = this._context.globalState.get<StoredUserPreferences>(this._storageKey);
            
            if (storedData) {
                this._preferredLanguage = storedData.preferredLanguage;
                this._preferredFramework = storedData.preferredFramework;
                this._languageUsage = storedData.languageUsage || {};
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize user preferences: ${errorMessage}`);
        }
    }

    setPreferredLanguage(language: string): void {
        this._preferredLanguage = language;
        this.saveToStorage().catch(error => {
            console.error('Failed to save user preferences:', error);
        });
    }

    getPreferredLanguage(): string | undefined {
        return this._preferredLanguage;
    }

    setPreferredFramework(framework: string): void {
        this._preferredFramework = framework;
        this.saveToStorage().catch(error => {
            console.error('Failed to save user preferences:', error);
        });
    }

    getPreferredFramework(): string | undefined {
        return this._preferredFramework;
    }

    incrementLanguageUsage(language: string): void {
        this._languageUsage[language] = (this._languageUsage[language] || 0) + 1;
        this.saveToStorage().catch(error => {
            console.error('Failed to save language usage:', error);
        });
    }

    getFrequentLanguages(limit: number): { language: string; count: number }[] {
        return Object.entries(this._languageUsage)
            .map(([language, count]) => ({ language, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    async clearPreferences(): Promise<void> {
        try {
            this._preferredLanguage = undefined;
            this._preferredFramework = undefined;
            this._languageUsage = {};
            await this._context.globalState.update(this._storageKey, undefined);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear user preferences: ${errorMessage}`);
        }
    }

    private async saveToStorage(): Promise<void> {
        try {
            const data: StoredUserPreferences = {
                languageUsage: this._languageUsage
            };

            if (this._preferredLanguage !== undefined) {
                data.preferredLanguage = this._preferredLanguage;
            }

            if (this._preferredFramework !== undefined) {
                data.preferredFramework = this._preferredFramework;
            }

            await this._context.globalState.update(this._storageKey, data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to save user preferences: ${errorMessage}`);
        }
    }
}