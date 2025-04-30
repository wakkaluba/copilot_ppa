import * as vscode from 'vscode';
/**
 * Service for managing user preferences
 */
export declare class UserPreferencesService {
    private preferences;
    private context;
    /**
     * Create a new UserPreferencesService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize service
     */
    initialize(): Promise<void>;
    /**
     * Get a user preference
     * @param key Preference key
     * @param defaultValue Default value if preference doesn't exist
     */
    getPreference<T>(key: string, defaultValue?: T): T;
    /**
     * Set a user preference
     * @param key Preference key
     * @param value Preference value
     */
    setPreference(key: string, value: any): Promise<void>;
    /**
     * Delete a user preference
     * @param key Preference key
     */
    deletePreference(key: string): Promise<void>;
    /**
     * Check if a preference exists
     * @param key Preference key
     */
    hasPreference(key: string): boolean;
    /**
     * Clear all preferences
     */
    clearPreferences(): Promise<void>;
    /**
     * Save preferences to storage
     */
    private savePreferences;
    /**
     * Get the preferred programming language
     */
    getPreferredLanguage(): string | undefined;
    /**
     * Get the preferred framework
     */
    getPreferredFramework(): string | undefined;
}
