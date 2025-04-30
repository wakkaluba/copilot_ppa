import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { BestPracticesService } from '../../../../src/services/codeQuality/BestPracticesService';
import { createMockDocument, createMockExtensionContext } from '../../../helpers/mockHelpers';

suite('BestPracticesService Tests', () => {
    let service: BestPracticesService;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();
        service = new BestPracticesService(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    suite('Anti-Pattern Detection', () => {
        test('detects JavaScript anti-patterns', async () => {
            const mockDocument = createMockDocument(`
                function test() {
                    var x = 1;
                    console.log(x);
                }
            `);
            mockDocument.uri.fsPath = 'test.js';

            const issues = await service.detectAntiPatterns(mockDocument);
            assert.ok(issues.some(i => i.message.includes('var') && i.severity === 'warning'));
            assert.ok(issues.some(i => i.message.includes('console.log') && i.severity === 'warning'));
        });

        test('detects Python anti-patterns', async () => {
            const mockDocument = createMockDocument(`
                from module import *
                def test():
                    pass
            `);
            mockDocument.uri.fsPath = 'test.py';

            const issues = await service.detectAntiPatterns(mockDocument);
            assert.ok(issues.some(i => i.message.includes('wildcard import')));
        });

        test('detects Java anti-patterns', async () => {
            const mockDocument = createMockDocument(`
                public class Test {
                    public void method() {
                        try {
                            // Something
                        } catch(Exception e) {
                            e.printStackTrace();
                        }
                    }
                }
            `);
            mockDocument.uri.fsPath = 'Test.java';

            const issues = await service.detectAntiPatterns(mockDocument);
            assert.ok(issues.some(i => i.message.includes('printStackTrace')));
        });
    });

    suite('Code Consistency', () => {
        test('checks naming conventions', async () => {
            const mockDocument = createMockDocument(`
                function badName() {
                    let bad_variable_name = 1;
                }
            `);

            const issues = await service.checkCodeConsistency(mockDocument);
            assert.ok(issues.some(i => i.message.toLowerCase().includes('naming convention')));
        });

        test('checks style consistency', async () => {
            const mockDocument = createMockDocument(`
                function test(){
                return true;
                }
            `);

            const issues = await service.checkCodeConsistency(mockDocument);
            assert.ok(issues.some(i => i.message.toLowerCase().includes('style')));
        });

        test('checks comment consistency', async () => {
            const mockDocument = createMockDocument(`
                function test() {
                    //bad comment style
                    /* inconsistent comment style */
                }
            `);

            const issues = await service.checkCodeConsistency(mockDocument);
            assert.ok(issues.some(i => i.message.toLowerCase().includes('comment')));
        });
    });

    suite('Design Improvements', () => {
        test('suggests method length improvements', async () => {
            const mockDocument = createMockDocument(`
                function veryLongMethod() {
                    // 50 lines of code...
                    let line1 = 1;
                    let line2 = 2;
                    // ... many more lines
                }
            `);

            const suggestions = await service.suggestDesignImprovements(mockDocument);
            assert.ok(suggestions.some(s => s.message.toLowerCase().includes('method length')));
        });

        test('suggests parameter count improvements', async () => {
            const mockDocument = createMockDocument(`
                function tooManyParams(a, b, c, d, e, f, g, h) {
                    return a + b + c + d + e + f + g + h;
                }
            `);

            const suggestions = await service.suggestDesignImprovements(mockDocument);
            assert.ok(suggestions.some(s => s.message.toLowerCase().includes('parameter')));
        });

        test('suggests complexity improvements', async () => {
            const mockDocument = createMockDocument(`
                function complexMethod() {
                    if (a) {
                        if (b) {
                            while (c) {
                                if (d) {
                                    // Deep nesting
                                }
                            }
                        }
                    }
                }
            `);

            const suggestions = await service.suggestDesignImprovements(mockDocument);
            assert.ok(suggestions.some(s => s.message.toLowerCase().includes('complex')));
        });
    });
});
