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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageSwitcher = void 0;
const vscode = __importStar(require("vscode"));
const i18n_1 = require("../i18n");
const LanguageStatusBarService_1 = require("./services/LanguageStatusBarService");
const LanguageSelectorService_1 = require("./services/LanguageSelectorService");
const LanguageConfigurationService_1 = require("./services/LanguageConfigurationService");
class LanguageSwitcher {
    constructor(context) {
        this.disposables = [];
        this.statusBarService = new LanguageStatusBarService_1.LanguageStatusBarService();
        this.selectorService = new LanguageSelectorService_1.LanguageSelectorService();
        this.configService = new LanguageConfigurationService_1.LanguageConfigurationService();
        this.initialize(context);
    }
    initialize(context) {
        this.statusBarService.initialize();
        this.registerCommands(context);
        this.setupEventListeners(context);
        this.disposables.push(this.statusBarService, this.selectorService, this.configService);
    }
    registerCommands(context) {
        this.disposables.push(vscode.commands.registerCommand('localLlmAgent.selectLanguage', this.showLanguageSelector.bind(this)));
    }
    setupEventListeners(context) {
        this.disposables.push(vscode.commands.executeCommand('localLlmAgent.languageChanged', () => {
            this.updateStatusBar();
        }));
        context.subscriptions.push(...this.disposables);
    }
    updateStatusBar() {
        const currentLanguage = (0, i18n_1.getCurrentLanguage)();
        this.statusBarService.updateDisplay(currentLanguage);
    }
    async showLanguageSelector() {
        const languages = this.selectorService.getSupportedLanguages();
        const currentLanguage = (0, i18n_1.getCurrentLanguage)();
        const selected = await this.selectorService.showLanguageQuickPick(languages);
        if (selected && selected.language !== currentLanguage) {
            await this.configService.updateLanguage(selected.language);
        }
    }
}
exports.LanguageSwitcher = LanguageSwitcher;
//# sourceMappingURL=languageSwitcher.js.map