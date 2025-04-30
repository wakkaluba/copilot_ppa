/**
 * Interface for LLM providers that can generate documentation
 */
export interface LLMInterface {
    /**
     * Generate documentation from a prompt
     * @param prompt The prompt describing what to document
     * @returns Generated documentation string
     */
    generateDocumentation(prompt: string): Promise<string>;
}
