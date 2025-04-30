import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeAnalysisService } from '../../../../src/services/codeQuality/services/CodeAnalysisService';
import { createMockDocument, createMockExtensionContext } from '../../../helpers/mockHelpers';

suite('CodeAnalysisService Tests', () => {
    let service: CodeAnalysisService;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();
        service = new CodeAnalysisService(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('analyzes file structure', async () => {
        const mockDocument = createMockDocument(`
            import { Something } from './somewhere';

            export class MyClass {
                private field: number;

                constructor() {
                    this.field = 0;
                }

                public method(): void {
                    // Method implementation
                }
            }
        `);

        const analysis = await service.analyzeFile(mockDocument.uri.fsPath);

        assert.ok(analysis.issues !== undefined);
        assert.ok(analysis.metrics !== undefined);
        assert.ok(analysis.metrics.complexity !== undefined);
        assert.ok(analysis.metrics.maintainability !== undefined);
        assert.ok(analysis.metrics.performance !== undefined);
    });

    test('calculates code metrics accurately', async () => {
        const mockDocument = createMockDocument(`
            function complexFunction() {
                let sum = 0;
                for (let i = 0; i < 10; i++) {
                    for (let j = 0; j < 10; j++) {
                        if (i % 2 === 0) {
                            sum += i * j;
                        } else {
                            sum -= i * j;
                        }
                    }
                }
                return sum;
            }
        `);

        const analysis = await service.analyzeFile(mockDocument.uri.fsPath);

        assert.ok(analysis.metrics.complexity > 1);
        assert.ok(analysis.metrics.maintainability >= 0);
        assert.ok(analysis.metrics.maintainability <= 100);
        assert.ok(analysis.metrics.performance !== undefined);
    });

    test('detects code smells', async () => {
        const mockDocument = createMockDocument(`
            class DataClass {
                private data: number[];

                constructor() {
                    this.data = [];
                }

                getData(): number[] {
                    return this.data;
                }

                setData(data: number[]): void {
                    this.data = data;
                }
            }
        `);

        const analysis = await service.analyzeFile(mockDocument.uri.fsPath);
        assert.ok(analysis.issues.some(i => i.type === 'code-smell'));
    });

    test('analyzes dependency structure', async () => {
        const mockDocument = createMockDocument(`
            import { Service1 } from './service1';
            import { Service2 } from './service2';
            import { Utils } from '../utils';

            export class MyService {
                constructor(
                    private service1: Service1,
                    private service2: Service2
                ) {}

                process() {
                    return Utils.combine(
                        this.service1.getData(),
                        this.service2.getData()
                    );
                }
            }
        `);

        const analysis = await service.analyzeFile(mockDocument.uri.fsPath);
        assert.ok(analysis.dependencies);
        assert.ok(analysis.dependencies.length >= 3);
    });

    test('provides improvement suggestions', async () => {
        const mockDocument = createMockDocument(`
            class ComplexClass {
                private data: any[];

                constructor() {
                    this.data = [];
                }

                processData(input: any): void {
                    for (let i = 0; i < input.length; i++) {
                        for (let j = 0; j < this.data.length; j++) {
                            if (input[i] === this.data[j]) {
                                console.log('Match found');
                            }
                        }
                    }
                }
            }
        `);

        const analysis = await service.analyzeFile(mockDocument.uri.fsPath);
        assert.ok(analysis.suggestions);
        assert.ok(analysis.suggestions.length > 0);
        assert.ok(analysis.suggestions.some(s =>
            s.type === 'performance' ||
            s.type === 'maintainability' ||
            s.type === 'complexity'
        ));
    });

    test('handles errors gracefully', async () => {
        const mockDocument = createMockDocument(`
            // Invalid syntax
            class {
                constructor() {

                }
            }
        `);

        const analysis = await service.analyzeFile(mockDocument.uri.fsPath);
        assert.ok(analysis.issues.some(i => i.severity === 'error'));
    });
});
