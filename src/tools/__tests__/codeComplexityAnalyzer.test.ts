import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeComplexityService } from '../../services/codeAnalysis/CodeComplexityService';
import { CodeComplexityAnalyzer } from '../codeComplexityAnalyzer';

describe('CodeComplexityAnalyzer', () => {
    let analyzer: CodeComplexityAnalyzer;
    let serviceStub: sinon.SinonStubbedInstance<CodeComplexityService>;
    let sandbox: sinon.SinonSandbox;
    let mockShowErrorMessage: sinon.SinonStub;
    let mockConsoleError: sinon.SinonStub;

    // Mock data
    const mockFilePath = 'test/file.ts';
    const mockWorkspaceFolder = {
        uri: { fsPath: '/test/workspace' },
        name: 'Test Workspace',
        index: 0
    } as vscode.WorkspaceFolder;

    const mockComplexityResult = {
        filePath: mockFilePath,
        complexity: 10,
        lines: 100,
        functions: [
            { name: 'testFunc', complexity: 5, line: 10 }
        ]
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create stub for CodeComplexityService
        serviceStub = sandbox.createStubInstance(CodeComplexityService);

        // Mock vscode window.showErrorMessage
        mockShowErrorMessage = sandbox.stub(vscode.window, 'showErrorMessage');

        // Mock console.error
        mockConsoleError = sandbox.stub(console, 'error');

        // Create the analyzer with the stubbed service
        analyzer = new CodeComplexityAnalyzer();
        // @ts-ignore - Replace the service with our stub
        analyzer['service'] = serviceStub;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('analyzeFile', () => {
        it('should analyze file and return complexity results', async () => {
            // Setup
            serviceStub.analyzeFile.resolves(mockComplexityResult);

            // Execute
            const result = await analyzer.analyzeFile(mockFilePath);

            // Verify
            expect(serviceStub.analyzeFile.calledOnce).toBe(true);
            expect(serviceStub.analyzeFile.calledWith(mockFilePath)).toBe(true);
            expect(result).toEqual(mockComplexityResult);
        });

        it('should handle errors during file analysis', async () => {
            // Setup
            const testError = new Error('Test error');
            serviceStub.analyzeFile.rejects(testError);

            // Execute
            const result = await analyzer.analyzeFile(mockFilePath);

            // Verify
            expect(serviceStub.analyzeFile.calledOnce).toBe(true);
            expect(result).toBeNull();
            expect(mockShowErrorMessage.calledOnce).toBe(true);
            expect(mockConsoleError.calledOnce).toBe(true);
        });
    });

    describe('analyzeWorkspace', () => {
        it('should analyze workspace and return complexity results', async () => {
            // Setup
            const mockResults = [mockComplexityResult];
            serviceStub.analyzeWorkspace.resolves(mockResults);

            // Execute
            const results = await analyzer.analyzeWorkspace(mockWorkspaceFolder);

            // Verify
            expect(serviceStub.analyzeWorkspace.calledOnce).toBe(true);
            expect(serviceStub.analyzeWorkspace.calledWith(mockWorkspaceFolder)).toBe(true);
            expect(results).toEqual(mockResults);
        });

        it('should handle errors during workspace analysis', async () => {
            // Setup
            const testError = new Error('Test error');
            serviceStub.analyzeWorkspace.rejects(testError);

            // Execute
            const results = await analyzer.analyzeWorkspace(mockWorkspaceFolder);

            // Verify
            expect(serviceStub.analyzeWorkspace.calledOnce).toBe(true);
            expect(results).toEqual([]);
            expect(mockShowErrorMessage.calledOnce).toBe(true);
            expect(mockConsoleError.calledOnce).toBe(true);
        });
    });

    describe('generateComplexityReport', () => {
        it('should generate a complexity report', () => {
            // Setup
            const mockResults = [mockComplexityResult];
            const mockReport = 'Test complexity report';
            serviceStub.generateComplexityReport.returns(mockReport);

            // Execute
            const report = analyzer.generateComplexityReport(mockResults);

            // Verify
            expect(serviceStub.generateComplexityReport.calledOnce).toBe(true);
            expect(serviceStub.generateComplexityReport.calledWith(mockResults)).toBe(true);
            expect(report).toEqual(mockReport);
        });

        it('should handle errors during report generation', () => {
            // Setup
            const mockResults = [mockComplexityResult];
            const testError = new Error('Test error');
            serviceStub.generateComplexityReport.throws(testError);

            // Execute
            const report = analyzer.generateComplexityReport(mockResults);

            // Verify
            expect(serviceStub.generateComplexityReport.calledOnce).toBe(true);
            expect(report).toEqual('Error generating complexity report');
            expect(mockShowErrorMessage.calledOnce).toBe(true);
            expect(mockConsoleError.calledOnce).toBe(true);
        });
    });

    describe('visualizeComplexity', () => {
        it('should visualize complexity in the editor', () => {
            // Setup
            const mockEditor = {} as vscode.TextEditor;
            const mockVisualizations = [{} as vscode.Disposable, {} as vscode.Disposable];
            serviceStub.visualizeComplexity.returns(mockVisualizations);

            // Execute
            const result = analyzer.visualizeComplexity(mockEditor, mockComplexityResult);

            // Verify
            expect(serviceStub.visualizeComplexity.calledOnce).toBe(true);
            expect(serviceStub.visualizeComplexity.calledWith(mockEditor, mockComplexityResult)).toBe(true);
            expect(result).toEqual(mockVisualizations);
        });

        it('should handle errors during visualization', () => {
            // Setup
            const mockEditor = {} as vscode.TextEditor;
            const testError = new Error('Test error');
            serviceStub.visualizeComplexity.throws(testError);

            // Execute
            const result = analyzer.visualizeComplexity(mockEditor, mockComplexityResult);

            // Verify
            expect(serviceStub.visualizeComplexity.calledOnce).toBe(true);
            expect(result).toEqual([]);
            expect(mockShowErrorMessage.calledOnce).toBe(true);
            expect(mockConsoleError.calledOnce).toBe(true);
        });
    });

    describe('dispose', () => {
        it('should dispose all resources', () => {
            // Setup
            const mockDisposable1 = {
                dispose: sandbox.stub()
            };
            const mockDisposable2 = {
                dispose: sandbox.stub()
            };
            // @ts-ignore - Access private field for testing
            analyzer['disposables'] = [
                mockDisposable1 as unknown as vscode.Disposable,
                mockDisposable2 as unknown as vscode.Disposable
            ];

            // Execute
            analyzer.dispose();

            // Verify
            expect(mockDisposable1.dispose.calledOnce).toBe(true);
            expect(mockDisposable2.dispose.calledOnce).toBe(true);
            expect(serviceStub.dispose.calledOnce).toBe(true);
            // @ts-ignore - Access private field for testing
            expect(analyzer['disposables'].length).toBe(0);
        });
    });
});
