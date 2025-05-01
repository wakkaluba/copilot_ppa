import * as vscode from 'vscode';
import { SecuritySeverity } from '../../../../src/security/types';
import { BestPracticesAnalyzer } from '../../../../src/services/codeQuality/analyzers/BestPracticesAnalyzer';
import { Logger } from '../../../../src/utils/logger';

jest.mock('../../../../src/utils/logger');

describe('BestPracticesAnalyzer', () => {
    let analyzer: BestPracticesAnalyzer;

    beforeEach(() => {
        jest.spyOn(Logger, 'getInstance').mockReturnValue({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        } as unknown as Logger);

        analyzer = new BestPracticesAnalyzer();
    });

    describe('analyzeDocument', () => {
        it('should detect var usage', async () => {
            const document = createMockDocument(`
                function oldCode() {
                    var x = 1;
                    var y = 2;
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].description.toLowerCase()).toContain('var');
            expect(result.issues[0].severity).toBe(SecuritySeverity.Low);
        });

        it('should detect console.log usage', async () => {
            const document = createMockDocument(`
                function debug() {
                    console.log('test');
                    console.debug('test');
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].description.toLowerCase()).toContain('console.log');
        });

        it('should detect magic numbers', async () => {
            const document = createMockDocument(`
                function calculate() {
                    return value * 1.15;  // Tax calculation
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].description.toLowerCase()).toContain('magic number');
        });

        it('should detect long functions', async () => {
            const document = createMockDocument(`
                function veryLongFunction() {
                    let sum = 0;
                    // Generate a long function with many lines
                    ${Array(31).fill('sum += 1;').join('\n')}
                    return sum;
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].description.toLowerCase()).toContain('function length');
        });

        it('should detect complex conditions', async () => {
            const document = createMockDocument(`
                function complexCondition(a, b, c, d) {
                    if (a > 0 && b < 10 || c === 0 && d !== null || a === b) {
                        return true;
                    }
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].description.toLowerCase()).toContain('complex condition');
        });

        it('should detect nested callbacks', async () => {
            const document = createMockDocument(`
                function nestedCallbacks() {
                    doSomething(() => {
                        doSomethingElse(() => {
                            andThenThis(() => {
                                finallyThis();
                            });
                        });
                    });
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].description.toLowerCase()).toContain('callback');
        });

        it('should not flag good practices', async () => {
            const document = createMockDocument(`
                function goodCode() {
                    const TAX_RATE = 0.15;
                    const price = 100;
                    return price * TAX_RATE;
                }
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.issues.length).toBe(0);
        });

        it('should create appropriate diagnostics', async () => {
            const document = createMockDocument(`
                var globalVar = 'bad practice';
            `);

            const result = await analyzer.analyzeDocument(document);

            expect(result.diagnostics.length).toBeGreaterThan(0);
            expect(result.diagnostics[0].severity).toBe(vscode.DiagnosticSeverity.Warning);
            expect(result.diagnostics[0].source).toBe('best-practices');
        });
    });
});

function createMockDocument(content: string): vscode.TextDocument {
    return {
        getText: () => content,
        uri: { fsPath: 'test.ts' } as vscode.Uri,
        languageId: 'typescript',
        positionAt: (offset: number) => new vscode.Position(0, offset),
        lineAt: (line: number) => ({ text: content.split('\n')[line] } as vscode.TextLine),
    } as vscode.TextDocument;
}
