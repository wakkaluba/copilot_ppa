import * as vscode from 'vscode';
import { getCurrentLanguage, localize, SupportedLanguage } from '../i18n';

/**
 * UI component for switching between languages
 */
export class LanguageSwitcher {
    private context: vscode.ExtensionContext;
    private statusBarItem: vscode.StatusBarItem;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        // Create status bar item for quick language switching
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            10
        );
        
        this.statusBarItem.command = 'localLlmAgent.selectLanguage';
        this.updateStatusBar();
        this.statusBarItem.show();
        
        // Register command for language selection
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLlmAgent.selectLanguage', () => {
                this.showLanguageSelector();
            })
        );
        
        // Listen for language changes
        this.context.subscriptions.push(
            vscode.commands.executeCommand('localLlmAgent.languageChanged', () => {
                this.updateStatusBar();
            })
        );
        
        // Add to disposables
        this.context.subscriptions.push(this.statusBarItem);
    }
    
    /**
     * Update the status bar with current language
     */
    private updateStatusBar(): void {
        const currentLanguage = getCurrentLanguage();
        this.statusBarItem.text = `$(globe) ${currentLanguage.toUpperCase()}`;
        this.statusBarItem.tooltip = localize('language.select', 'Select Language');
    }
    
    /**
     * Show the language selection quick pick
     */
    private async showLanguageSelector(): Promise<void> {
        const languages = [
            { 
                label: localize('language.en', 'English'), 
                description: 'English',
                language: SupportedLanguage.English 
            },
            { 
                label: localize('language.de', 'German'), 
                description: 'Deutsch',
                language: SupportedLanguage.German 
            },
            { 
                label: localize('language.es', 'Spanish'), 
                description: 'Español',
                language: SupportedLanguage.Spanish 
            },
            { 
                label: localize('language.fr', 'French'), 
                description: 'Français',
                language: SupportedLanguage.French 
            },
            { 
                label: localize('language.zh', 'Chinese'), 
                description: '中文',
                language: SupportedLanguage.Chinese 
            },
            { 
                label: localize('language.ja', 'Japanese'), 
                description: '日本語',
                language: SupportedLanguage.Japanese 
            },
            { 
                label: localize('language.ru', 'Russian'), 
                description: 'Русский',
                language: SupportedLanguage.Russian 
            },
            { 
                label: localize('language.uk', 'Ukrainian'), 
                description: 'Українська',
                language: SupportedLanguage.Ukrainian 
            },
            { 
                label: localize('language.pl', 'Polish'), 
                description: 'Polski',
                language: SupportedLanguage.Polish 
            },
            { 
                label: localize('language.da', 'Danish'), 
                description: 'Dansk',
                language: SupportedLanguage.Danish 
            },
            { 
                label: localize('language.no', 'Norwegian'), 
                description: 'Norsk',
                language: SupportedLanguage.Norwegian 
            },
            { 
                label: localize('language.sv', 'Swedish'), 
                description: 'Svenska',
                language: SupportedLanguage.Swedish 
            },
            { 
                label: localize('language.pt', 'Portuguese'), 
                description: 'Português',
                language: SupportedLanguage.Portuguese 
            },
            { 
                label: localize('language.it', 'Italian'), 
                description: 'Italiano',
                language: SupportedLanguage.Italian 
            },
            { 
                label: localize('language.el', 'Greek'), 
                description: 'Ελληνικά',
                language: SupportedLanguage.Greek 
            },
            { 
                label: localize('language.ar', 'Arabic'), 
                description: 'العربية',
                language: SupportedLanguage.Arabic 
            },
            { 
                label: localize('language.he', 'Hebrew'), 
                description: 'עברית',
                language: SupportedLanguage.Hebrew 
            },
            { 
                label: localize('language.sa', 'Sanskrit'), 
                description: 'संस्कृत',
                language: SupportedLanguage.Sanskrit 
            },
            { 
                label: localize('language.cmn', 'Mandarin'), 
                description: '普通话',
                language: SupportedLanguage.Mandarin 
            },
            { 
                label: localize('language.tr', 'Turkish'), 
                description: 'Türkçe',
                language: SupportedLanguage.Turkish 
            },
            { 
                label: localize('language.cs', 'Czech'), 
                description: 'Čeština',
                language: SupportedLanguage.Czech 
            },
            { 
                label: localize('language.sk', 'Slovak'), 
                description: 'Slovenčina',
                language: SupportedLanguage.Slovak 
            },
            { 
                label: localize('language.hu', 'Hungarian'), 
                description: 'Magyar',
                language: SupportedLanguage.Hungarian 
            },
            { 
                label: localize('language.sr', 'Serbian'), 
                description: 'Српски',
                language: SupportedLanguage.Serbian 
            },
            { 
                label: localize('language.sq', 'Albanian'), 
                description: 'Shqip',
                language: SupportedLanguage.Albanian 
            }
        ];
        
        const currentLanguage = getCurrentLanguage();
        
        const selected = await vscode.window.showQuickPick(languages, {
            placeHolder: localize('language.select', 'Select Language'),
            matchOnDescription: true
        });
        
        if (selected && selected.language !== currentLanguage) {
            // Update language
            await vscode.commands.executeCommand('localLlmAgent.setLanguage', selected.language);
        }
    }
}
