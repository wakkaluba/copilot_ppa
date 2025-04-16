import * as vscode from 'vscode';
import { DiagnosticsManager } from '../../src/diagnostics/diagnosticsManager';

describe('Diagnostics Manager', () => {
  let diagnosticsManager: DiagnosticsManager;
  let mockDiagnosticCollection: vscode.DiagnosticCollection;
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
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
    (vscode.languages.createDiagnosticCollection as jest.Mock).mockReturnValue(
      mockDiagnosticCollection
    );

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
      asAbsolutePath: jest.fn(path => `/test/${path}`),
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

    diagnosticsManager = new DiagnosticsManager(mockContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('creates diagnostic collection on init', () => {
      expect(vscode.languages.createDiagnosticCollection).toHaveBeenCalledWith(
        'copilot-ppa'
      );
    });

    test('adds diagnostic collection to subscriptions', () => {
      expect(mockContext.subscriptions).toContain(mockDiagnosticCollection);
    });
  });

  describe('Diagnostic Reporting', () => {
    test('reports file diagnostics', () => {
      const uri = vscode.Uri.file('/test/file.ts');
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        'Test diagnostic',
        vscode.DiagnosticSeverity.Error
      );

      diagnosticsManager.reportDiagnostic(uri, [diagnostic]);

      expect(mockDiagnosticCollection.set).toHaveBeenCalledWith(uri, [diagnostic]);
    });

    test('clears diagnostics for file', () => {
      const uri = vscode.Uri.file('/test/file.ts');
      
      diagnosticsManager.clearDiagnostics(uri);

      expect(mockDiagnosticCollection.delete).toHaveBeenCalledWith(uri);
    });

    test('clears all diagnostics', () => {
      diagnosticsManager.clearAllDiagnostics();

      expect(mockDiagnosticCollection.clear).toHaveBeenCalled();
    });
  });

  describe('Diagnostic Updates', () => {
    test('updates existing diagnostics', () => {
      const uri = vscode.Uri.file('/test/file.ts');
      const diagnostic1 = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        'First diagnostic',
        vscode.DiagnosticSeverity.Error
      );
      const diagnostic2 = new vscode.Diagnostic(
        new vscode.Range(1, 0, 1, 1),
        'Second diagnostic',
        vscode.DiagnosticSeverity.Warning
      );

      diagnosticsManager.reportDiagnostic(uri, [diagnostic1]);
      diagnosticsManager.reportDiagnostic(uri, [diagnostic2]);

      expect(mockDiagnosticCollection.set).toHaveBeenLastCalledWith(uri, [diagnostic2]);
    });

    test('handles empty diagnostic arrays', () => {
      const uri = vscode.Uri.file('/test/file.ts');
      
      diagnosticsManager.reportDiagnostic(uri, []);

      expect(mockDiagnosticCollection.delete).toHaveBeenCalledWith(uri);
    });
  });

  describe('Error Handling', () => {
    test('handles invalid diagnostic ranges', () => {
      const uri = vscode.Uri.file('/test/file.ts');
      const invalidDiagnostic = new vscode.Diagnostic(
        new vscode.Range(-1, 0, 0, 1), // Invalid range
        'Invalid diagnostic',
        vscode.DiagnosticSeverity.Error
      );

      expect(() => {
        diagnosticsManager.reportDiagnostic(uri, [invalidDiagnostic]);
      }).not.toThrow();
    });

    test('handles invalid URIs gracefully', () => {
      const invalidUri = vscode.Uri.parse('invalid://test');
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        'Test diagnostic',
        vscode.DiagnosticSeverity.Error
      );

      expect(() => {
        diagnosticsManager.reportDiagnostic(invalidUri, [diagnostic]);
      }).not.toThrow();
    });
  });

  describe('Diagnostic Collection Management', () => {
    test('handles dispose correctly', () => {
      diagnosticsManager.dispose();

      expect(mockDiagnosticCollection.dispose).toHaveBeenCalled();
    });

    test('prevents operations after dispose', () => {
      diagnosticsManager.dispose();

      const uri = vscode.Uri.file('/test/file.ts');
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        'Test diagnostic',
        vscode.DiagnosticSeverity.Error
      );

      diagnosticsManager.reportDiagnostic(uri, [diagnostic]);

      expect(mockDiagnosticCollection.set).not.toHaveBeenCalled();
    });
  });
});