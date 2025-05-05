import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeDiffService } from '../../../src/codeTools/services/CodeDiffService';

describe('CodeDiffService - TypeScript', () => {
  let service: CodeDiffService;
  let sandbox: sinon.SinonSandbox;
  let mockVSCode: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    service = new CodeDiffService();

    // Mock VS Code API
    mockVSCode = {
      workspace: {
        openTextDocument: sandbox.stub().resolves({
          lineCount: 10
        }),
        applyEdit: sandbox.stub().resolves(true)
      },
      commands: {
        executeCommand: sandbox.stub().resolves()
      },
      Uri: {
        file: (filePath: string) => ({
          fsPath: filePath,
          path: filePath,
          with: (options: any) => ({
            ...options,
            fsPath: filePath,
            path: filePath
          })
        })
      },
      Range: class {
        constructor(
          public readonly startLine: number,
          public readonly startCharacter: number,
          public readonly endLine: number,
          public readonly endCharacter: number
        ) {}
      },
      WorkspaceEdit: class {
        replaceCalls: any[] = [];
        replace(uri: any, range: any, newText: string) {
          this.replaceCalls.push({ uri, range, newText });
        }
      }
    };

    // Replace VS Code API with mocks
    sandbox.stub(vscode, 'workspace').value(mockVSCode.workspace);
    sandbox.stub(vscode, 'commands').value(mockVSCode.commands);
    sandbox.stub(vscode, 'Range').value(mockVSCode.Range);
    sandbox.stub(vscode, 'WorkspaceEdit').value(mockVSCode.WorkspaceEdit);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('showDiff', () => {
    it('should correctly set up URIs and show the diff', async () => {
      const uri = vscode.Uri.file('/path/to/test-file.js');
      const originalContent = 'Original content';
      const modifiedContent = 'Modified content';
      const title = 'Test Diff';

      await service.showDiff(uri, originalContent, modifiedContent, title);

      // Check if documents were opened
      expect(mockVSCode.workspace.openTextDocument.calledTwice).to.be.true;

      // Verify the URIs used for opening documents
      const originalUriArg = mockVSCode.workspace.openTextDocument.firstCall.args[0];
      const modifiedUriArg = mockVSCode.workspace.openTextDocument.secondCall.args[0];
      expect(originalUriArg.scheme).to.equal('original');
      expect(modifiedUriArg.scheme).to.equal('modified');
      expect(originalUriArg.path).to.include('.original');
      expect(modifiedUriArg.path).to.include('.modified');

      // Verify edits were applied
      expect(mockVSCode.workspace.applyEdit.calledTwice).to.be.true;

      // Verify diff command was executed
      expect(mockVSCode.commands.executeCommand.calledOnce).to.be.true;
      expect(mockVSCode.commands.executeCommand.firstCall.args[0]).to.equal('vscode.diff');
      expect(mockVSCode.commands.executeCommand.firstCall.args[3]).to.equal('test-file.js - Test Diff');
    });

    it('should handle filenames with spaces and special characters', async () => {
      const uri = vscode.Uri.file('/path/to/special file name (1).js');
      const originalContent = 'Original content';
      const modifiedContent = 'Modified content';
      const title = 'Test Diff';

      await service.showDiff(uri, originalContent, modifiedContent, title);

      // Verify the diff title contains the correct filename
      const diffTitle = mockVSCode.commands.executeCommand.firstCall.args[3];
      expect(diffTitle).to.equal('special file name (1).js - Test Diff');
    });

    it('should handle empty content strings', async () => {
      const uri = vscode.Uri.file('/path/to/test-file.js');
      const originalContent = '';
      const modifiedContent = '';
      const title = 'Empty Test';

      await service.showDiff(uri, originalContent, modifiedContent, title);

      // Verify edits were still applied even with empty content
      expect(mockVSCode.workspace.applyEdit.calledTwice).to.be.true;

      // Verify diff command was executed
      expect(mockVSCode.commands.executeCommand.calledOnce).to.be.true;
    });

    it('should handle errors when opening documents', async () => {
      const uri = vscode.Uri.file('/path/to/test-file.js');
      const originalContent = 'Original content';
      const modifiedContent = 'Modified content';
      const title = 'Test Diff';

      // Make openTextDocument throw an error
      mockVSCode.workspace.openTextDocument.rejects(new Error('Failed to open document'));

      try {
        await service.showDiff(uri, originalContent, modifiedContent, title);
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to open document');
      }

      // Verify applyEdit was not called
      expect(mockVSCode.workspace.applyEdit.called).to.be.false;
      // Verify executeCommand was not called
      expect(mockVSCode.commands.executeCommand.called).to.be.false;
    });

    it('should handle errors when applying edits', async () => {
      const uri = vscode.Uri.file('/path/to/test-file.js');
      const originalContent = 'Original content';
      const modifiedContent = 'Modified content';
      const title = 'Test Diff';

      // Make applyEdit reject
      mockVSCode.workspace.applyEdit.rejects(new Error('Failed to apply edit'));

      try {
        await service.showDiff(uri, originalContent, modifiedContent, title);
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to apply edit');
      }

      // Verify executeCommand was not called
      expect(mockVSCode.commands.executeCommand.called).to.be.false;
    });

    it('should handle errors when executing diff command', async () => {
      const uri = vscode.Uri.file('/path/to/test-file.js');
      const originalContent = 'Original content';
      const modifiedContent = 'Modified content';
      const title = 'Test Diff';

      // Make executeCommand reject
      mockVSCode.commands.executeCommand.rejects(new Error('Failed to execute command'));

      try {
        await service.showDiff(uri, originalContent, modifiedContent, title);
        // Should not reach here
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to execute command');
      }

      // Verify applyEdit was still called
      expect(mockVSCode.workspace.applyEdit.calledTwice).to.be.true;
    });
  });
});
