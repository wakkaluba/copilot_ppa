import * as vscode from 'vscode';
import { IUserPreferences } from './types';
export declare class UserPreferences implements IUserPreferences {
    private readonly _context;
    private _preferredLanguage?;
    private _preferredFramework?;
    private _languageUsage;
    private readonly _storageKey;
    constructor(context: vscode.ExtensionContext);
    initialize(): Promise<void>;
    setPreferredLanguage(language: string): void;
    getPreferredLanguage(): string | undefined;
    setPreferredFramework(framework: string): void;
    getPreferredFramework(): string | undefined;
    incrementLanguageUsage(language: string): void;
    getFrequentLanguages(limit: number): {
        language: string;
        count: number;
    }[];
    clearPreferences(): Promise<void>;
    private saveToStorage;
}
