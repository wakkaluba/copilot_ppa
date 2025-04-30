"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestGeneratorService = void 0;
class TestGeneratorService {
    history;
    frameworkPatterns = {
        jest: /\b(describe|it|test|expect|beforeEach|afterEach)\b/,
        mocha: /\b(describe|it|before|after|beforeEach|afterEach)\b/,
        jasmine: /\b(describe|it|beforeEach|afterEach|spyOn)\b/,
        pytest: /\b(def test_|pytest|assert|fixture)\b/,
        junit: /\b(@Test|assertEquals|assertTrue|assertFalse)\b/
    };
    constructor(history) {
        this.history = history;
    }
    async generateTests(context) {
        const relevantMessages = await this.findTestRelatedMessages(context);
        const framework = this.detectTestFramework(relevantMessages);
        const testCases = await this.extractTestCases(relevantMessages, framework);
        return this.prioritizeTestCases(testCases);
    }
    async findTestRelatedMessages(context) {
        const allMessages = this.history.getAllConversations()
            .flatMap(conv => conv.messages);
        return allMessages.filter(msg => this.isTestRelated(msg.content) &&
            this.isContextRelevant(msg.content, context));
    }
    isTestRelated(content) {
        const testKeywords = [
            'test', 'spec', 'assert', 'expect', 'should',
            'verify', 'validate', 'check', 'ensure',
            'mock', 'stub', 'spy', 'fake', 'fixture',
            'before', 'after', 'setup', 'teardown'
        ];
        return testKeywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
    }
    isContextRelevant(content, context) {
        const contextWords = context.toLowerCase().split(/\W+/);
        const messageWords = content.toLowerCase().split(/\W+/);
        return contextWords.some(word => word.length > 3 && messageWords.includes(word));
    }
    detectTestFramework(messages) {
        const counts = {
            jest: 0,
            mocha: 0,
            jasmine: 0,
            pytest: 0,
            junit: 0
        };
        messages.forEach(msg => {
            Object.entries(this.frameworkPatterns).forEach(([framework, pattern]) => {
                if (pattern.test(msg.content)) {
                    counts[framework] += 1;
                }
            });
        });
        return Object.entries(counts)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }
    async extractTestCases(messages, framework) {
        const testCases = [];
        const scenarios = new Set();
        for (const message of messages) {
            const extractedCases = this.extractScenariosFromMessage(message.content);
            extractedCases.forEach(scenario => {
                if (!scenarios.has(scenario.description)) {
                    scenarios.add(scenario.description);
                    testCases.push({
                        ...scenario,
                        testCode: this.generateTestCode(scenario.description, framework)
                    });
                }
            });
        }
        return testCases;
    }
    extractScenariosFromMessage(content) {
        const scenarios = [];
        // Extract unit test scenarios
        const unitTestPattern = /(?:should|test|verify|check)\s+(?:that\s+)?([^.,]+)/gi;
        let match;
        while ((match = unitTestPattern.exec(content)) !== null) {
            scenarios.push({
                description: match[1].trim(),
                type: 'unit',
                priority: this.determinePriority(match[1])
            });
        }
        // Extract integration test scenarios
        const integrationPattern = /(?:integrate|interaction|between|with)\s+([^.,]+)/gi;
        while ((match = integrationPattern.exec(content)) !== null) {
            scenarios.push({
                description: match[1].trim(),
                type: 'integration',
                priority: this.determinePriority(match[1])
            });
        }
        // Extract E2E test scenarios
        const e2ePattern = /(?:end.to.end|e2e|workflow|user\s+flow)\s+([^.,]+)/gi;
        while ((match = e2ePattern.exec(content)) !== null) {
            scenarios.push({
                description: match[1].trim(),
                type: 'e2e',
                priority: this.determinePriority(match[1])
            });
        }
        return scenarios;
    }
    determinePriority(description) {
        const highPriorityTerms = ['critical', 'important', 'essential', 'must', 'required'];
        const mediumPriorityTerms = ['should', 'would', 'could', 'may'];
        description = description.toLowerCase();
        if (highPriorityTerms.some(term => description.includes(term))) {
            return 'high';
        }
        if (mediumPriorityTerms.some(term => description.includes(term))) {
            return 'medium';
        }
        return 'low';
    }
    generateTestCode(description, framework) {
        switch (framework) {
            case 'jest':
                return this.generateJestTest(description);
            case 'mocha':
                return this.generateMochaTest(description);
            case 'jasmine':
                return this.generateJasmineTest(description);
            case 'pytest':
                return this.generatePytestTest(description);
            case 'junit':
                return this.generateJUnitTest(description);
            default:
                return this.generateJestTest(description); // Default to Jest
        }
    }
    generateJestTest(description) {
        return `test('should ${description}', () => {
    // TODO: Implement test
    expect(/* actual */).toBe(/* expected */);
});`;
    }
    generateMochaTest(description) {
        return `it('should ${description}', () => {
    // TODO: Implement test
    assert.equal(/* actual */, /* expected */);
});`;
    }
    generateJasmineTest(description) {
        return `it('should ${description}', () => {
    // TODO: Implement test
    expect(/* actual */).toBe(/* expected */);
});`;
    }
    generatePytestTest(description) {
        return `def test_${description.toLowerCase().replace(/\s+/g, '_')}():
    # TODO: Implement test
    assert /* actual */ == /* expected */`;
    }
    generateJUnitTest(description) {
        return `@Test
public void test${description.replace(/\s+/g, '')}() {
    // TODO: Implement test
    assertEquals(/* expected */, /* actual */);
}`;
    }
    prioritizeTestCases(testCases) {
        // Sort by priority (high -> medium -> low) and then by type (unit -> integration -> e2e)
        return testCases.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const typeOrder = { unit: 0, integration: 1, e2e: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return typeOrder[a.type] - typeOrder[b.type];
        });
    }
    dispose() {
        // Clean up if needed
    }
}
exports.TestGeneratorService = TestGeneratorService;
//# sourceMappingURL=TestGeneratorService.js.map