import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LocalizationService } from './services/LocalizationService';

/**
 * Supported languages in the application
 */
export enum SupportedLanguage {
    English = 'en',
    German = 'de',
    Spanish = 'es',
    French = 'fr',
    Chinese = 'zh',
    Japanese = 'ja',
    Russian = 'ru',
    Ukrainian = 'uk',
    Polish = 'pl',
    Danish = 'da',
    Norwegian = 'no',
    Swedish = 'sv',
    Portuguese = 'pt',
    Italian = 'it',
    Greek = 'el',
    Arabic = 'ar',
    Hebrew = 'he',
    Sanskrit = 'sa',
    Esperanto = 'eo',
    Korean = 'ko',
    ChineseTW = 'zh-tw',
    Thai = 'th',
    Malaysian = 'ms',
    Maori = 'mi',
    Mandarin = 'cmn',
    Turkish = 'tr',
    Czech = 'cs',
    Slovak = 'sk',
    Hungarian = 'hu',
    Serbian = 'sr',
    Albanian = 'sq'
}

/**
 * Main localization service for the extension
 */
export class LocalizationServiceWrapper {
    private service: LocalizationService;

    constructor(context: vscode.ExtensionContext) {
        this.service = new LocalizationService(context);
    }

    public getString(key: string, defaultValue: string, params?: Record<string, string>): string {
        return this.service.getString(key, defaultValue, params);
    }

    public getCurrentLanguage(): SupportedLanguage {
        return this.service.getCurrentLanguage();
    }

    public setLanguage(language: SupportedLanguage): void {
        this.service.setLanguage(language);
    }

    public getSupportedLanguages(): SupportedLanguage[] {
        return this.service.getSupportedLanguages();
    }

    public detectLanguage(text: string): SupportedLanguage | null {
        return this.service.detectLanguage(text);
    }
}

/**
 * Type for locale string records
 */
export interface LocaleStrings {
    [key: string]: string;
}
