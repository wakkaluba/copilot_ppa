"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferencesService = void 0;
/**
 * Service for managing user preferences
 */
class UserPreferencesService {
    /**
     * Create a new UserPreferencesService
     * @param context Extension context for state persistence
     */
    constructor(context) {
        this.preferences = new Map();
        this.context = context;
    }
    /**
     * Initialize service
     */
    async initialize() {
        // Load preferences from storage
        const storedPrefs = this.context.globalState.get('userPreferences');
        if (storedPrefs) {
            try {
                const parsedPrefs = JSON.parse(storedPrefs);
                Object.entries(parsedPrefs).forEach(([key, value]) => {
                    this.preferences.set(key, value);
                });
            }
            catch (error) {
                console.error('Failed to parse stored user preferences', error);
            }
        }
    }
    /**
     * Get a user preference
     * @param key Preference key
     * @param defaultValue Default value if preference doesn't exist
     */
    getPreference(key, defaultValue) {
        if (this.preferences.has(key)) {
            return this.preferences.get(key);
        }
        return defaultValue;
    }
    /**
     * Set a user preference
     * @param key Preference key
     * @param value Preference value
     */
    async setPreference(key, value) {
        this.preferences.set(key, value);
        await this.savePreferences();
    }
    /**
     * Delete a user preference
     * @param key Preference key
     */
    async deletePreference(key) {
        this.preferences.delete(key);
        await this.savePreferences();
    }
    /**
     * Check if a preference exists
     * @param key Preference key
     */
    hasPreference(key) {
        return this.preferences.has(key);
    }
    /**
     * Clear all preferences
     */
    async clearPreferences() {
        this.preferences.clear();
        await this.savePreferences();
    }
    /**
     * Save preferences to storage
     */
    async savePreferences() {
        const prefsObject = Object.fromEntries(this.preferences.entries());
        await this.context.globalState.update('userPreferences', JSON.stringify(prefsObject));
    }
    /**
     * Get the preferred programming language
     */
    getPreferredLanguage() {
        return this.getPreference('preferredLanguage');
    }
    /**
     * Get the preferred framework
     */
    getPreferredFramework() {
        return this.getPreference('preferredFramework');
    }
}
exports.UserPreferencesService = UserPreferencesService;
//# sourceMappingURL=UserPreferencesService.js.map