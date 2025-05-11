import * as vscode from 'vscode';
import { CopilotIntegrationProvider } from '../../copilot/copilotIntegrationProvider';

/**
 * Interface representing the result of code processing.
 */
export interface CodeProcessingResult {
    completion: string;
    modelUsed?: string;
    tokens?: number;
    processingTime?: number;
}

/**
 * Service responsible for processing code with Copilot.
 */
export class CopilotCodeProcessingService {
    private provider: CopilotIntegrationProvider;

    /**
     * Creates a new instance of the CopilotCodeProcessingService.
     *
     * @param provider The Copilot integration provider
     */
    constructor(provider: CopilotIntegrationProvider) {
        this.provider = provider;
    }

    /**
     * Processes the given code with a specific prompt.
     *
     * @param code The code to process
     * @param prompt The prompt to use
     * @returns A promise that resolves to the processing result
     */
    public async processCode(code: string, prompt: string): Promise<CodeProcessingResult> {
        try {
            const startTime = Date.now();

            // Use the provider to get a completion for the code
            const response = await this.provider.getCompletion(code, prompt);

            const processingTime = Date.now() - startTime;

            return {
                completion: response.text,
                modelUsed: response.model,
                tokens: response.tokens,
                processingTime
            };
        } catch (error) {
            console.error('Error processing code:', error);
            throw error;
        }
    }

    /**
     * Extracts code from a document based on a selection.
     *
     * @param document The document to extract code from
     * @param selection The selection to extract code from
     * @returns The extracted code
     */
    public extractCodeFromSelection(document: vscode.TextDocument, selection: vscode.Selection): string {
        if (selection.isEmpty) {
            // If nothing is selected, get the current line
            const line = document.lineAt(selection.active.line);
            return line.text;
        } else {
            // Get the selected text
            return document.getText(selection);
        }
    }

    /**
     * Gets a default prompt for processing code.
     *
     * @param action The action to perform on the code
     * @returns The default prompt
     */
    public getDefaultPrompt(action: string = 'explain'): string {
        switch (action) {
            case 'explain':
                return 'Explain this code in detail:';
            case 'optimize':
                return 'Optimize this code for performance:';
            case 'refactor':
                return 'Refactor this code to improve readability:';
            case 'document':
                return 'Generate documentation for this code:';
            default:
                return `${action} this code:`;
        }
    }
}
