import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { JavaAnalyzer } from '../../../src/performance/analyzers/javaAnalyzer';
import { createMockDocument, createMockExtensionContext } from '../../helpers/mockHelpers';

suite('JavaAnalyzer Tests', () => {
    let analyzer: JavaAnalyzer;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();
        analyzer = new JavaAnalyzer(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    suite('Code Analysis', () => {
        test('detects tight loops and heavy computations', async () => {
            const mockDocument = createMockDocument(`
                public class PerformanceTest {
                    public void heavyComputation() {
                        for(int i = 0; i < 1000000; i++) {
                            for(int j = 0; j < 1000000; j++) {
                                double result = Math.pow(i, j);
                            }
                        }
                    }
                }
            `);

            const analysis = await analyzer.analyzePerformance(mockDocument);
            assert.ok(analysis.issues.some(i => i.type === 'nested-loop'));
            assert.ok(analysis.issues.some(i => i.severity === 'warning'));
        });

        test('detects inefficient string concatenation', async () => {
            const mockDocument = createMockDocument(`
                public class StringTest {
                    public String buildString() {
                        String result = "";
                        for(int i = 0; i < 1000; i++) {
                            result = result + "item" + i;
                        }
                        return result;
                    }
                }
            `);

            const analysis = await analyzer.analyzePerformance(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('string concatenation')));
        });

        test('detects memory leaks in collections', async () => {
            const mockDocument = createMockDocument(`
                public class CollectionTest {
                    private List<String> items = new ArrayList<>();

                    public void addItems() {
                        while(true) {
                            items.add("test");
                        }
                    }
                }
            `);

            const analysis = await analyzer.analyzePerformance(mockDocument);
            assert.ok(analysis.issues.some(i => i.type === 'memory-leak'));
        });
    });

    suite('Memory Analysis', () => {
        test('detects large object allocations', async () => {
            const mockDocument = createMockDocument(`
                public class MemoryTest {
                    public void allocateMemory() {
                        int[][] largeArray = new int[10000][10000];
                    }
                }
            `);

            const analysis = await analyzer.analyzeMemoryUsage(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('large allocation')));
        });

        test('detects resource leaks', async () => {
            const mockDocument = createMockDocument(`
                public class ResourceTest {
                    public void readFile() {
                        FileInputStream fis = new FileInputStream("test.txt");
                        // No close() call
                    }
                }
            `);

            const analysis = await analyzer.analyzeMemoryUsage(mockDocument);
            assert.ok(analysis.issues.some(i => i.type === 'resource-leak'));
        });
    });

    suite('Thread Analysis', () => {
        test('detects thread contention', async () => {
            const mockDocument = createMockDocument(`
                public class ThreadTest {
                    private Object lock = new Object();

                    public void method1() {
                        synchronized(lock) {
                            // Long operation
                            Thread.sleep(1000);
                        }
                    }

                    public void method2() {
                        synchronized(lock) {
                            // Another long operation
                            Thread.sleep(1000);
                        }
                    }
                }
            `);

            const analysis = await analyzer.analyzeThreading(mockDocument);
            assert.ok(analysis.issues.some(i => i.type === 'thread-contention'));
        });

        test('detects thread pool sizing issues', async () => {
            const mockDocument = createMockDocument(`
                public class ThreadPoolTest {
                    public void createThreadPool() {
                        ExecutorService executor = Executors.newFixedThreadPool(1000);
                    }
                }
            `);

            const analysis = await analyzer.analyzeThreading(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('thread pool size')));
        });
    });

    suite('IO Analysis', () => {
        test('detects inefficient file operations', async () => {
            const mockDocument = createMockDocument(`
                public class FileTest {
                    public void readFile() {
                        File file = new File("large.txt");
                        byte[] bytes = Files.readAllBytes(file.toPath());
                    }
                }
            `);

            const analysis = await analyzer.analyzeIO(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('large file')));
        });

        test('detects unbuffered IO', async () => {
            const mockDocument = createMockDocument(`
                public class IOTest {
                    public void writeFile() {
                        FileOutputStream fos = new FileOutputStream("test.txt");
                        fos.write(data);
                    }
                }
            `);

            const analysis = await analyzer.analyzeIO(mockDocument);
            assert.ok(analysis.issues.some(i => i.message.toLowerCase().includes('unbuffered')));
        });
    });
});
