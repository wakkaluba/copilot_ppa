import * as vscode from 'vscode';
import { SecuritySeverity } from '../../../../src/security/types';
import { CodeQualityService } from '../../../../src/services/codeQuality/CodeQualityService';

describe('CodeQualityService', () => {
    let service: CodeQualityService;
    let mockContext: vscode.ExtensionContext;
    let mockDiagnosticCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        mockDiagnosticCollection = {
            name: 'code-quality',
            set: jest.fn(),
            clear: jest.fn(),
            dispose: jest.fn(),
        } as unknown as vscode.DiagnosticCollection;

        (vscode.languages as any).createDiagnosticCollection = jest.fn().mockReturnValue(mockDiagnosticCollection);

        mockContext = {
            subscriptions: [],
            extensionPath: '',
            globalStoragePath: '',
            logPath: '',
            extensionUri: {} as vscode.Uri,
            environmentVariableCollection: {} as vscode.EnvironmentVariableCollection,
            extensionMode: vscode.ExtensionMode.Test,
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn()
            } as unknown as vscode.Memento,
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn()
            } as unknown as vscode.Memento,
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn()
            } as unknown as vscode.SecretStorage,
            storageUri: null,
            globalStorageUri: {} as vscode.Uri,
            logUri: {} as vscode.Uri,
            asAbsolutePath: jest.fn(),
            storagePath: null
        } as vscode.ExtensionContext;

        service = new CodeQualityService(mockContext);
    });

    describe('analyzeDocument', () => {
        it('should detect code quality issues', async () => {
            const document = createMockDocument(`
                function test() {
                    var x = 1; // Using var instead of let/const
                    console.log(x); // Using console.log in production
                }
            `);

            const results = await service.analyzeDocument(document);

            expect(results.length).toBeGreaterThan(0);
            expect(results[0].issues.some(issue =>
                issue.description.toLowerCase().includes('var'))).toBe(true);
            expect(results[0].issues.some(issue =>
                issue.description.toLowerCase().includes('console.log'))).toBe(true);
            expect(mockDiagnosticCollection.set).toHaveBeenCalled();
        });

        it('should detect best practices violations', async () => {
            const document = createMockDocument(`
                function longFunction() {
                    let a = 1;
                    let b = 2;
                    let c = 3;
                    // ... 30+ more lines
                }
            `);

            const results = await service.analyzeDocument(document);

            expect(results.length).toBeGreaterThan(0);
            expect(results[0].issues.some(issue =>
                issue.id === 'BP001')).toBe(true);
        });

        it('should detect security issues', async () => {
            const document = createMockDocument(`
                function handleUserInput() {
                    eval(userInput);
                }
            `);

            const results = await service.analyzeDocument(document);

            expect(results.length).toBeGreaterThan(0);
            expect(results[0].issues.some(issue =>
                issue.severity === SecuritySeverity.High)).toBe(true);
        });

        it('should detect design pattern improvements', async () => {
            const document = createMockDocument(`
                class UserService {
                    constructor() {
                        this.users = [];
                    }

                    addUser(user) {
                        this.users.push(user);
                    }

                    getUser(id) {
                        return this.users.find(u => u.id === id);
                    }
                }
            `);

            const results = await service.analyzeDocument(document);

            expect(results.length).toBeGreaterThan(0);
            expect(results[0].issues.some(issue =>
                issue.description.toLowerCase().includes('interface'))).toBe(true);
        });
    });

    describe('analyzeWorkspace', () => {
        it('should analyze multiple files', async () => {
            const mockFiles = [
                { fsPath: 'test1.ts' },
                { fsPath: 'test2.ts' }
            ] as vscode.Uri[];

            (vscode.workspace.findFiles as jest.Mock) = jest.fn().mockResolvedValue(mockFiles);
            (vscode.workspace.openTextDocument as jest.Mock) = jest.fn().mockImplementation((uri) =>
                Promise.resolve(createMockDocument('// Some code'))
            );

            const progressCallback = jest.fn();
            const results = await service.analyzeWorkspace(progressCallback);

            expect(results.length).toBeGreaterThan(0);
            expect(progressCallback).toHaveBeenCalled();
            expect(vscode.workspace.findFiles).toHaveBeenCalledWith(
                '**/*.{ts,js,py,java}',
                '**/node_modules/**'
            );
        });
    });

    describe('metrics', () => {
        it('should track quality metrics over time', async () => {
            const document = createMockDocument(`
                function complexFunction() {
                    if (x > 0) {
                        if (y < 10) {
                            while (true) {
                                if (z === 5) break;
                            }
                        }
                    }
                    return x > 0 ? true : false;
                }
            `);

            await service.analyzeDocument(document);
            const history = service.getQualityHistory();

            expect(history.metrics.length).toBeGreaterThan(0);
            const latestMetrics = history.metrics[history.metrics.length - 1];
            expect(latestMetrics.complexity).toBeLessThan(100);
            expect(latestMetrics.maintainability).toBeDefined();
            expect(latestMetrics.security).toBeDefined();
        });
    });

    it('should properly dispose resources', () => {
        service.dispose();

        expect(mockDiagnosticCollection.clear).toHaveBeenCalled();
        expect(mockDiagnosticCollection.dispose).toHaveBeenCalled();
    });
});

function createMockDocument(content: string): vscode.TextDocument {
    return {
        getText: () => content,
        uri: { fsPath: 'test.ts' } as vscode.Uri,
        languageId: 'typescript',
        positionAt: (offset: number) => new vscode.Position(0, offset),
        lineAt: (line: number) => ({ text: content.split('\n')[line] } as vscode.TextLine),
    } as vscode.TextDocument;
}
