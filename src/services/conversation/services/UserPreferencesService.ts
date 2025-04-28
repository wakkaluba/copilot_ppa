import * as vscode from 'vscode';

/**
 * Service for managing user preferences
 */
export class UserPreferencesService {
    private preferences: Map<string, any> = new Map();
    private context: vscode.ExtensionContext;

    /**
     * Create a new UserPreferencesService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Initialize service
     */
    public async initialize(): Promise<void> {
        // Load preferences from storage
        const storedPrefs = this.context.globalState.get('userPreferences');
        if (storedPrefs) {
            try {
                const parsedPrefs = JSON.parse(storedPrefs as string);
                Object.entries(parsedPrefs).forEach(([key, value]) => {
                    this.preferences.set(key, value);
                });
            } catch (error) {
                console.error('Failed to parse stored user preferences', error);
            }
        }
    }

    /**
     * Get a user preference
     * @param key Preference key
     * @param defaultValue Default value if preference doesn't exist
     */
    public getPreference<T>(key: string, defaultValue?: T): T {
        if (this.preferences.has(key)) {
            return this.preferences.get(key) as T;
        }
        return defaultValue as T;
    }

    /**
     * Set a user preference
     * @param key Preference key
     * @param value Preference value
     */
    public async setPreference(key: string, value: any): Promise<void> {
        this.preferences.set(key, value);
        await this.savePreferences();
    }

    /**
     * Delete a user preference
     * @param key Preference key
     */
    public async deletePreference(key: string): Promise<void> {
        this.preferences.delete(key);
        await this.savePreferences();
    }

    /**
     * Check if a preference exists
     * @param key Preference key
     */
    public hasPreference(key: string): boolean {
        return this.preferences.has(key);
    }

    /**
     * Clear all preferences
     */
    public async clearPreferences(): Promise<void> {
        this.preferences.clear();
        await this.savePreferences();
    }

    /**
     * Save preferences to storage
     */
    private async savePreferences(): Promise<void> {
        const prefsObject = Object.fromEntries(this.preferences.entries());
        await this.context.globalState.update('userPreferences', JSON.stringify(prefsObject));
    }
}
