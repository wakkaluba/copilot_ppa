import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { BestPracticesChecker } from '../../../../src/services/codeQuality/bestPracticesChecker';
import { createMockDocument, createMockExtensionContext } from '../../../helpers/mockHelpers';

suite('BestPracticesChecker Tests', () => {
    let checker: BestPracticesChecker;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();
        checker = new BestPracticesChecker(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    suite('Code Structure Analysis', () => {
        test('detects long functions', async () => {
            const mockDocument = createMockDocument(`
                function veryLongFunction() {
                    let result = 0;
                    // Repeat 50 times to create a long function
                    ${Array(50).fill('result += 1;').join('\n                    ')}
                    return result;
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'long-function'));
        });

        test('detects high cyclomatic complexity', async () => {
            const mockDocument = createMockDocument(`
                function complexFunction(a, b, c, d) {
                    if (a) {
                        if (b) {
                            if (c) {
                                if (d) {
                                    return 1;
                                } else {
                                    return 2;
                                }
                            } else {
                                return 3;
                            }
                        } else {
                            return 4;
                        }
                    } else {
                        return 5;
                    }
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'high-complexity'));
        });

        test('detects deeply nested code', async () => {
            const mockDocument = createMockDocument(`
                function deeplyNested() {
                    for (let i = 0; i < 10; i++) {
                        while (true) {
                            if (condition1) {
                                if (condition2) {
                                    if (condition3) {
                                        doSomething();
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'deep-nesting'));
        });
    });

    suite('Naming Conventions', () => {
        test('identifies inconsistent naming', async () => {
            const mockDocument = createMockDocument(`
                const myVariable = 1;
                const MY_CONSTANT = 2;
                const someOtherVariable = 3;
                const ANOTHER_constant = 4; // Inconsistent
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'naming-convention'));
        });

        test('checks class naming conventions', async () => {
            const mockDocument = createMockDocument(`
                class myClass {} // Should be PascalCase
                class AnotherClass {}
                class thirdClass {} // Should be PascalCase
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.message.toLowerCase().includes('pascal')));
        });
    });

    suite('Code Duplication', () => {
        test('detects duplicated code blocks', async () => {
            const mockDocument = createMockDocument(`
                function process1() {
                    let sum = 0;
                    for (let i = 0; i < 10; i++) {
                        sum += i * 2;
                    }
                    return sum;
                }

                function process2() {
                    let sum = 0;
                    for (let i = 0; i < 10; i++) {
                        sum += i * 2;
                    }
                    return sum;
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'code-duplication'));
        });

        test('suggests extraction of duplicated code', async () => {
            const mockDocument = createMockDocument(`
                function validateUser1(user) {
                    if (!user.name || user.name.length < 2) return false;
                    if (!user.email || !user.email.includes('@')) return false;
                    if (!user.age || user.age < 18) return false;
                    return true;
                }

                function validateUser2(user) {
                    if (!user.name || user.name.length < 2) return false;
                    if (!user.email || !user.email.includes('@')) return false;
                    if (!user.age || user.age < 18) return false;
                    return true;
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.suggestions.some(s => s.type === 'extract-function'));
        });
    });

    suite('Error Handling', () => {
        test('checks for proper error handling', async () => {
            const mockDocument = createMockDocument(`
                function riskyOperation() {
                    JSON.parse(data); // No try-catch
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'missing-error-handling'));
        });

        test('identifies empty catch blocks', async () => {
            const mockDocument = createMockDocument(`
                try {
                    riskyOperation();
                } catch (error) {
                    // Empty catch block
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'empty-catch'));
        });
    });

    suite('Comments and Documentation', () => {
        test('checks for missing function documentation', async () => {
            const mockDocument = createMockDocument(`
                function complexCalculation(a, b, c) {
                    return (a * b) / c + Math.sqrt(a + b + c);
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'missing-documentation'));
        });

        test('validates JSDoc completeness', async () => {
            const mockDocument = createMockDocument(`
                /** Calculates something */
                function calculate(a, b) { // Missing param documentation
                    return a + b;
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'incomplete-jsdoc'));
        });
    });

    suite('Language-Specific Best Practices', () => {
        test('checks TypeScript-specific practices', async () => {
            const mockDocument = createMockDocument(`
                function processData(data: any) { // Avoid any
                    return data;
                }
            `, 'typescript');

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'typescript-specific'));
        });

        test('identifies unsafe type assertions', async () => {
            const mockDocument = createMockDocument(`
                const value = someValue as any as SpecificType;
            `, 'typescript');

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'unsafe-type-assertion'));
        });
    });

    suite('Configuration', () => {
        test('respects custom rule settings', async () => {
            checker.configure({
                maxFunctionLength: 5,
                maxComplexity: 3,
                maxNestingDepth: 2
            });

            const mockDocument = createMockDocument(`
                function shortButComplex(a, b) {
                    if (a) {
                        if (b) {
                            return true;
                        }
                    }
                    return false;
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'high-complexity'));
        });

        test('handles rule exclusions', async () => {
            checker.configure({
                disabledRules: ['missing-documentation']
            });

            const mockDocument = createMockDocument(`
                function undocumentedFunction() {
                    return true;
                }
            `);

            const results = await checker.analyzeDocument(mockDocument);
            assert.ok(!results.issues.some(i => i.type === 'missing-documentation'));
        });
    });
});
