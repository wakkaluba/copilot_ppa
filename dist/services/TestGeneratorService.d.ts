import * as vscode from 'vscode';
import { ConversationHistory } from './ConversationHistory';
interface TestCase {
    description: string;
    testCode: string;
    priority: 'high' | 'medium' | 'low';
    type: 'unit' | 'integration' | 'e2e';
}
export declare class TestGeneratorService implements vscode.Disposable {
    private readonly history;
    private readonly frameworkPatterns;
    constructor(history: ConversationHistory);
    generateTests(context: string): Promise<TestCase[]>;
    private findTestRelatedMessages;
    private isTestRelated;
    private isContextRelevant;
    private detectTestFramework;
    private extractTestCases;
    private extractScenariosFromMessage;
    private determinePriority;
    private generateTestCode;
    private generateJestTest;
    private generateMochaTest;
    private generateJasmineTest;
    private generatePytestTest;
    private generateJUnitTest;
    private prioritizeTestCases;
    dispose(): void;
}
export {};
