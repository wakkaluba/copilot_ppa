"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferences = void 0;
class UserPreferences {
    constructor(context) {
        this._languageUsage = {};
        this._storageKey = 'userProgrammingPreferences';
        this._context = context;
    }
    async initialize() {
        try {
            const storedData = this._context.globalState.get(this._storageKey);
            if (storedData) {
                this._preferredLanguage = storedData.preferredLanguage;
                this._preferredFramework = storedData.preferredFramework;
                this._languageUsage = storedData.languageUsage || {};
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize user preferences: ${errorMessage}`);
        }
    }
    setPreferredLanguage(language) {
        this._preferredLanguage = language;
        this.saveToStorage().catch(error => {
            console.error('Failed to save user preferences:', error);
        });
    }
    getPreferredLanguage() {
        return this._preferredLanguage;
    }
    setPreferredFramework(framework) {
        this._preferredFramework = framework;
        this.saveToStorage().catch(error => {
            console.error('Failed to save user preferences:', error);
        });
    }
    getPreferredFramework() {
        return this._preferredFramework;
    }
    incrementLanguageUsage(language) {
        this._languageUsage[language] = (this._languageUsage[language] || 0) + 1;
        this.saveToStorage().catch(error => {
            console.error('Failed to save language usage:', error);
        });
    }
    getFrequentLanguages(limit) {
        return Object.entries(this._languageUsage)
            .map(([language, count]) => ({ language, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    async clearPreferences() {
        try {
            this._preferredLanguage = undefined;
            this._preferredFramework = undefined;
            this._languageUsage = {};
            await this._context.globalState.update(this._storageKey, undefined);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear user preferences: ${errorMessage}`);
        }
    }
    async saveToStorage() {
        try {
            const data = {
                languageUsage: this._languageUsage
            };
            if (this._preferredLanguage !== undefined) {
                data.preferredLanguage = this._preferredLanguage;
            }
            if (this._preferredFramework !== undefined) {
                data.preferredFramework = this._preferredFramework;
            }
            await this._context.globalState.update(this._storageKey, data);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to save user preferences: ${errorMessage}`);
        }
    }
}
exports.UserPreferences = UserPreferences;
//# sourceMappingURL=UserPreferences.js.map