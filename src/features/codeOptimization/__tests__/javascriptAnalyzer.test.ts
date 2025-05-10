import * as vscode from 'vscode';
import { ILogger } from '../../../logging/ILogger';
import { JavaScriptAnalyzer } from '../analyzers/javascriptAnalyzer';

describe('JavaScriptAnalyzer', () => {
    let analyzer: JavaScriptAnalyzer;
    let mockLogger: jest.Mocked<ILogger>;

    beforeEach(() => {
        // Create mock implementations
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            log: jest.fn()
        } as unknown as jest.Mocked<ILogger>;

        analyzer = new JavaScriptAnalyzer(mockLogger);
    });

    test('analyzeCode identifies performance issues in JavaScript code', async () => {
        const javascriptCode = `
            function slowFunction() {
                let result = 0;
                for (let i = 0; i < 10000; i++) {
                    for (let j = 0; j < 10000; j++) {
                        result += i * j;
                    }
                }
                return result;
            }

            // Memory leak potential
            let cache = {};
            function addToCache(key, value) {
                cache[key] = value;
            }

            // Inefficient DOM operations
            function updateDom() {
                for (let i = 0; i < 100; i++) {
                    document.getElementById('result').innerHTML += '<div>' + i + '</div>';
                }
            }
        `;

        const mockDocument = {
            getText: jest.fn().mockReturnValue(javascriptCode),
            lineAt: jest.fn().mockImplementation(lineNum => ({
                text: javascriptCode.split('\n')[lineNum],
                lineNumber: lineNum
            })),
            lineCount: javascriptCode.split('\n').length
        } as unknown as vscode.TextDocument;

        const result = await analyzer.analyzeCode(mockDocument);

        // Verify that analysis produced results
        expect(result).toBeDefined();
        expect(result.issues.length).toBeGreaterThan(0);

        // Check that nested loops are detected
        const nestedLoopIssue = result.issues.find(issue =>
            issue.description.includes('nested loop') ||
            issue.description.toLowerCase().includes('nested iteration'));
        expect(nestedLoopIssue).toBeDefined();

        // Check that memory leaks are detected
        const memoryLeakIssue = result.issues.find(issue =>
            issue.description.toLowerCase().includes('memory') ||
            issue.description.toLowerCase().includes('cache'));
        expect(memoryLeakIssue).toBeDefined();

        // Check that DOM inefficiencies are detected
        const domIssue = result.issues.find(issue =>
            issue.description.toLowerCase().includes('dom'));
        expect(domIssue).toBeDefined();
    });

    test('calculateComplexity correctly computes code complexity', () => {
        const simpleCode = `
            function add(a, b) {
                return a + b;
            }
        `;

        const complexCode = `
            function processData(data) {
                let result = 0;
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i] > 10) {
                            result += data[i];
                        } else if (data[i] < 0) {
                            result -= data[i];
                        } else {
                            switch(data[i]) {
                                case 1:
                                    result += 1;
                                    break;
                                case 2:
                                    result += 2;
                                    break;
                                default:
                                    result += 0.5;
                            }
                        }
                    }
                }
                return result;
            }
        `;

        const simpleComplexity = analyzer.calculateComplexity(simpleCode);
        const highComplexity = analyzer.calculateComplexity(complexCode);

        // Simple code should have low complexity
        expect(simpleComplexity).toBeLessThan(5);

        // Complex code should have higher complexity
        expect(highComplexity).toBeGreaterThan(10);

        // Complex code should have higher complexity than simple code
        expect(highComplexity).toBeGreaterThan(simpleComplexity);
    });

    test('detectAsyncIssues identifies promise and async/await issues', () => {
        const codeWithPromiseIssues = `
            function fetchData() {
                // Missing return
                fetch('https://api.example.com/data')
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                    });
            }

            // Missing catch
            function processApiData() {
                return fetch('https://api.example.com/data')
                    .then(response => response.json())
                    .then(data => transformData(data));
            }

            // Unhandled promise rejection
            async function loadUserData() {
                const response = await fetch('https://api.example.com/users');
                const data = await response.json();
                return data;
            }
        `;

        const issues = analyzer.detectAsyncIssues(codeWithPromiseIssues);

        // Should detect various async/promise issues
        expect(issues.length).toBeGreaterThan(0);

        // Check for missing catch
        const missingCatchIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('catch') ||
            issue.description.toLowerCase().includes('error handling'));
        expect(missingCatchIssue).toBeDefined();
    });

    test('identifyMemoryLeaks detects potential memory leaks', () => {
        const codeWithMemoryLeaks = `
            // Global cache without cleanup
            const cache = {};

            function addToCache(key, value) {
                cache[key] = value;
            }

            // Event listeners without removal
            function setupListeners() {
                document.getElementById('button').addEventListener('click', handleClick);
            }

            // Closure capturing large data
            function processLargeData(data) {
                return function() {
                    return data.map(item => item * 2);
                }
            }
        `;

        const leaks = analyzer.identifyMemoryLeaks(codeWithMemoryLeaks);

        // Should detect various memory leak patterns
        expect(leaks.length).toBeGreaterThan(0);

        // Check for global cache issue
        const cacheIssue = leaks.find(issue =>
            issue.description.toLowerCase().includes('cache') ||
            issue.description.toLowerCase().includes('global'));
        expect(cacheIssue).toBeDefined();

        // Check for event listener issue
        const eventListenerIssue = leaks.find(issue =>
            issue.description.toLowerCase().includes('event') ||
            issue.description.toLowerCase().includes('listener'));
        expect(eventListenerIssue).toBeDefined();
    });

    test('analyzeLoops detects inefficient loop patterns', () => {
        const codeWithLoopIssues = `
            function processArray(array) {
                // Nested loops - O(n²)
                for (let i = 0; i < array.length; i++) {
                    for (let j = 0; j < array.length; j++) {
                        console.log(array[i], array[j]);
                    }
                }

                // Inefficient array access in loop
                for (let i = 0; i < array.length; i++) {
                    const len = array.length; // Should be cached outside loop
                    console.log(array[i], len);
                }

                // Could use forEach or map
                let results = [];
                for (let i = 0; i < array.length; i++) {
                    results.push(array[i] * 2);
                }
            }
        `;

        const loopIssues = analyzer.analyzeLoops(codeWithLoopIssues);

        // Should detect various loop inefficiencies
        expect(loopIssues.length).toBeGreaterThan(0);

        // Check for nested loop detection
        const nestedLoopIssue = loopIssues.find(issue =>
            issue.description.toLowerCase().includes('nested') ||
            issue.description.toLowerCase().includes('o(n²)'));
        expect(nestedLoopIssue).toBeDefined();

        // Check for inefficient array access
        const arrayAccessIssue = loopIssues.find(issue =>
            issue.description.toLowerCase().includes('length') ||
            issue.description.toLowerCase().includes('cach'));
        expect(arrayAccessIssue).toBeDefined();
    });
});
