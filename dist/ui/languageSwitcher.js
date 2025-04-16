"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageSwitcher = void 0;
const vscode = __importStar(require("vscode"));
const i18n_1 = require("../i18n");
/**
 * UI component for switching between languages
 */
class LanguageSwitcher {
    constructor(context) {
        this.context = context;
        // Create status bar item for quick language switching
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10);
        this.statusBarItem.command = 'localLlmAgent.selectLanguage';
        this.updateStatusBar();
        this.statusBarItem.show();
        // Register command for language selection
        this.context.subscriptions.push(vscode.commands.registerCommand('localLlmAgent.selectLanguage', () => {
            this.showLanguageSelector();
        }));
        // Listen for language changes
        this.context.subscriptions.push(vscode.commands.executeCommand('localLlmAgent.languageChanged', () => {
            this.updateStatusBar();
        }));
        // Add to disposables
        this.context.subscriptions.push(this.statusBarItem);
    }
    /**
     * Update the status bar with current language
     */
    updateStatusBar() {
        const currentLanguage = (0, i18n_1.getCurrentLanguage)();
        this.statusBarItem.text = `$(globe) ${currentLanguage.toUpperCase()}`;
        this.statusBarItem.tooltip = (0, i18n_1.localize)('language.select', 'Select Language');
    }
    /**
     * Show the language selection quick pick
     */
    async showLanguageSelector() {
        const languages = [
            {
                label: (0, i18n_1.localize)('language.en', 'English'),
                description: 'English',
                language: i18n_1.SupportedLanguage.English
            },
            {
                label: (0, i18n_1.localize)('language.de', 'German'),
                description: 'Deutsch',
                language: i18n_1.SupportedLanguage.German
            },
            {
                label: (0, i18n_1.localize)('language.es', 'Spanish'),
                description: 'Español',
                language: i18n_1.SupportedLanguage.Spanish
            },
            {
                label: (0, i18n_1.localize)('language.fr', 'French'),
                description: 'Français',
                language: i18n_1.SupportedLanguage.French
            },
            {
                label: (0, i18n_1.localize)('language.zh', 'Chinese'),
                description: '中文',
                language: i18n_1.SupportedLanguage.Chinese
            },
            {
                label: (0, i18n_1.localize)('language.ja', 'Japanese'),
                description: '日本語',
                language: i18n_1.SupportedLanguage.Japanese
            },
            {
                label: (0, i18n_1.localize)('language.ru', 'Russian'),
                description: 'Русский',
                language: i18n_1.SupportedLanguage.Russian
            },
            {
                label: (0, i18n_1.localize)('language.uk', 'Ukrainian'),
                description: 'Українська',
                language: i18n_1.SupportedLanguage.Ukrainian
            },
            {
                label: (0, i18n_1.localize)('language.pl', 'Polish'),
                description: 'Polski',
                language: i18n_1.SupportedLanguage.Polish
            },
            {
                label: (0, i18n_1.localize)('language.da', 'Danish'),
                description: 'Dansk',
                language: i18n_1.SupportedLanguage.Danish
            },
            {
                label: (0, i18n_1.localize)('language.no', 'Norwegian'),
                description: 'Norsk',
                language: i18n_1.SupportedLanguage.Norwegian
            },
            {
                label: (0, i18n_1.localize)('language.sv', 'Swedish'),
                description: 'Svenska',
                language: i18n_1.SupportedLanguage.Swedish
            },
            {
                label: (0, i18n_1.localize)('language.pt', 'Portuguese'),
                description: 'Português',
                language: i18n_1.SupportedLanguage.Portuguese
            },
            {
                label: (0, i18n_1.localize)('language.it', 'Italian'),
                description: 'Italiano',
                language: i18n_1.SupportedLanguage.Italian
            },
            {
                label: (0, i18n_1.localize)('language.el', 'Greek'),
                description: 'Ελληνικά',
                language: i18n_1.SupportedLanguage.Greek
            },
            {
                label: (0, i18n_1.localize)('language.ar', 'Arabic'),
                description: 'العربية',
                language: i18n_1.SupportedLanguage.Arabic
            },
            {
                label: (0, i18n_1.localize)('language.he', 'Hebrew'),
                description: 'עברית',
                language: i18n_1.SupportedLanguage.Hebrew
            },
            {
                label: (0, i18n_1.localize)('language.sa', 'Sanskrit'),
                description: 'संस्कृत',
                language: i18n_1.SupportedLanguage.Sanskrit
            },
            {
                label: (0, i18n_1.localize)('language.cmn', 'Mandarin'),
                description: '普通话',
                language: i18n_1.SupportedLanguage.Mandarin
            },
            {
                label: (0, i18n_1.localize)('language.tr', 'Turkish'),
                description: 'Türkçe',
                language: i18n_1.SupportedLanguage.Turkish
            },
            {
                label: (0, i18n_1.localize)('language.cs', 'Czech'),
                description: 'Čeština',
                language: i18n_1.SupportedLanguage.Czech
            },
            {
                label: (0, i18n_1.localize)('language.sk', 'Slovak'),
                description: 'Slovenčina',
                language: i18n_1.SupportedLanguage.Slovak
            },
            {
                label: (0, i18n_1.localize)('language.hu', 'Hungarian'),
                description: 'Magyar',
                language: i18n_1.SupportedLanguage.Hungarian
            },
            {
                label: (0, i18n_1.localize)('language.sr', 'Serbian'),
                description: 'Српски',
                language: i18n_1.SupportedLanguage.Serbian
            },
            {
                label: (0, i18n_1.localize)('language.sq', 'Albanian'),
                description: 'Shqip',
                language: i18n_1.SupportedLanguage.Albanian
            }
        ];
        const currentLanguage = (0, i18n_1.getCurrentLanguage)();
        const selected = await vscode.window.showQuickPick(languages, {
            placeHolder: (0, i18n_1.localize)('language.select', 'Select Language'),
            matchOnDescription: true
        });
        if (selected && selected.language !== currentLanguage) {
            // Update language
            await vscode.commands.executeCommand('localLlmAgent.setLanguage', selected.language);
        }
    }
}
exports.LanguageSwitcher = LanguageSwitcher;
//# sourceMappingURL=languageSwitcher.js.map