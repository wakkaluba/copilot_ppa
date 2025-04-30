import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeOptimizer } from '../../../../src/services/codeQuality/codeOptimizer';
import { createMockDocument, createMockExtensionContext } from '../../../helpers/mockHelpers';

suite('CodeOptimizer Tests', () => {
    let optimizer: CodeOptimizer;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();
        optimizer = new CodeOptimizer(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    suite('Performance Analysis', () => {
        test('detects O(n²) time complexity', async () => {
            const mockDocument = createMockDocument(`
                function nestedLoops(arr) {
                    for(let i = 0; i < arr.length; i++) {
                        for(let j = 0; j < arr.length; j++) {
                            console.log(arr[i], arr[j]);
                        }
                    }
                }
            `);

            const analysis = await optimizer.analyzeCode(mockDocument);
            assert.ok(analysis.some(i => i.message.toLowerCase().includes('o(n²)')));
        });

        test('identifies inefficient array operations', async () => {
            const mockDocument = createMockDocument(`
                function arrayOperations(arr) {
                    return arr.indexOf('item') !== -1;
                }
            `);

            const analysis = await optimizer.analyzeCode(mockDocument);
            assert.ok(analysis.some(i => i.message.toLowerCase().includes('includes')));
        });

        test('detects memory leaks', async () => {
            const mockDocument = createMockDocument(`
                class MemoryLeakExample {
                    constructor() {
                        document.addEventListener('click', this.handleClick);
                    }
                    handleClick() {
                        // No removeEventListener
                    }
                }
            `);

            const analysis = await optimizer.analyzeCode(mockDocument);
            assert.ok(analysis.some(i => i.message.toLowerCase().includes('memory leak')));
        });
    });

    suite('Code Optimization', () => {
        test('suggests array optimizations', async () => {
            const mockDocument = createMockDocument(`
                function processArray(arr) {
                    const result = [];
                    for(let i = 0; i < arr.length; i++) {
                        if(arr[i] > 0) {
                            result.push(arr[i]);
                        }
                    }
                    return result;
                }
            `);

            const optimized = await optimizer.optimizeCode(mockDocument);
            assert.ok(optimized.includes('filter'));
        });

        test('suggests async/await optimizations', async () => {
            const mockDocument = createMockDocument(`
                function fetchData() {
                    return fetch('/api/data')
                        .then(response => response.json())
                        .then(data => processData(data))
                        .catch(error => handleError(error));
                }
            `);

            const optimized = await optimizer.optimizeCode(mockDocument);
            assert.ok(optimized.includes('async'));
            assert.ok(optimized.includes('await'));
        });

        test('optimizes string concatenation', async () => {
            const mockDocument = createMockDocument(`
                function buildString(items) {
                    let result = '';
                    for(let i = 0; i < items.length; i++) {
                        result = result + items[i] + ', ';
                    }
                    return result;
                }
            `);

            const optimized = await optimizer.optimizeCode(mockDocument);
            assert.ok(optimized.includes('join'));
        });
    });

    suite('Resource Usage', () => {
        test('identifies resource-intensive operations', async () => {
            const mockDocument = createMockDocument(`
                function processLargeData(data) {
                    const result = JSON.parse(JSON.stringify(data));
                    return deepClone(result);
                }
            `);

            const analysis = await optimizer.analyzeCode(mockDocument);
            assert.ok(analysis.some(i => i.message.toLowerCase().includes('resource')));
        });

        test('detects unnecessary object creation', async () => {
            const mockDocument = createMockDocument(`
                function createObjects() {
                    return new Array(1000).fill(null).map(() => new Object());
                }
            `);

            const analysis = await optimizer.analyzeCode(mockDocument);
            assert.ok(analysis.some(i => i.message.toLowerCase().includes('object creation')));
        });

        test('suggests memory optimizations', async () => {
            const mockDocument = createMockDocument(`
                class CacheExample {
                    constructor() {
                        this.cache = [];
                    }
                    addToCache(item) {
                        this.cache.push(item);
                        // No cache size limit
                    }
                }
            `);

            const analysis = await optimizer.analyzeCode(mockDocument);
            assert.ok(analysis.some(i => i.message.toLowerCase().includes('cache size')));
        });
    });

    suite('Error Handling', () => {
        test('handles parse errors gracefully', async () => {
            const mockDocument = createMockDocument(`
                function invalidSyntax {
                    // Missing parentheses
                }
            `);

            const analysis = await optimizer.analyzeCode(mockDocument);
            assert.ok(analysis.length > 0);
            assert.ok(analysis.some(i => i.severity === 'error'));
        });

        test('handles empty files', async () => {
            const mockDocument = createMockDocument('');

            const analysis = await optimizer.analyzeCode(mockDocument);
            assert.ok(Array.isArray(analysis));
        });

        test('handles large files', async () => {
            let largeCode = '';
            for(let i = 0; i < 1000; i++) {
                largeCode += `function func${i}() { return ${i}; }\n`;
            }
            const mockDocument = createMockDocument(largeCode);

            const analysis = await optimizer.analyzeCode(mockDocument);
            assert.ok(analysis.length > 0);
        });
    });
});
