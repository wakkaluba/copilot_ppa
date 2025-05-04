import { expect } from 'chai';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { LinterIntegration } from '../../../src/codeTools/linterIntegration';

describe('LinterIntegration - TypeScript', () => {
  let linterIntegration: LinterIntegration;
  let sandbox: sinon.SinonSandbox;
  let mockOutputChannel: any;
  let mockDiagnosticCollection: any;
  let execSyncStub: sinon.SinonStub;
  let fsExistsStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code window and OutputChannel
    mockOutputChannel = {
      appendLine: sandbox.stub(),
      clear: sandbox.stub(),
      show: sandbox.stub(),
      dispose: sandbox.stub()
    };
    sandbox.stub(vscode.window, 'createOutputChannel').returns(mockOutputChannel);

    // Mock VS Code DiagnosticCollection
    mockDiagnosticCollection = {
      set: sandbox.stub(),
      clear: sandbox.stub(),
      delete: sandbox.stub(),
      dispose: sandbox.stub()
    };
    sandbox.stub(vscode.languages, 'createDiagnosticCollection').returns(mockDiagnosticCollection);

    // Mock child_process.execSync
    execSyncStub = sandbox.stub(cp, 'execSync');

    // Mock fs.existsSync
    fsExistsStub = sandbox.stub(fs, 'existsSync');

    // Mock window.activeTextEditor
    sandbox.stub(vscode.window, 'activeTextEditor').value({
      document: {
        uri: vscode.Uri.file('/path/to/file.ts'),
        save: sandbox.stub().resolves()
      }
    });

    // Mock workspace
    sandbox.stub(vscode.workspace, 'getWorkspaceFolder').returns({
      uri: vscode.Uri.file('/path/to/workspace'),
      name: 'test-workspace',
      index: 0
    });

    // Create LinterIntegration instance
    linterIntegration = new LinterIntegration();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialize', () => {
    it('should initialize linter integration', async () => {
      await linterIntegration.initialize();
      // Only testing that it doesn't throw, as implementation is empty
    });
  });

  describe('runLinter', () => {
    it('should return early if no active editor', async () => {
      // Override the activeTextEditor stub to return undefined
      sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);

      const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');

      await linterIntegration.runLinter();

      expect(showWarningStub.calledOnce).to.be.true;
      expect(showWarningStub.calledWith('No active editor found')).to.be.true;
      expect(execSyncStub.called).to.be.false;
    });

    it('should return early if file is not in workspace', async () => {
      // Override workspace folder stub to return undefined
      sandbox.stub(vscode.workspace, 'getWorkspaceFolder').returns(undefined);

      const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');

      await linterIntegration.runLinter();

      expect(showWarningStub.calledOnce).to.be.true;
      expect(showWarningStub.calledWith('File must be part of a workspace')).to.be.true;
      expect(execSyncStub.called).to.be.false;
    });

    it('should run ESLint for TypeScript files', async () => {
      // Mock document save
      const saveStub = sandbox.stub().resolves();

      // Set activeTextEditor to return a TypeScript file
      sandbox.stub(vscode.window, 'activeTextEditor').value({
        document: {
          uri: vscode.Uri.file('/path/to/file.ts'),
          save: saveStub
        }
      });

      // Mock ESLint existence check
      fsExistsStub.returns(true);

      // Mock ESLint execution
      execSyncStub.returns(Buffer.from(JSON.stringify([
        {
          filePath: '/path/to/file.ts',
          messages: [
            {
              ruleId: 'no-unused-vars',
              severity: 2,
              message: 'Variable is defined but never used',
              line: 1,
              column: 1,
              endLine: 1,
              endColumn: 10
            }
          ]
        }
      ])));

      await linterIntegration.runLinter();

      expect(saveStub.calledOnce).to.be.true;
      expect(fsExistsStub.calledOnce).to.be.true;
      expect(execSyncStub.calledOnce).to.be.true;
      expect(mockOutputChannel.clear.calledOnce).to.be.true;
      expect(mockOutputChannel.show.calledOnce).to.be.true;
      expect(mockOutputChannel.appendLine.calledWith('Running ESLint...')).to.be.true;
      expect(mockDiagnosticCollection.set.calledOnce).to.be.true;
    });

    it('should run Pylint for Python files', async () => {
      // Mock document save
      const saveStub = sandbox.stub().resolves();

      // Set activeTextEditor to return a Python file
      sandbox.stub(vscode.window, 'activeTextEditor').value({
        document: {
          uri: vscode.Uri.file('/path/to/file.py'),
          save: saveStub
        }
      });

      // Mock Pylint execution
      execSyncStub.returns(Buffer.from(JSON.stringify([
        {
          path: '/path/to/file.py',
          line: 5,
          column: 0,
          type: 'error',
          symbol: 'undefined-variable',
          message: 'Undefined variable'
        }
      ])));

      await linterIntegration.runLinter();

      expect(saveStub.calledOnce).to.be.true;
      expect(execSyncStub.calledOnce).to.be.true;
      expect(mockOutputChannel.clear.calledOnce).to.be.true;
      expect(mockOutputChannel.show.calledOnce).to.be.true;
      expect(mockOutputChannel.appendLine.calledWith('Running Pylint...')).to.be.true;
      expect(mockDiagnosticCollection.set.calledOnce).to.be.true;
    });

    it('should show message for unsupported file types', async () => {
      // Mock document save
      const saveStub = sandbox.stub().resolves();

      // Set activeTextEditor to return an unsupported file type
      sandbox.stub(vscode.window, 'activeTextEditor').value({
        document: {
          uri: vscode.Uri.file('/path/to/file.html'),
          save: saveStub
        }
      });

      const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

      await linterIntegration.runLinter();

      expect(saveStub.calledOnce).to.be.true;
      expect(showInfoStub.calledOnce).to.be.true;
      expect(showInfoStub.calledWith(`No linter configured for .html files`)).to.be.true;
      expect(execSyncStub.called).to.be.false;
    });

    it('should warn if ESLint is not found in node_modules', async () => {
      // Mock document save
      const saveStub = sandbox.stub().resolves();

      // Set activeTextEditor to return a TypeScript file
      sandbox.stub(vscode.window, 'activeTextEditor').value({
        document: {
          uri: vscode.Uri.file('/path/to/file.ts'),
          save: saveStub
        }
      });

      // Mock ESLint existence check to return false
      fsExistsStub.returns(false);

      const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');

      await linterIntegration.runLinter();

      expect(saveStub.calledOnce).to.be.true;
      expect(fsExistsStub.calledOnce).to.be.true;
      expect(showWarningStub.calledOnce).to.be.true;
      expect(showWarningStub.calledWith('ESLint not found in node_modules. Please install it first.')).to.be.true;
      expect(execSyncStub.called).to.be.false;
    });

    it('should handle errors when running ESLint', async () => {
      // Mock document save
      const saveStub = sandbox.stub().resolves();

      // Set activeTextEditor to return a TypeScript file
      sandbox.stub(vscode.window, 'activeTextEditor').value({
        document: {
          uri: vscode.Uri.file('/path/to/file.ts'),
          save: saveStub
        }
      });

      // Mock ESLint existence check
      fsExistsStub.returns(true);

      // Force an error during execution
      const error = new Error('Command failed');
      execSyncStub.throws(error);

      const showErrorStub = sandbox.stub(vscode.window, 'showErrorMessage');

      await linterIntegration.runLinter();

      expect(saveStub.calledOnce).to.be.true;
      expect(fsExistsStub.calledOnce).to.be.true;
      expect(execSyncStub.calledOnce).to.be.true;
      expect(mockOutputChannel.appendLine.calledWith(`Error running ESLint: ${error}`)).to.be.true;
      expect(showErrorStub.calledOnce).to.be.true;
    });

    it('should handle errors when running Pylint', async () => {
      // Mock document save
      const saveStub = sandbox.stub().resolves();

      // Set activeTextEditor to return a Python file
      sandbox.stub(vscode.window, 'activeTextEditor').value({
        document: {
          uri: vscode.Uri.file('/path/to/file.py'),
          save: saveStub
        }
      });

      // Force an error during execution
      const error = new Error('Command failed');
      execSyncStub.throws(error);

      const showErrorStub = sandbox.stub(vscode.window, 'showErrorMessage');

      await linterIntegration.runLinter();

      expect(saveStub.calledOnce).to.be.true;
      expect(execSyncStub.calledOnce).to.be.true;
      expect(mockOutputChannel.appendLine.calledWith(`Error running Pylint: ${error}`)).to.be.true;
      expect(showErrorStub.calledOnce).to.be.true;
    });
  });

  describe('parseLintResults', () => {
    it('should parse ESLint results and create diagnostics', () => {
      const filePath = '/path/to/file.ts';
      const results = JSON.stringify([
        {
          filePath,
          messages: [
            {
              ruleId: 'no-unused-vars',
              severity: 2,
              message: 'Variable is defined but never used',
              line: 1,
              column: 1,
              endLine: 1,
              endColumn: 10
            },
            {
              ruleId: 'semi',
              severity: 1,
              message: 'Missing semicolon',
              line: 2,
              column: 5
            }
          ]
        }
      ]);

      (linterIntegration as any).parseLintResults(filePath, results, 'eslint');

      expect(mockDiagnosticCollection.set.calledOnce).to.be.true;
      const diagnostics = mockDiagnosticCollection.set.firstCall.args[1];
      expect(diagnostics).to.be.an('array').with.lengthOf(2);

      // Verify first diagnostic (error)
      expect(diagnostics[0].message).to.equal('Variable is defined but never used');
      expect(diagnostics[0].severity).to.equal(vscode.DiagnosticSeverity.Error);
      expect(diagnostics[0].source).to.equal('eslint');
      expect(diagnostics[0].code).to.equal('no-unused-vars');

      // Verify second diagnostic (warning)
      expect(diagnostics[1].message).to.equal('Missing semicolon');
      expect(diagnostics[1].severity).to.equal(vscode.DiagnosticSeverity.Warning);
    });

    it('should parse Pylint results and create diagnostics', () => {
      const filePath = '/path/to/file.py';
      const results = JSON.stringify([
        {
          type: 'error',
          symbol: 'undefined-variable',
          message: 'Undefined variable',
          line: 5,
          column: 10
        },
        {
          type: 'warning',
          symbol: 'unused-import',
          message: 'Unused import',
          line: 2,
          column: 1
        }
      ]);

      (linterIntegration as any).parseLintResults(filePath, results, 'pylint');

      expect(mockDiagnosticCollection.set.calledOnce).to.be.true;
      const diagnostics = mockDiagnosticCollection.set.firstCall.args[1];
      expect(diagnostics).to.be.an('array').with.lengthOf(2);

      // Verify first diagnostic (error)
      expect(diagnostics[0].message).to.equal('Undefined variable');
      expect(diagnostics[0].severity).to.equal(vscode.DiagnosticSeverity.Error);
      expect(diagnostics[0].source).to.equal('pylint');
      expect(diagnostics[0].code).to.equal('undefined-variable');

      // Verify second diagnostic (warning)
      expect(diagnostics[1].message).to.equal('Unused import');
      expect(diagnostics[1].severity).to.equal(vscode.DiagnosticSeverity.Warning);
    });

    it('should handle empty results', () => {
      const filePath = '/path/to/file.ts';
      const results = JSON.stringify([{ filePath, messages: [] }]);

      (linterIntegration as any).parseLintResults(filePath, results, 'eslint');

      expect(mockDiagnosticCollection.set.calledOnce).to.be.true;
      const diagnostics = mockDiagnosticCollection.set.firstCall.args[1];
      expect(diagnostics).to.be.an('array').with.lengthOf(0);
      expect(mockOutputChannel.appendLine.calledWith('No issues found')).to.be.true;
    });

    it('should handle errors when parsing results', () => {
      const filePath = '/path/to/file.ts';
      const invalidJson = 'invalid JSON';

      (linterIntegration as any).parseLintResults(filePath, invalidJson, 'eslint');

      expect(mockOutputChannel.appendLine.calledWith(sinon.match(/Error parsing lint results/))).to.be.true;
    });
  });

  describe('mapESLintSeverity', () => {
    it('should map ESLint severity levels to VS Code diagnostic severities', () => {
      const errorSeverity = (linterIntegration as any).mapESLintSeverity(2);
      const warningSeverity = (linterIntegration as any).mapESLintSeverity(1);
      const infoSeverity = (linterIntegration as any).mapESLintSeverity(0);

      expect(errorSeverity).to.equal(vscode.DiagnosticSeverity.Error);
      expect(warningSeverity).to.equal(vscode.DiagnosticSeverity.Warning);
      expect(infoSeverity).to.equal(vscode.DiagnosticSeverity.Information);
    });
  });

  describe('mapPylintSeverity', () => {
    it('should map Pylint severity levels to VS Code diagnostic severities', () => {
      const errorSeverity = (linterIntegration as any).mapPylintSeverity('error');
      const warningSeverity = (linterIntegration as any).mapPylintSeverity('warning');
      const conventionSeverity = (linterIntegration as any).mapPylintSeverity('convention');
      const refactorSeverity = (linterIntegration as any).mapPylintSeverity('refactor');
      const defaultSeverity = (linterIntegration as any).mapPylintSeverity('unknown');

      expect(errorSeverity).to.equal(vscode.DiagnosticSeverity.Error);
      expect(warningSeverity).to.equal(vscode.DiagnosticSeverity.Warning);
      expect(conventionSeverity).to.equal(vscode.DiagnosticSeverity.Information);
      expect(refactorSeverity).to.equal(vscode.DiagnosticSeverity.Hint);
      expect(defaultSeverity).to.equal(vscode.DiagnosticSeverity.Information);
    });
  });

  describe('dispose', () => {
    it('should dispose all disposable resources', () => {
      linterIntegration.dispose();

      expect(mockOutputChannel.dispose.calledOnce).to.be.true;
      expect(mockDiagnosticCollection.dispose.calledOnce).to.be.true;
    });
  });
});
