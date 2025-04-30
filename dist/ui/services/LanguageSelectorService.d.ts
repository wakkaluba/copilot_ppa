import * as vscode from 'vscode';
import { SupportedLanguage } from '../../i18n';
interface LanguageQuickPickItem extends vscode.QuickPickItem {
    language: SupportedLanguage;
}
export declare class LanguageSelectorService {
    getSupportedLanguages(): LanguageQuickPickItem[];
    showLanguageQuickPick(languages: LanguageQuickPickItem[]): Promise<LanguageQuickPickItem | undefined>;
    private getCurrentLanguageFromVSCode;
}
export {};
