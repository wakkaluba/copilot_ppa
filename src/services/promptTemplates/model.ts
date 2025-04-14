/**
 * Represents a prompt template that can be saved and reused
 */
export interface PromptTemplate {
    /**
     * Unique identifier for the template
     */
    id: string;
    
    /**
     * User-friendly name for the template
     */
    name: string;
    
    /**
     * The actual prompt text template
     */
    content: string;
    
    /**
     * Optional description for the template
     */
    description?: string;
    
    /**
     * Category for organization (e.g., "code-generation", "debugging", etc.)
     */
    category: string;
    
    /**
     * List of tags for filtering and searching
     */
    tags: string[];
    
    /**
     * When the template was created
     */
    createdAt: number;
    
    /**
     * When the template was last modified
     */
    modifiedAt: number;
    
    /**
     * Whether this is a system template (cannot be deleted but can be cloned)
     */
    isSystem?: boolean;
}

/**
 * Type for creating a new template
 */
export type NewPromptTemplate = Omit<PromptTemplate, 'id' | 'createdAt' | 'modifiedAt'>;
