import * as vscode from 'vscode';
import { SupportedLanguage } from '../../i18n';
import { getLanguageName } from '../../i18n/languageUtils';

export class LanguageStatusBarService {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'copilot-ppa.selectLanguage';
    }

    initialize(): void {
        this.statusBarItem.show();
    }

    updateDisplay(currentLanguage: SupportedLanguage): void {
        this.statusBarItem.text = `$(globe) ${getLanguageName(currentLanguage)}`;
        this.statusBarItem.tooltip = `Current Language: ${getLanguageName(currentLanguage)}`;
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
