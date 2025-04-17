import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { strict as assert } from 'assert';
import { CodeOptimizer } from '../../../../src/services/codeQuality/codeOptimizer';
import { createMockDocument, createMockExtensionContext, createMockOutputChannel } from '../../../helpers/mockHelpers';

suite('CodeOptimizer Tests', () => {
    let optimizer: CodeOptimizer;
    let sandbox: sinon.SinonSandbox;
    let outputChannel: vscode.OutputChannel;
    let context: vscode.ExtensionContext;

    setup(() => {
        sandbox = sinon.createSandbox();
        outputChannel = createMockOutputChannel();
        context = createMockExtensionContext();
        
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);
        optimizer = new CodeOptimizer(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('optimizeFunction should improve loop performance', async () => {
        const document = createMockDocument(`
            function processArray(arr) {
                for (let i = 0; i < arr.length; i++) {
                    console.log(arr[i]);
                }
            }
        `);

        const optimized = await optimizer.optimizeFunction(document, 'processArray');
        
        assert.ok(!optimized.includes('arr.length'));
        assert.ok(optimized.includes('const len ='));
        assert.ok(optimized.includes('< len;'));
    });

    test('optimizeFunction should convert forEach to for...of when appropriate', async () => {
        const document = createMockDocument(`
            function processItems(items) {
                items.forEach(item => {
                    processItem(item);
                });
            }
        `);

        const optimized = await optimizer.optimizeFunction(document, 'processItems');
        
        assert.ok(!optimized.includes('forEach'));
        assert.ok(optimized.includes('for (const item of items)'));
    });

    test('analyzeMemoryUsage should identify potential memory leaks', async () => {
        const document = createMockDocument(`
            function createHandlers() {
                const handlers = [];
                for (let i = 0; i < 10; i++) {
                    handlers.push(() => {
                        console.log(i);
                    });
                }
                return handlers;
            }
        `);

        const issues = await optimizer.analyzeMemoryUsage(document);
        
        assert.ok(issues.some(i => i.type === 'memory'));
        assert.ok(issues.some(i => i.message.includes('closure')));
    });

    test('suggestOptimizations should propose performance improvements', async () => {
        const document = createMockDocument(`
            function calculateFactorial(n) {
                if (n <= 1) return 1;
                return n * calculateFactorial(n - 1);
            }
        `);

        const suggestions = await optimizer.suggestOptimizations(document);
        
        assert.ok(suggestions.some(s => s.type === 'caching'));
        assert.ok(suggestions.some(s => s.message.includes('memoization')));
    });

    test('analyzeRedundancy should identify redundant operations', async () => {
        const document = createMockDocument(`
            function processString(str) {
                return str.trim().toLowerCase().trim();
            }
        `);

        const issues = await optimizer.analyzeRedundancy(document);
        
        assert.ok(issues.some(i => i.type === 'redundancy'));
        assert.ok(issues.some(i => i.message.includes('duplicate trim')));
    });

    test('suggestPropertyAccess should propose optimization', async () => {
        const document = createMockDocument(`
            function deepGet(obj) {
                return obj.very.deep.nested.property.value;
            }
        `);

        const suggestions = await optimizer.suggestPropertyAccess(document);
        
        assert.ok(suggestions.some(s => s.type === 'propertyAccess'));
        assert.ok(suggestions.some(s => s.message.includes('destructuring')));
    });

    test('suggestAsyncOptimizations should propose improvements', async () => {
        const document = createMockDocument(`
            function processData(items) {
                items.forEach(item => {
                    fetch(item.url);
                });
            }
        `);

        const suggestions = await optimizer.suggestAsyncOptimizations(document);
        
        assert.ok(suggestions.some(s => s.type === 'async'));
        assert.ok(suggestions.some(s => s.message.includes('Promise.all')));
    });

    test('suggestDataStructures should propose appropriate structures', async () => {
        const document = createMockDocument(`
            function uniqueValues(arr) {
                return arr.filter((item, index) => arr.indexOf(item) === index);
            }
        `);

        const suggestions = await optimizer.suggestDataStructures(document);
        
        assert.ok(suggestions.some(s => s.type === 'dataStructure'));
        assert.ok(suggestions.some(s => s.message.includes('Set')));
    });

    test('analyzeTimeComplexity should identify inefficient algorithms', async () => {
        const document = createMockDocument(`
            function findDuplicates(arr) {
                const duplicates = [];
                for (let i = 0; i < arr.length; i++) {
                    for (let j = i + 1; j < arr.length; j++) {
                        if (arr[i] === arr[j]) {
                            duplicates.push(arr[i]);
                        }
                    }
                }
                return duplicates;
            }
        `);

        const analysis = await optimizer.analyzeTimeComplexity(document);
        
        assert.strictEqual(analysis.complexity, 'O(n²)');
        assert.ok(analysis.suggestions.some(s => s.includes('Map') || s.includes('Set')));
    });
});