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
exports.LanguageSelectorService = void 0;
const vscode = __importStar(require("vscode"));
const languageUtils_1 = require("../../i18n/languageUtils");
class LanguageSelectorService {
    getSupportedLanguages() {
        return Array.from(languageUtils_1.languageNames.entries()).map(([code, name]) => ({
            label: `$(globe) ${name}`,
            description: code,
            language: code
        }));
    }
    async showLanguageQuickPick(languages) {
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = languages;
        quickPick.placeholder = 'Select language';
        quickPick.matchOnDescription = true;
        const currentLanguage = this.getCurrentLanguageFromVSCode();
        quickPick.activeItems = languages.filter(item => item.language === currentLanguage);
        return new Promise(resolve => {
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
    getCurrentLanguageFromVSCode() {
        const vscodeLang = vscode.env.language;
        const baseLang = vscodeLang.split('-')[0];
        return languageUtils_1.languageNames.has(baseLang)
            ? baseLang
            : 'en';
    }
}
exports.LanguageSelectorService = LanguageSelectorService;
//# sourceMappingURL=LanguageSelectorService.js.map