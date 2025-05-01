import * as vscode from 'vscode';
import { Logger } from '../../../logging/logger';
import { BestPracticesChecker } from '../../../services/codeQuality/bestPracticesChecker';
import { BestPracticeIssue } from '../../../types';

jest.mock('../../../logging/logger');
jest.mock('vscode');

describe('BestPracticesChecker', () => {
    let checker: BestPracticesChecker;
    let mockContext: vscode.ExtensionContext;
    let mockDocument: vscode.TextDocument;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path'
        } as vscode.ExtensionContext;

        mockDocument = {
            fileName: 'test.ts',
            getText: jest.fn().mockReturnValue('test code'),
            lineAt: jest.fn().mockReturnValue({ text: 'test line' })
        } as unknown as vscode.TextDocument;

        // Mock Logger
        jest.spyOn(Logger, 'getInstance').mockImplementation(() => {
            return {
                log: jest.fn(),
                error: jest.fn(),
                warn: jest.fn()
            } as unknown as Logger;
        });

        checker = new BestPracticesChecker(mockContext, Logger.getInstance());
    });

    describe('detectAntiPatterns', () => {
        it('should detect common anti-patterns', async () => {
            const result = await checker.detectAntiPatterns(mockDocument);
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('suggestDesignImprovements', () => {
        it('should suggest design improvements', async () => {
            const result = await checker.suggestDesignImprovements(mockDocument);
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('checkCodeConsistency', () => {
        it('should check code consistency', async () => {
            const result = await checker.checkCodeConsistency(mockDocument);
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('checkAll', () => {
        it('should analyze the document and return issues', async () => {
            const mockIssues: BestPracticeIssue[] = [{
                file: 'test.ts',
                line: 1,
                column: 0,
                severity: 'warning',
                description: 'Test issue',
                recommendation: 'Fix the issue',
                category: 'antiPattern'
            }];

            jest.spyOn(checker, 'detectAntiPatterns').mockResolvedValue(mockIssues);
            jest.spyOn(checker, 'suggestDesignImprovements').mockResolvedValue([]);
            jest.spyOn(checker, 'checkCodeConsistency').mockResolvedValue([]);

            const result = await checker.checkAll(mockDocument);
            expect(result).toEqual(mockIssues);
        });
    });
});
