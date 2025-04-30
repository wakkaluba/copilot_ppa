import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { PythonAnalyzer } from '../../../src/performance/analyzers/pythonAnalyzer';
import { createMockDocument, createMockExtensionContext } from '../../helpers/mockHelpers';

suite('PythonAnalyzer Tests', () => {
    let analyzer: PythonAnalyzer;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();
        analyzer = new PythonAnalyzer(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    suite('Code Analysis', () => {
        test('detects inefficient list operations', async () => {
            const mockDocument = createMockDocument(`
                def process_list():
                    items = []
                    for i in range(1000):
                        items = items + [i]  # inefficient
                    return items
            `);

            const analysis = await analyzer.analyzePerformance(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('list concatenation')));
        });

        test('detects repeated string concatenation', async () => {
            const mockDocument = createMockDocument(`
                def build_string():
                    result = ""
                    for i in range(1000):
                        result += str(i)  # should use join
                    return result
            `);

            const analysis = await analyzer.analyzePerformance(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('string concatenation')));
        });

        test('detects expensive loops', async () => {
            const mockDocument = createMockDocument(`
                def heavy_computation():
                    result = 0
                    for i in range(1000000):
                        for j in range(1000000):
                            result += i ** j
                    return result
            `);

            const analysis = await analyzer.analyzePerformance(mockDocument);
            assert.ok(analysis.issues.some(i => i.type === 'nested-loop'));
            assert.ok(analysis.issues.some(i => i.severity === 'warning'));
        });
    });

    suite('Memory Analysis', () => {
        test('detects memory-intensive list comprehensions', async () => {
            const mockDocument = createMockDocument(`
                def create_large_list():
                    # Creates a large list in memory
                    return [x**2 for x in range(1000000)]
            `);

            const analysis = await analyzer.analyzeMemoryUsage(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('large memory')));
        });

        test('detects memory leaks in closures', async () => {
            const mockDocument = createMockDocument(`
                def create_closure():
                    data = []
                    def inner():
                        data.append(1)  # potential memory leak
                    return inner
            `);

            const analysis = await analyzer.analyzeMemoryUsage(mockDocument);
            assert.ok(analysis.issues.some(i => i.type === 'memory-leak'));
        });

        test('detects unclosed resources', async () => {
            const mockDocument = createMockDocument(`
                def read_file():
                    f = open('large.txt', 'r')
                    data = f.read()
                    # Missing f.close()
            `);

            const analysis = await analyzer.analyzeMemoryUsage(mockDocument);
            assert.ok(analysis.issues.some(i => i.type === 'resource-leak'));
        });
    });

    suite('Performance Pattern Analysis', () => {
        test('detects inefficient dictionary access', async () => {
            const mockDocument = createMockDocument(`
                def process_dict(data):
                    if 'key' in data.keys():  # inefficient
                        return data['key']
            `);

            const analysis = await analyzer.analyzePerformance(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('dict access')));
        });

        test('detects inefficient list searches', async () => {
            const mockDocument = createMockDocument(`
                def find_item(items, target):
                    return target in items  # O(n) for list
            `);

            const analysis = await analyzer.analyzePerformance(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('linear search')));
        });
    });

    suite('Concurrency Analysis', () => {
        test('detects GIL-heavy operations', async () => {
            const mockDocument = createMockDocument(`
                def cpu_intensive():
                    import threading
                    threads = []
                    for i in range(10):
                        t = threading.Thread(target=lambda: sum(x**2 for x in range(1000000)))
                        threads.append(t)
                        t.start()
            `);

            const analysis = await analyzer.analyzeConcurrency(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('gil contention')));
        });

        test('detects thread safety issues', async () => {
            const mockDocument = createMockDocument(`
                counter = 0
                def increment():
                    global counter
                    counter += 1  # Not thread-safe
            `);

            const analysis = await analyzer.analyzeConcurrency(mockDocument);
            assert.ok(analysis.issues.some(i => i.type === 'thread-safety'));
        });
    });

    suite('IO Analysis', () => {
        test('detects synchronous IO in async code', async () => {
            const mockDocument = createMockDocument(`
                async def process_file():
                    with open('data.txt', 'r') as f:  # blocking IO
                        return f.read()
            `);

            const analysis = await analyzer.analyzeIO(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('blocking io')));
        });

        test('detects inefficient file reading', async () => {
            const mockDocument = createMockDocument(`
                def read_large_file():
                    with open('large.txt', 'r') as f:
                        return f.read()  # Reads entire file into memory
            `);

            const analysis = await analyzer.analyzeIO(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('memory efficient')));
        });
    });
});
