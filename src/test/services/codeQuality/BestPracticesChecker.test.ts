import * as vscode from 'vscode';
import { SecuritySeverity } from '../../../security/types';
import { BestPracticesChecker } from '../../../services/codeQuality/analyzers/BestPracticesChecker';
import { Logger } from '../../../utils/logger';

jest.mock('../../../utils/logger');

describe('BestPracticesChecker', () => {
    let checker: BestPracticesChecker;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        mockLogger = new Logger() as jest.Mocked<Logger>;
        checker = new BestPracticesChecker(mockLogger);
    });

    describe('analyzeDocument', () => {
        it('should detect long methods', async () => {
            const longMethod = 'function veryLongFunction() {\n' +
                Array(32).fill('  console.log("line");\n').join('') +
                '}';
            const document = createMockDocument(longMethod);

            const result = await checker.analyzeDocument(document);

            expect(result.issues.length).toBe(1);
            expect(result.issues[0].id).toBe('BP001');
            expect(result.issues[0].severity).toBe(SecuritySeverity.Medium);
        });

        it('should detect high cyclomatic complexity', async () => {
            const complexCode = `
                function complexFunction(x) {
                    if (x > 0) {
                        if (x < 10) {
                            for (let i = 0; i < x; i++) {
                                while (true) {
                                    if (x === 5) break;
                                }
                            }
                        } else if (x < 20) {
                            switch(x) {
                                case 15: return true;
                                case 16: return false;
                                default: return null;
                            }
                        }
                    }
                    return x > 0 ? true : false;
                }
            `;
            const document = createMockDocument(complexCode);

            const result = await checker.analyzeDocument(document);

            expect(result.issues.length).toBe(1);
            expect(result.issues[0].id).toBe('BP002');
            expect(result.issues[0].severity).toBe(SecuritySeverity.Medium);
        });

        it('should detect non-descriptive variable names', async () => {
            const code = `
                let x = 5;
                const y = "test";
                var z = true;
            `;
            const document = createMockDocument(code);

            const result = await checker.analyzeDocument(document);

            expect(result.issues.length).toBe(3);
            expect(result.issues[0].id).toBe('BP003');
            expect(result.issues[0].severity).toBe(SecuritySeverity.Low);
        });

        it('should detect missing JSDoc comments', async () => {
            const code = `
                function calculateTotal(items) {
                    return items.reduce((sum, item) => sum + item.price, 0);
                }

                class UserService {
                    getUser(id) {
                        return this.users.find(u => u.id === id);
                    }
                }
            `;
            const document = createMockDocument(code);

            const result = await checker.analyzeDocument(document);

            expect(result.issues.length).toBe(2);
            expect(result.issues[0].id).toBe('BP004');
            expect(result.issues[0].severity).toBe(SecuritySeverity.Low);
        });

        it('should not flag properly documented code', async () => {
            const code = `
                /**
                 * Calculates the total price of items
                 * @param {Array} items - Array of items with prices
                 * @returns {number} Total price
                 */
                function calculateTotal(items) {
                    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
                    return totalPrice;
                }
            `;
            const document = createMockDocument(code);

            const result = await checker.analyzeDocument(document);

            expect(result.issues.length).toBe(0);
        });

        it('should create appropriate diagnostics', async () => {
            const code = 'let x = 5;';
            const document = createMockDocument(code);

            const result = await checker.analyzeDocument(document);

            expect(result.diagnostics.length).toBe(1);
            expect(result.diagnostics[0].severity).toBe(vscode.DiagnosticSeverity.Information);
            expect(result.diagnostics[0].source).toBe('best-practices');
        });
    });
});

function createMockDocument(content: string): vscode.TextDocument {
    return {
        getText: () => content,
        uri: { fsPath: 'test.ts' } as vscode.Uri,
        positionAt: (offset: number) => new vscode.Position(0, offset),
        lineAt: (line: number) => ({ text: content.split('\n')[line] } as vscode.TextLine),
    } as vscode.TextDocument;
}
