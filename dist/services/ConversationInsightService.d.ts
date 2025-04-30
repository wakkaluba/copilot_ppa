import * as vscode from 'vscode';
import { ConversationHistory } from './ConversationHistory';
export declare class ConversationInsightService implements vscode.Disposable {
    private readonly history;
    private readonly testGenerator;
    private readonly onInsightGeneratedEmitter;
    readonly onInsightGenerated: any;
    constructor(history: ConversationHistory);
    generateIdeas(context: string): Promise<string[]>;
    generateCodeSuggestions(context: string): Promise<string[]>;
    generateDocumentation(context: string): Promise<string>;
    generateTests(context: string): Promise<string[]>;
    private findRelevantMessages;
    private isMessageRelevant;
    private analyzeConversations;
    private extractPatterns;
    private generateIdeaFromPattern;
    private analyzeCodeContext;
    private analyzeCodePatterns;
    private analyzeForDocumentation;
    private categorizeContent;
    private addToSection;
    dispose(): void;
}
