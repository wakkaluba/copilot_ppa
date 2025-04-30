import * as vscode from 'vscode';
import { SupportedLanguage } from '../../i18n';
import { getLanguageName, languageNames } from '../../i18n/languageUtils';

interface LanguageQuickPickItem extends vscode.QuickPickItem {
    language: SupportedLanguage;
}

export class LanguageSelectorService {
    getSupportedLanguages(): LanguageQuickPickItem[] {
        return Array.from(languageNames.entries()).map(([code, name]) => ({
            label: `$(globe) ${name}`,
            description: code,
            language: code
        }));
    }

    async showLanguageQuickPick(languages: LanguageQuickPickItem[]): Promise<LanguageQuickPickItem | undefined> {
        const quickPick = vscode.window.createQuickPick<LanguageQuickPickItem>();
        quickPick.items = languages;
        quickPick.placeholder = 'Select language';
        quickPick.matchOnDescription = true;
        
        const currentLanguage = this.getCurrentLanguageFromVSCode();
        quickPick.activeItems = languages.filter(item => 
            item.language === currentLanguage
        );

        return new Promise<LanguageQuickPickItem | undefined>(resolve => {
            quickPick.onDidAccept(() => {
                const selection = quickPick.selectedItems[0];
                quickPick.hide();
                resolve(selection);
            });
            quickPick.onDidHide(() => {
                quickPick.dispose();
                resolve(undefined);
            });
            quickPick.show();
        });
    }

    private getCurrentLanguageFromVSCode(): SupportedLanguage {
        const vscodeLang = vscode.env.language;
        const baseLang = vscodeLang.split('-')[0];
        return languageNames.has(baseLang as SupportedLanguage) 
            ? (baseLang as SupportedLanguage) 
            : 'en';
    }
}