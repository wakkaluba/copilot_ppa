import { UserPreferencesService } from "./UserPreferencesService";
import { FilePreferencesService } from "./FilePreferencesService";
import { ConversationMemoryService } from "./ConversationMemoryService";
/**
 * Service for analyzing conversation context
 */
export declare class ContextAnalysisService {
    /**
     * Analyze a message for context and preferences
     * @param message Message content to analyze
     * @param userPrefs User preferences service to update
     * @param filePrefs File preferences service to update
     */
    analyzeMessage(message: string, userPrefs: UserPreferencesService, filePrefs: FilePreferencesService): void;
    /**
     * Extract language preferences from a message
     */
    private extractLanguagePreferences;
    /**
     * Extract file type preferences from a message
     */
    private extractFileTypePreferences;
    /**
     * Extract other preferences from a message
     */
    private extractOtherPreferences;
    /**
     * Build a context string for prompting
     * @param userPrefs User preferences service
     * @param filePrefs File preferences service
     * @param memoryService Conversation memory service
     * @returns Formatted context string
     */
    buildContextString(userPrefs: UserPreferencesService, filePrefs: FilePreferencesService, memoryService: ConversationMemoryService): string;
    /**
     * Generate suggestions based on user input and context
     * @param input Current input text from user
     * @param recentMessages Recent conversation messages for context
     * @param userPreferences User preferences for suggestions
     * @returns Array of suggestion strings
     */
    generateSuggestions(input: string, recentMessages: any[], userPreferences: {
        language?: string;
        framework?: string;
        fileExtensions?: string[];
    }): Promise<string[]>;
}
