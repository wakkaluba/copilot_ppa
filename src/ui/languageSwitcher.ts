import * as vscode from 'vscode';
import { getCurrentLanguage } from '../i18n';
import { LanguageConfigurationService } from './services/LanguageConfigurationService';
import { LanguageSelectorService } from './services/LanguageSelectorService';
import { LanguageStatusBarService } from './services/LanguageStatusBarService';

export class LanguageSwitcher {
    private readonly statusBarService: LanguageStatusBarService;
    private readonly selectorService: LanguageSelectorService;
    private readonly configService: LanguageConfigurationService;
    private readonly disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.statusBarService = new LanguageStatusBarService();
        this.selectorService = new LanguageSelectorService();
        this.configService = new LanguageConfigurationService();

        this.initialize(context);
    }

    private initialize(context: vscode.ExtensionContext): void {
        this.statusBarService.initialize();
        this.registerCommands(context);
        this.setupEventListeners(context);

        this.disposables.push(
            this.statusBarService,
            this.selectorService,
            this.configService
        );
    }

    private registerCommands(context: vscode.ExtensionContext): void {
        this.disposables.push(
            vscode.commands.registerCommand(
                'copilot-ppa.selectLanguage',
                this.showLanguageSelector.bind(this)
            )
        );
    }

    private setupEventListeners(context: vscode.ExtensionContext): void {
        this.disposables.push(
            vscode.commands.executeCommand('copilot-ppa.languageChanged', () => {
                this.updateStatusBar();
            })
        );

        context.subscriptions.push(...this.disposables);
    }

    private updateStatusBar(): void {
        const currentLanguage = getCurrentLanguage();
        this.statusBarService.updateDisplay(currentLanguage);
    }

    private async showLanguageSelector(): Promise<void> {
        const languages = this.selectorService.getSupportedLanguages();
        const currentLanguage = getCurrentLanguage();

        const selected = await this.selectorService.showLanguageQuickPick(languages);

        if (selected && selected.language !== currentLanguage) {
            await this.configService.updateLanguage(selected.language);
        }
    }
}
