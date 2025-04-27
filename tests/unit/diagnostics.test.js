"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var diagnosticsManager_1 = require("../../src/diagnostics/diagnosticsManager");
describe('Diagnostics Manager', function () {
    var diagnosticsManager;
    var mockDiagnosticCollection;
    var mockContext;
    beforeEach(function () {
        // Create mock diagnostic collection
        mockDiagnosticCollection = {
            name: 'test-diagnostics',
            set: jest.fn(),
            delete: jest.fn(),
            clear: jest.fn(),
            dispose: jest.fn(),
            forEach: jest.fn(),
            get: jest.fn(),
            has: jest.fn()
        };
        // Mock createDiagnosticCollection
        vscode.languages.createDiagnosticCollection.mockReturnValue(mockDiagnosticCollection);
        // Create mock context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test',
            extensionUri: vscode.Uri.file('/test'),
            storageUri: vscode.Uri.file('/test/storage'),
            globalStorageUri: vscode.Uri.file('/test/global'),
            logUri: vscode.Uri.file('/test/log'),
            extensionMode: vscode.ExtensionMode.Development,
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn()
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn()
            },
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn()
            },
            asAbsolutePath: jest.fn(function (path) { return "/test/".concat(path); }),
            environmentVariableCollection: {
                persistent: true,
                replace: jest.fn(),
                append: jest.fn(),
                prepend: jest.fn(),
                get: jest.fn(),
                forEach: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn()
            }
        };
        diagnosticsManager = new diagnosticsManager_1.DiagnosticsManager(mockContext);
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe('Initialization', function () {
        test('creates diagnostic collection on init', function () {
            expect(vscode.languages.createDiagnosticCollection).toHaveBeenCalledWith('copilot-ppa');
        });
        test('adds diagnostic collection to subscriptions', function () {
            expect(mockContext.subscriptions).toContain(mockDiagnosticCollection);
        });
    });
    describe('Diagnostic Reporting', function () {
        test('reports file diagnostics', function () {
            var uri = vscode.Uri.file('/test/file.ts');
            var diagnostic = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), 'Test diagnostic', vscode.DiagnosticSeverity.Error);
            diagnosticsManager.reportDiagnostic(uri, [diagnostic]);
            expect(mockDiagnosticCollection.set).toHaveBeenCalledWith(uri, [diagnostic]);
        });
        test('clears diagnostics for file', function () {
            var uri = vscode.Uri.file('/test/file.ts');
            diagnosticsManager.clearDiagnostics(uri);
            expect(mockDiagnosticCollection.delete).toHaveBeenCalledWith(uri);
        });
        test('clears all diagnostics', function () {
            diagnosticsManager.clearAllDiagnostics();
            expect(mockDiagnosticCollection.clear).toHaveBeenCalled();
        });
    });
    describe('Diagnostic Updates', function () {
        test('updates existing diagnostics', function () {
            var uri = vscode.Uri.file('/test/file.ts');
            var diagnostic1 = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), 'First diagnostic', vscode.DiagnosticSeverity.Error);
            var diagnostic2 = new vscode.Diagnostic(new vscode.Range(1, 0, 1, 1), 'Second diagnostic', vscode.DiagnosticSeverity.Warning);
            diagnosticsManager.reportDiagnostic(uri, [diagnostic1]);
            diagnosticsManager.reportDiagnostic(uri, [diagnostic2]);
            expect(mockDiagnosticCollection.set).toHaveBeenLastCalledWith(uri, [diagnostic2]);
        });
        test('handles empty diagnostic arrays', function () {
            var uri = vscode.Uri.file('/test/file.ts');
            diagnosticsManager.reportDiagnostic(uri, []);
            expect(mockDiagnosticCollection.delete).toHaveBeenCalledWith(uri);
        });
    });
    describe('Error Handling', function () {
        test('handles invalid diagnostic ranges', function () {
            var uri = vscode.Uri.file('/test/file.ts');
            var invalidDiagnostic = new vscode.Diagnostic(new vscode.Range(-1, 0, 0, 1), // Invalid range
            'Invalid diagnostic', vscode.DiagnosticSeverity.Error);
            expect(function () {
                diagnosticsManager.reportDiagnostic(uri, [invalidDiagnostic]);
            }).not.toThrow();
        });
        test('handles invalid URIs gracefully', function () {
            var invalidUri = vscode.Uri.parse('invalid://test');
            var diagnostic = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), 'Test diagnostic', vscode.DiagnosticSeverity.Error);
            expect(function () {
                diagnosticsManager.reportDiagnostic(invalidUri, [diagnostic]);
            }).not.toThrow();
        });
    });
    describe('Diagnostic Collection Management', function () {
        test('handles dispose correctly', function () {
            diagnosticsManager.dispose();
            expect(mockDiagnosticCollection.dispose).toHaveBeenCalled();
        });
        test('prevents operations after dispose', function () {
            diagnosticsManager.dispose();
            var uri = vscode.Uri.file('/test/file.ts');
            var diagnostic = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), 'Test diagnostic', vscode.DiagnosticSeverity.Error);
            diagnosticsManager.reportDiagnostic(uri, [diagnostic]);
            expect(mockDiagnosticCollection.set).not.toHaveBeenCalled();
        });
    });
});
