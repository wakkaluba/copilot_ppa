"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeStorage = void 0;
/**
 * Handles persistence of themes and UI layout options
 */
class ThemeStorage {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Get the ID of the active theme
     */
    getActiveThemeId() {
        return this.storage.get("copilotPPA.activeTheme" /* StorageKeys.ActiveTheme */, 'default');
    }
    /**
     * Save the ID of the active theme
     */
    async setActiveThemeId(id) {
        await this.storage.update("copilotPPA.activeTheme" /* StorageKeys.ActiveTheme */, id);
    }
    /**
     * Get all saved custom themes
     */
    getCustomThemes() {
        return this.storage.get("copilotPPA.customThemes" /* StorageKeys.CustomThemes */, []);
    }
    /**
     * Save custom themes
     */
    async saveCustomThemes(themes) {
        await this.storage.update("copilotPPA.customThemes" /* StorageKeys.CustomThemes */, themes);
    }
    /**
     * Get UI layout options
     */
    getUILayoutOptions() {
        return this.storage.get("copilotPPA.uiLayoutOptions" /* StorageKeys.UILayoutOptions */, {
            chatInputPosition: 'bottom',
            showTimestamps: true,
            showAvatars: true,
            compactMode: false,
            expandCodeBlocks: true,
            wordWrap: true
        });
    }
    /**
     * Save UI layout options
     */
    async saveUILayoutOptions(options) {
        await this.storage.update("copilotPPA.uiLayoutOptions" /* StorageKeys.UILayoutOptions */, options);
    }
}
exports.ThemeStorage = ThemeStorage;
//# sourceMappingURL=storage.js.map