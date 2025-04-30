import * as vscode from 'vscode';
import { ConversationInsightService } from './ConversationInsightService';
import { ConversationHistory } from './ConversationHistory';

export class AgentResponseEnhancer implements vscode.Disposable {
    private readonly insightService: ConversationInsightService;
    private readonly history: ConversationHistory;

    constructor(history: ConversationHistory) {
        this.history = history;
        this.insightService = new ConversationInsightService(history);
    }

    async enhanceResponse(userQuery: string, baseResponse: string): Promise<string> {
        let enhancedResponse = baseResponse;

        // Generate ideas based on conversation history
        const ideas = await this.insightService.generateIdeas(userQuery);
        if (ideas.length > 0) {
            enhancedResponse += '\n\nBased on previous conversations, here are some related ideas:\n';
            ideas.forEach(idea => {
                enhancedResponse += `- ${idea}\n`;
            });
        }

        // Generate code suggestions if query is code-related
        if (this.isCodeRelated(userQuery)) {
            const codeSuggestions = await this.insightService.generateCodeSuggestions(userQuery);
            if (codeSuggestions.length > 0) {
                enhancedResponse += '\n\nCode suggestions based on previous patterns:\n';
                codeSuggestions.forEach(suggestion => {
                    enhancedResponse += `- ${suggestion}\n`;
                });
            }
        }

        // Generate documentation if query is documentation-related
        if (this.isDocumentationRelated(userQuery)) {
            const documentation = await this.insightService.generateDocumentation(userQuery);
            if (documentation) {
                enhancedResponse += '\n\nRelevant documentation context:\n';
                enhancedResponse += documentation;
            }
        }

        // Generate test suggestions if query is test-related
        if (this.isTestRelated(userQuery)) {
            const tests = await this.insightService.generateTests(userQuery);
            if (tests.length > 0) {
                enhancedResponse += '\n\nSuggested test cases:\n';
                tests.forEach(test => {
                    enhancedResponse += `\n${test}\n`;
                });
            }
        }

        return enhancedResponse;
    }

    private isCodeRelated(query: string): boolean {
        const codeKeywords = [
            'code', 'function', 'class', 'implement', 'program',
            'bug', 'error', 'fix', 'debug', 'issue',
            'typescript', 'javascript', 'python', 'java',
            'variable', 'constant', 'method', 'api'
        ];
        return codeKeywords.some(keyword => 
            query.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    private isDocumentationRelated(query: string): boolean {
        const docKeywords = [
            'documentation', 'docs', 'document', 'explain',
            'readme', 'api reference', 'guide', 'tutorial',
            'example', 'usage', 'how to', 'help'
        ];
        return docKeywords.some(keyword => 
            query.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    private isTestRelated(query: string): boolean {
        const testKeywords = [
            'test', 'spec', 'verification', 'validate',
            'assert', 'expect', 'should', 'check',
            'unit test', 'integration test', 'e2e',
            'coverage', 'mock', 'stub'
        ];
        return testKeywords.some(keyword => 
            query.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    dispose(): void {
        this.insightService.dispose();
    }
}