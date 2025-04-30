import { SupportedLanguage } from '../../i18n';
export declare class LanguageStatusBarService {
    private statusBarItem;
    constructor();
    initialize(): void;
    updateDisplay(currentLanguage: SupportedLanguage): void;
    dispose(): void;
}
