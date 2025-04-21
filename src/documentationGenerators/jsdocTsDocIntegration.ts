import * as vscode from 'vscode';
import * as path from 'path';
import { LLMInterface } from '../llm/llmInterface';
import { JSDocTSDocIntegrationService } from './services/JSDocTSDocIntegrationService';

/**
 * Class responsible for handling JSDoc/TSDoc generation and integration
 */
export class JSDocTSDocIntegration {
    private service: JSDocTSDocIntegrationService;

    /**
     * Constructor for the JSDoc/TSDoc integration
     * @param context The VSCode extension context
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(context: vscode.ExtensionContext, llmProvider: LLMInterface) {
        this.service = new JSDocTSDocIntegrationService(context, llmProvider);
    }
}
