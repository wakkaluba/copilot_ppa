"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentResponseEnhancer = void 0;
const ConversationInsightService_1 = require("./ConversationInsightService");
class AgentResponseEnhancer {
    insightService;
    history;
    constructor(history) {
        this.history = history;
        this.insightService = new ConversationInsightService_1.ConversationInsightService(history);
    }
    async enhanceResponse(userQuery, baseResponse) {
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
    isCodeRelated(query) {
        const codeKeywords = [
            'code', 'function', 'class', 'implement', 'program',
            'bug', 'error', 'fix', 'debug', 'issue',
            'typescript', 'javascript', 'python', 'java',
            'variable', 'constant', 'method', 'api'
        ];
        return codeKeywords.some(keyword => query.toLowerCase().includes(keyword.toLowerCase()));
    }
    isDocumentationRelated(query) {
        const docKeywords = [
            'documentation', 'docs', 'document', 'explain',
            'readme', 'api reference', 'guide', 'tutorial',
            'example', 'usage', 'how to', 'help'
        ];
        return docKeywords.some(keyword => query.toLowerCase().includes(keyword.toLowerCase()));
    }
    isTestRelated(query) {
        const testKeywords = [
            'test', 'spec', 'verification', 'validate',
            'assert', 'expect', 'should', 'check',
            'unit test', 'integration test', 'e2e',
            'coverage', 'mock', 'stub'
        ];
        return testKeywords.some(keyword => query.toLowerCase().includes(keyword.toLowerCase()));
    }
    dispose() {
        this.insightService.dispose();
    }
}
exports.AgentResponseEnhancer = AgentResponseEnhancer;
//# sourceMappingURL=AgentResponseEnhancer.js.map