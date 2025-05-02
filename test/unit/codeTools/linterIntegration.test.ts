import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { LinterIntegration } from '../../../src/codeTools/linterIntegration';

describe('LinterIntegration - TypeScript', () => {
  let linterIntegration: LinterIntegration;
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;
  let mockWorkspace: any;
  let mockDiagnosticCollection: any;
  let mockExecutor: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code context
    mockContext = {
      subscriptions: [],
      extensionPath: '/path/to/extension',
      extensionUri: vscode.Uri.file('/path/to/extension'),
      globalStorageUri: vscode.Uri.file('/path/to/globalStorage'),
      logUri: vscode.Uri.file('/path/to/logs'),
      storageUri: vscode.Uri.file('/path/to/storage'),
      extensionMode: vscode.ExtensionMode.Development,
      globalState: {
        get: sandbox.stub(),
        update: sandbox.stub().resolves(true),
        setKeysForSync: sandbox.stub()
      } as any,
      workspaceState: {
        get: sandbox.stub(),
        update: sandbox.stub().resolves(true),
        setKeysForSync: sandbox.stub()
      } as any,
      secrets: {
        get: sandbox.stub().resolves(''),
        store: sandbox.stub().resolves(),
        delete: sandbox.stub().resolves()
      } as any,
      environmentVariableCollection: {} as any,
      asAbsolutePath: (path: string) => `/path/to/extension/${path}`
    };

    // Mock VS Code workspace
    mockWorkspace = {
      workspaceFolders: [{ uri: { fsPath: '/path/to/workspace' } }],
      getConfiguration: sandbox.stub().returns({
        get: sandbox.stub(),
        update: sandbox.stub(),
        has: sandbox.stub()
      }),
      openTextDocument: sandbox.stub().resolves({
        getText: sandbox.stub().returns('// Test code'),
        fileName: '/path/to/file.ts',
        languageId: 'typescript'
      }),
      findFiles: sandbox.stub().resolves([
        vscode.Uri.file('/path/to/file1.ts'),
        vscode.Uri.file('/path/to/file2.ts')
      ])
    };
    sandbox.stub(vscode, 'workspace').value(mockWorkspace);

    // Mock diagnostic collection
    mockDiagnosticCollection = {
      set: sandbox.stub(),
      clear: sandbox.stub(),
      delete: sandbox.stub(),
      dispose: sandbox.stub()
    };
    sandbox.stub(vscode.languages, 'createDiagnosticCollection').returns(mockDiagnosticCollection);

    // Mock command executor
    mockExecutor = {
      executeCommand: sandbox.stub().resolves()
    };
    sandbox.stub(vscode.commands, 'executeCommand').callsFake(mockExecutor.executeCommand);

    // Create LinterIntegration instance
    linterIntegration = new LinterIntegration(mockContext);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialize', () => {
    it('should initialize linter integration with supported languages', async () => {
      // Stub the registerCommands method to verify it's called
      const registerCommandsStub = sandbox.stub(linterIntegration as any, 'registerCommands');

      await linterIntegration.initialize();

      expect(registerCommandsStub.calledOnce).to.be.true;
      expect(vscode.languages.createDiagnosticCollection.calledWith('copilot-linter')).to.be.true;
      expect(mockContext.subscriptions.length).to.be.greaterThan(0);
    });

    it('should handle errors during initialization', async () => {
      // Force an error during initialization
      sandbox.stub(vscode.languages, 'createDiagnosticCollection').throws(new Error('Initialization error'));

      // Spy on console.error or a logger method if there's one
      const errorSpy = sandbox.spy(console, 'error');

      await linterIntegration.initialize();

      expect(errorSpy.calledWith(sinon.match(/Failed to initialize LinterIntegration/))).to.be.true;
    });
  });

  describe('registerCommands', () => {
    it('should register lint commands with VS Code', () => {
      // Create stub for vscode.commands.registerCommand
      const registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({
        dispose: sandbox.stub()
      } as any);

      // Call the private method using any type assertion
      (linterIntegration as any).registerCommands();

      // Verify commands were registered
      expect(registerCommandStub.called).to.be.true;
      expect(mockContext.subscriptions.length).to.be.greaterThan(0);
    });
  });

  describe('lintFile', () => {
    it('should lint a file and return diagnostics for TypeScript', async () => {
      const filePath = '/path/to/file.ts';

      // Mock ESLint execution result for TypeScript
      const mockEslintResult = [
        {
          filePath,
          messages: [
            {
              ruleId: 'no-unused-vars',
              severity: 2,
              message: 'Variable is defined but never used',
              line: 1,
              column: 10
            }
          ],
          errorCount: 1,
          warningCount: 0
        }
      ];

      // Stub the ESLint execution
      sandbox.stub(linterIntegration as any, 'executeEslint').resolves(mockEslintResult);

      const diagnostics = await linterIntegration.lintFile(filePath);

      expect(diagnostics).to.be.an('array').with.lengthOf(1);
      expect(diagnostics[0].message).to.include('Variable is defined but never used');
      expect(diagnostics[0].severity).to.equal(vscode.DiagnosticSeverity.Error);
      expect(mockDiagnosticCollection.set.calledOnce).to.be.true;
    });

    it('should lint a file and return diagnostics for JavaScript', async () => {
      const filePath = '/path/to/file.js';

      // Mock document with JavaScript content
      mockWorkspace.openTextDocument.resolves({
        getText: sandbox.stub().returns('// JS Test code'),
        fileName: filePath,
        languageId: 'javascript'
      });

      // Mock ESLint execution result for JavaScript
      const mockEslintResult = [
        {
          filePath,
          messages: [
            {
              ruleId: 'semi',
              severity: 1,
              message: 'Missing semicolon',
              line: 2,
              column: 15
            }
          ],
          errorCount: 0,
          warningCount: 1
        }
      ];

      // Stub the ESLint execution
      sandbox.stub(linterIntegration as any, 'executeEslint').resolves(mockEslintResult);

      const diagnostics = await linterIntegration.lintFile(filePath);

      expect(diagnostics).to.be.an('array').with.lengthOf(1);
      expect(diagnostics[0].message).to.include('Missing semicolon');
      expect(diagnostics[0].severity).to.equal(vscode.DiagnosticSeverity.Warning);
      expect(mockDiagnosticCollection.set.calledOnce).to.be.true;
    });

    it('should handle errors when linting a file', async () => {
      const filePath = '/path/to/file.ts';

      // Stub the ESLint execution to throw an error
      sandbox.stub(linterIntegration as any, 'executeEslint').rejects(new Error('ESLint error'));

      const errorSpy = sandbox.spy(console, 'error');

      const diagnostics = await linterIntegration.lintFile(filePath);

      expect(diagnostics).to.be.an('array').that.is.empty;
      expect(errorSpy.calledWith(sinon.match(/Error linting file/))).to.be.true;
    });

    it('should handle unsupported file types gracefully', async () => {
      const filePath = '/path/to/file.css';

      // Mock document with unsupported language
      mockWorkspace.openTextDocument.resolves({
        getText: sandbox.stub().returns('/* CSS Test code */'),
        fileName: filePath,
        languageId: 'css'
      });

      const diagnostics = await linterIntegration.lintFile(filePath);

      expect(diagnostics).to.be.an('array').that.is.empty;
      expect(mockDiagnosticCollection.set.calledWith(vscode.Uri.file(filePath), [])).to.be.true;
    });
  });

  describe('lintWorkspace', () => {
    it('should lint all supported files in the workspace', async () => {
      // Mock finding files in workspace
      mockWorkspace.findFiles.resolves([
        vscode.Uri.file('/path/to/file1.ts'),
        vscode.Uri.file('/path/to/file2.js'),
        vscode.Uri.file('/path/to/file3.html') // Unsupported
      ]);

      // Stub the lintFile method
      const lintFileStub = sandbox.stub(linterIntegration, 'lintFile');
      lintFileStub.withArgs('/path/to/file1.ts').resolves([{ message: 'TS error' } as any]);
      lintFileStub.withArgs('/path/to/file2.js').resolves([{ message: 'JS warning' } as any]);

      const diagnosticsMap = await linterIntegration.lintWorkspace();

      expect(lintFileStub.callCount).to.equal(2); // Only calls for supported files
      expect(diagnosticsMap).to.be.an('object');
      expect(diagnosticsMap['/path/to/file1.ts']).to.be.an('array').with.lengthOf(1);
      expect(diagnosticsMap['/path/to/file2.js']).to.be.an('array').with.lengthOf(1);
      expect(Object.keys(diagnosticsMap).length).to.equal(2);
    });

    it('should handle errors when linting the workspace', async () => {
      // Force an error during workspace file search
      mockWorkspace.findFiles.rejects(new Error('Workspace error'));

      const errorSpy = sandbox.spy(console, 'error');

      const diagnosticsMap = await linterIntegration.lintWorkspace();

      expect(diagnosticsMap).to.be.an('object').that.is.empty;
      expect(errorSpy.calledWith(sinon.match(/Error linting workspace/))).to.be.true;
    });
  });

  describe('fixLintIssue', () => {
    it('should fix a lint issue using ESLint auto-fix', async () => {
      const filePath = '/path/to/file.ts';
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 10),
        'Variable is defined but never used',
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = 'no-unused-vars';

      // Stub the executeEslintFix method
      const fixStub = sandbox.stub(linterIntegration as any, 'executeEslintFix').resolves(true);

      const success = await linterIntegration.fixLintIssue(filePath, diagnostic);

      expect(success).to.be.true;
      expect(fixStub.calledWith(filePath, 'no-unused-vars')).to.be.true;
    });

    it('should handle errors when fixing a lint issue', async () => {
      const filePath = '/path/to/file.ts';
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 10),
        'Variable is defined but never used',
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.code = 'no-unused-vars';

      // Stub the executeEslintFix method to throw an error
      sandbox.stub(linterIntegration as any, 'executeEslintFix').rejects(new Error('Fix error'));

      const errorSpy = sandbox.spy(console, 'error');

      const success = await linterIntegration.fixLintIssue(filePath, diagnostic);

      expect(success).to.be.false;
      expect(errorSpy.calledWith(sinon.match(/Error fixing lint issue/))).to.be.true;
    });

    it('should handle diagnostics without a rule ID', async () => {
      const filePath = '/path/to/file.ts';
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 10),
        'Some error message',
        vscode.DiagnosticSeverity.Error
      );
      // No code/ruleId set

      const success = await linterIntegration.fixLintIssue(filePath, diagnostic);

      expect(success).to.be.false;
    });
  });

  describe('clearDiagnostics', () => {
    it('should clear diagnostics for a specific file', () => {
      const filePath = '/path/to/file.ts';

      linterIntegration.clearDiagnostics(filePath);

      expect(mockDiagnosticCollection.delete.calledWith(vscode.Uri.file(filePath))).to.be.true;
    });

    it('should clear all diagnostics when no file is specified', () => {
      linterIntegration.clearDiagnostics();

      expect(mockDiagnosticCollection.clear.calledOnce).to.be.true;
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return the list of supported languages', () => {
      const languages = (linterIntegration as any).getSupportedLanguages();

      expect(languages).to.be.an('array');
      expect(languages).to.include('javascript');
      expect(languages).to.include('typescript');
    });
  });

  describe('executeEslint', () => {
    it('should execute ESLint CLI via command on a file', async () => {
      const filePath = '/path/to/file.ts';

      // Create mock ESLint output
      const mockLintResult = JSON.stringify([
        {
          filePath,
          messages: [{ ruleId: 'test-rule', severity: 2, message: 'Test message', line: 1, column: 1 }],
          errorCount: 1,
          warningCount: 0
        }
      ]);

      // Mock external command execution
      mockExecutor.executeCommand.resolves(mockLintResult);

      const result = await (linterIntegration as any).executeEslint(filePath);

      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0].filePath).to.equal(filePath);
      expect(result[0].messages).to.be.an('array').with.lengthOf(1);
      expect(result[0].messages[0].ruleId).to.equal('test-rule');
      expect(mockExecutor.executeCommand.calledWith('eslint', [
        '--format', 'json', '--no-color', filePath
      ])).to.be.true;
    });

    it('should handle invalid ESLint output', async () => {
      const filePath = '/path/to/file.ts';

      // Mock invalid JSON output
      mockExecutor.executeCommand.resolves('Invalid JSON output');

      await expect((linterIntegration as any).executeEslint(filePath))
        .to.eventually.be.rejectedWith(/Failed to parse ESLint output/);
    });
  });

  describe('executeEslintFix', () => {
    it('should execute ESLint with fix option for specific rule', async () => {
      const filePath = '/path/to/file.ts';
      const ruleId = 'no-unused-vars';

      // Mock successful fix
      mockExecutor.executeCommand.resolves('');

      const result = await (linterIntegration as any).executeEslintFix(filePath, ruleId);

      expect(result).to.be.true;
      expect(mockExecutor.executeCommand.calledWith('eslint', [
        '--fix', '--rule', `${ruleId}: error`, filePath
      ])).to.be.true;
    });

    it('should handle errors during ESLint fix', async () => {
      const filePath = '/path/to/file.ts';
      const ruleId = 'no-unused-vars';

      // Mock command error
      mockExecutor.executeCommand.rejects(new Error('Command failed'));

      const result = await (linterIntegration as any).executeEslintFix(filePath, ruleId);

      expect(result).to.be.false;
    });
  });

  describe('getEslintRules', () => {
    it('should retrieve ESLint rules configuration', async () => {
      // Mock ESLint rules output
      const mockRulesOutput = JSON.stringify({
        rules: {
          'no-unused-vars': ['error'],
          'semi': ['warn']
        }
      });

      mockExecutor.executeCommand.resolves(mockRulesOutput);

      const rules = await (linterIntegration as any).getEslintRules();

      expect(rules).to.be.an('object');
      expect(rules).to.have.property('no-unused-vars');
      expect(rules).to.have.property('semi');
      expect(mockExecutor.executeCommand.calledWith('eslint', ['--print-config', sinon.match.any])).to.be.true;
    });

    it('should handle errors when retrieving ESLint rules', async () => {
      // Mock command error
      mockExecutor.executeCommand.rejects(new Error('Command failed'));

      const rules = await (linterIntegration as any).getEslintRules();

      expect(rules).to.be.an('object').that.is.empty;
    });
  });

  describe('isEslintInstalled', () => {
    it('should detect if ESLint is installed', async () => {
      // Mock successful ESLint version command
      mockExecutor.executeCommand.resolves('v8.0.0');

      const isInstalled = await (linterIntegration as any).isEslintInstalled();

      expect(isInstalled).to.be.true;
      expect(mockExecutor.executeCommand.calledWith('eslint', ['--version'])).to.be.true;
    });

    it('should detect if ESLint is not installed', async () => {
      // Mock command not found error
      mockExecutor.executeCommand.rejects(new Error('Command not found'));

      const isInstalled = await (linterIntegration as any).isEslintInstalled();

      expect(isInstalled).to.be.false;
    });
  });

  describe('dispose', () => {
    it('should dispose all disposable resources', () => {
      // Set up mock disposables
      const mockDisposable1 = { dispose: sandbox.stub() };
      const mockDisposable2 = { dispose: sandbox.stub() };

      (linterIntegration as any).disposables = [mockDisposable1, mockDisposable2];

      linterIntegration.dispose();

      expect(mockDisposable1.dispose.calledOnce).to.be.true;
      expect(mockDisposable2.dispose.calledOnce).to.be.true;
      expect(mockDiagnosticCollection.dispose.calledOnce).to.be.true;
      expect((linterIntegration as any).disposables.length).to.equal(0);
    });
  });
});
