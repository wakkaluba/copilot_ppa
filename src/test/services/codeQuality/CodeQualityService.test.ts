import * as vscode from 'vscode';
import { CodeQualityService } from '../../../services/codeQuality/CodeQualityService';

describe('CodeQualityService', () => {
    let service: CodeQualityService;
    let mockContext: vscode.ExtensionContext;
    let mockDiagnosticCollection: vscode.DiagnosticCollection;
    let mockWorkspace: typeof vscode.workspace;

    beforeEach(() => {
        mockDiagnosticCollection = {
            name: 'code-quality',
            set: jest.fn(),
            clear: jest.fn(),
            dispose: jest.fn(),
        } as unknown as vscode.DiagnosticCollection;

        mockWorkspace = {
            ...vscode.workspace,
            findFiles: jest.fn().mockResolvedValue([
                { fsPath: 'test1.ts' } as vscode.Uri,
                { fsPath: 'test2.ts' } as vscode.Uri
            ]),
            openTextDocument: jest.fn().mockImplementation((uri) =>
                Promise.resolve(createMockDocument('let x = 5;'))
            )
        };

        (vscode.languages as any).createDiagnosticCollection = jest.fn().mockReturnValue(mockDiagnosticCollection);
        (vscode as any).workspace = mockWorkspace;

        mockContext = {
            subscriptions: [],
        } as vscode.ExtensionContext;

        service = new CodeQualityService(mockContext);
    });

    describe('analyzeDocument', () => {
        it('should analyze document and update diagnostics', async () => {
            const document = createMockDocument(`
                function test() {
                    eval("alert('test')");
                    let x = 5;
                }
            `);

            const results = await service.analyzeDocument(document);

            expect(results.length).toBeGreaterThan(0);
            expect(mockDiagnosticCollection.set).toHaveBeenCalled();
        });

        it('should update quality history after analysis', async () => {
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
            expect(latestMetrics.complexity).toBeLessThan(100); // Should be penalized for complexity
        });
    });

    describe('analyzeWorkspace', () => {
        it('should analyze all files in workspace', async () => {
            const progressCallback = jest.fn();

            const results = await service.analyzeWorkspace(progressCallback);

            expect(results.length).toBeGreaterThan(0);
            expect(progressCallback).toHaveBeenCalled();
            expect(mockWorkspace.findFiles).toHaveBeenCalledWith(
                '**/*.{ts,js,py,java}',
                '**/node_modules/**'
            );
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
