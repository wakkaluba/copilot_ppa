import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ComplexityAnalyzer } from '../../src/codeTools/complexityAnalyzer';

jest.mock('child_process', () => ({
    execSync: jest.fn((command: string) => {
        if (command.includes('radon cc')) {
            return JSON.stringify({
                'test.py': [
                    {
                        name: 'complex_function',
                        lineno: 2,
                        endline: 15,
                        complexity: 12
                    },
                    {
                        name: 'simple_function',
                        lineno: 17,
                        endline: 18,
                        complexity: 1
                    }
                ]
            });
        } else if (command.includes('radon mi')) {
            return JSON.stringify({
                'test.py': 65.4
            });
        } else if (command.includes('radon hal')) {
            return JSON.stringify({
                'test.py': {
                    h1: 10,
                    h2: 15,
                    N1: 50,
                    N2: 75,
                    vocabulary: 25,
                    length: 125,
                    volume: 200,
                    difficulty: 8,
                    effort: 1600,
                    time: 80,
                    bugs: 0.5
                }
            });
        } else if (command.includes('escomplex')) {
            return JSON.stringify({
                complexity: 10
            });
        }
        return '';
    })
}));

jest.mock('vscode', () => ({
    window: {
        createOutputChannel: jest.fn(() => ({
            appendLine: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            dispose: jest.fn()
        })),
        showErrorMessage: jest.fn(),
        showWarningMessage: jest.fn()
    },
    workspace: {
        getWorkspaceFolder: jest.fn(() => ({ uri: { fsPath: '/test-workspace' } }))
    },
    Uri: {
        file: jest.fn(path => ({ fsPath: path }))
    }
}));

describe('Code Analysis Integration', () => {
    let complexityAnalyzer: ComplexityAnalyzer;
    let testWorkspacePath: string;
    let pythonTestFile: string;
    let typescriptTestFile: string;

    beforeAll(async () => {
        // Create test workspace
        testWorkspacePath = path.join(__dirname, 'test-workspace');
        if (!fs.existsSync(testWorkspacePath)) {
            fs.mkdirSync(testWorkspacePath, { recursive: true });
        }

        // Create test files
        pythonTestFile = path.join(testWorkspacePath, 'test.py');
        fs.writeFileSync(pythonTestFile, `
def complex_function(x):
    result = 0
    for i in range(x):
        if i % 2 == 0:
            if i % 3 == 0:
                result += i
            else:
                result -= i
        elif i % 3 == 0:
            while result > 0:
                result -= 1
        else:
            result += i
    return result

def simple_function(x):
    return x + 1
`);

        typescriptTestFile = path.join(testWorkspacePath, 'test.ts');
        fs.writeFileSync(typescriptTestFile, `
function complexFunction(input: number): number {
    let result = 0;
    for (let i = 0; i < input; i++) {
        if (i % 2 === 0) {
            if (i % 3 === 0) {
                result += i;
            } else {
                result -= i;
            }
        } else if (i % 3 === 0) {
            while (result > 0) {
                result--;
            }
        } else {
            result += i;
        }
    }
    return result;
}

function simpleFunction(x: number): number {
    return x + 1;
}
`);

        // Initialize analyzer
        complexityAnalyzer = new ComplexityAnalyzer();
    });

    afterAll(() => {
        // Clean up test files
        fs.rmSync(testWorkspacePath, { recursive: true, force: true });
        complexityAnalyzer.dispose();
    });

    describe('Python Code Analysis', () => {
        test('analyzes Python file complexity correctly', async () => {
            // Mock the active editor
            (vscode.window as any).activeTextEditor = {
                document: {
                    uri: { fsPath: pythonTestFile },
                    save: jest.fn().mockResolvedValue(true)
                }
            };

            await complexityAnalyzer.analyzeFile();

            // Verify output channel calls
            const outputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;
            
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('complex_function'));
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('simple_function'));
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Cyclomatic Complexity'));
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Maintainability Index'));
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Halstead Metrics'));

            // Verify complexity values
            const complexFuncCall = outputChannel.appendLine.mock.calls.find(
                call => call[0].includes('complex_function')
            );
            const simpleFuncCall = outputChannel.appendLine.mock.calls.find(
                call => call[0].includes('simple_function')
            );

            expect(complexFuncCall[0]).toMatch(/Complexity: 12/);
            expect(simpleFuncCall[0]).toMatch(/Complexity: 1/);
        });

        test('generates maintainability metrics', async () => {
            // Mock the active editor
            (vscode.window as any).activeTextEditor = {
                document: {
                    uri: { fsPath: pythonTestFile },
                    save: jest.fn().mockResolvedValue(true)
                }
            };

            await complexityAnalyzer.analyzeFile();

            // Verify output channel calls
            const outputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;

            // Verify maintainability index
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('65.4'));
            const ratingCall = outputChannel.appendLine.mock.calls.find(
                call => call[0].includes('Rating:')
            );
            expect(ratingCall[0]).toMatch(/Rating: [ABC]/);
        });

        test('generates Halstead metrics', async () => {
            // Mock the active editor
            (vscode.window as any).activeTextEditor = {
                document: {
                    uri: { fsPath: pythonTestFile },
                    save: jest.fn().mockResolvedValue(true)
                }
            };

            await complexityAnalyzer.analyzeFile();

            // Verify output channel calls
            const outputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;

            // Verify Halstead metrics
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Vocabulary: 25'));
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Volume: 200'));
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Difficulty: 8'));
        });
    });

    describe('TypeScript Code Analysis', () => {
        test('analyzes TypeScript file complexity correctly', async () => {
            // Mock the active editor
            (vscode.window as any).activeTextEditor = {
                document: {
                    uri: { fsPath: typescriptTestFile },
                    save: jest.fn().mockResolvedValue(true)
                }
            };

            await complexityAnalyzer.analyzeFile();

            // Verify output channel calls
            const outputChannel = (vscode.window.createOutputChannel as jest.Mock).mock.results[0].value;

            // Basic TypeScript analysis should be logged
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Analyzing complexity'));
            expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('test.ts'));

            // Should attempt to use escomplex or plato
            const cp = require('child_process');
            expect(cp.execSync).toHaveBeenCalledWith(expect.stringMatching(/(plato|escomplex|complexity-report)/));
        });
    });
});
