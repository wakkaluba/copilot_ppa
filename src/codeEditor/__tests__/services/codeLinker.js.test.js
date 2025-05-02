import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeLinkerService } from '../../services/codeLinker';

describe('CodeLinkerService', () => {
  let service;
  let sandbox;
  let mockEditor;
  let mockPosition;
  let mockUri;
  let mockStatusBarItem;
  let mockDecorationType;
  let mockSelection;
  let mockDocument;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code APIs
    mockPosition = {
      line: 5,
      character: 10,
      translate: sandbox.stub().returns({ line: 5, character: 11 }),
      with: sandbox.stub().returns({ line: 5, character: 11 })
    };

    mockUri = {
      fsPath: '/path/to/file.js',
      scheme: 'file',
      toString: sandbox.stub().returns('file:///path/to/file.js')
    };

    mockDocument = {
      getText: sandbox.stub().returns('const test = "sample code";'),
      uri: mockUri,
      lineAt: sandbox.stub().returns({
        text: 'const test = "sample code";',
        range: { start: { line: 5, character: 0 }, end: { line: 5, character: 30 } }
      }),
      positionAt: sandbox.stub().returns(mockPosition),
      offsetAt: sandbox.stub().returns(100),
      getWordRangeAtPosition: sandbox.stub().returns({
        start: { line: 5, character: 10 },
        end: { line: 5, character: 14 },
        isEmpty: sandbox.stub().returns(false),
        contains: sandbox.stub().returns(true)
      })
    };

    mockSelection = {
      isEmpty: false,
      active: mockPosition,
      anchor: mockPosition,
      start: { line: 5, character: 10 },
      end: { line: 5, character: 14 }
    };

    mockEditor = {
      document: mockDocument,
      selection: mockSelection,
      revealRange: sandbox.stub(),
      setDecorations: sandbox.stub()
    };

    mockStatusBarItem = {
      text: '',
      tooltip: '',
      command: '',
      show: sandbox.stub(),
      hide: sandbox.stub(),
      dispose: sandbox.stub()
    };

    mockDecorationType = {
      dispose: sandbox.stub()
    };

    // Mock vscode namespace
    sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
    sandbox.stub(vscode.window, 'showTextDocument').resolves(mockEditor);
    sandbox.stub(vscode.window, 'createStatusBarItem').returns(mockStatusBarItem);
    sandbox.stub(vscode.window, 'showInformationMessage').resolves();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox.stub(vscode.window, 'showOpenDialog').resolves([mockUri]);
    sandbox.stub(vscode.workspace, 'openTextDocument').resolves(mockDocument);
    sandbox.stub(vscode.workspace, 'getConfiguration').returns({
      get: sandbox.stub().returns({}),
      update: sandbox.stub().resolves()
    });
    sandbox.stub(vscode.window, 'createTextEditorDecorationType').returns(mockDecorationType);
    sandbox.stub(vscode.Uri, 'parse').returns(mockUri);

    // Create service instance
    service = new CodeLinkerService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createCodeLink', () => {
    it('should create a code link from the current selection', async () => {
      // Setup the getSelectionOrWordAtCursor stub
      const selectionResult = {
        selection: mockSelection,
        text: 'test'
      };

      sandbox.stub(service, 'getSelectionOrWordAtCursor').returns(selectionResult);

      // Mock saveCodeLink method
      sandbox.stub(service, 'saveCodeLink').resolves();

      await service.createCodeLink();

      expect(service.getSelectionOrWordAtCursor.calledWith(mockEditor)).to.be.true;
      expect(service.saveCodeLink.called).to.be.true;
      expect(vscode.window.showInformationMessage.called).to.be.true;
    });

    it('should show error when no editor is active', async () => {
      vscode.window.activeTextEditor = undefined;

      await service.createCodeLink();

      expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
    });

    it('should show error when no text is selected', async () => {
      sandbox.stub(service, 'getSelectionOrWordAtCursor').returns(null);

      await service.createCodeLink();

      expect(vscode.window.showErrorMessage.calledWith('No text selected or cursor not on a word')).to.be.true;
    });

    it('should show error when no target file is selected', async () => {
      const selectionResult = {
        selection: mockSelection,
        text: 'test'
      };

      sandbox.stub(service, 'getSelectionOrWordAtCursor').returns(selectionResult);
      vscode.window.showOpenDialog.resolves(null);

      await service.createCodeLink();

      expect(service.getSelectionOrWordAtCursor.calledWith(mockEditor)).to.be.true;
      expect(vscode.window.showOpenDialog.called).to.be.true;
    });

    it('should handle errors during link creation', async () => {
      const selectionResult = {
        selection: mockSelection,
        text: 'test'
      };

      sandbox.stub(service, 'getSelectionOrWordAtCursor').returns(selectionResult);
      vscode.workspace.openTextDocument.rejects(new Error('Test error'));

      await service.createCodeLink();

      expect(vscode.window.showErrorMessage.calledWith('Failed to create code link: Error: Test error')).to.be.true;
    });
  });

  describe('navigateCodeLink', () => {
    it('should navigate to a code link at the current position', async () => {
      // Mock findLinkAtPosition method
      const mockLink = {
        source: {
          uri: mockUri.toString(),
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.js',
          position: {
            line: 10,
            character: 15
          }
        }
      };

      sandbox.stub(service, 'findLinkAtPosition').resolves(mockLink);

      // Mock navigateToTarget method
      sandbox.stub(service, 'navigateToTarget').resolves();

      await service.navigateCodeLink();

      expect(service.findLinkAtPosition.called).to.be.true;
      expect(service.navigateToTarget.calledWith(mockLink, mockEditor)).to.be.true;
      expect(vscode.window.showInformationMessage.calledWith('Navigated to linked code')).to.be.true;
    });

    it('should show error when no editor is active', async () => {
      vscode.window.activeTextEditor = undefined;

      await service.navigateCodeLink();

      expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
    });

    it('should show information when no link is found at the current position', async () => {
      sandbox.stub(service, 'findLinkAtPosition').resolves(null);

      await service.navigateCodeLink();

      expect(service.findLinkAtPosition.called).to.be.true;
      expect(vscode.window.showInformationMessage.calledWith('No code link found at current position')).to.be.true;
    });

    it('should handle errors during navigation', async () => {
      // Mock findLinkAtPosition method
      const mockLink = {
        source: {
          uri: mockUri.toString(),
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.js',
          position: {
            line: 10,
            character: 15
          }
        }
      };

      sandbox.stub(service, 'findLinkAtPosition').resolves(mockLink);

      // Mock navigateToTarget method to throw error
      sandbox.stub(service, 'navigateToTarget').rejects(new Error('Test error'));

      await service.navigateCodeLink();

      expect(service.findLinkAtPosition.called).to.be.true;
      expect(service.navigateToTarget.calledWith(mockLink, mockEditor)).to.be.true;
      expect(vscode.window.showErrorMessage.calledWith('Failed to navigate to linked code: Error: Test error')).to.be.true;
    });
  });

  describe('getSelectionOrWordAtCursor', () => {
    it('should return the selected text when selection is not empty', () => {
      mockEditor.selection.isEmpty = false;
      mockEditor.document.getText.returns('selected text');

      const result = service.getSelectionOrWordAtCursor(mockEditor);

      expect(result.text).to.equal('selected text');
      expect(result.selection).to.equal(mockEditor.selection);
    });

    it('should return the word at cursor when selection is empty', () => {
      mockEditor.selection.isEmpty = true;
      const wordRange = {
        start: { line: 5, character: 10 },
        end: { line: 5, character: 14 }
      };
      mockEditor.document.getWordRangeAtPosition.returns(wordRange);
      mockEditor.document.getText.withArgs(wordRange).returns('word');

      const result = service.getSelectionOrWordAtCursor(mockEditor);

      expect(result.text).to.equal('word');
      expect(result.selection).to.be.an.instanceOf(Object);
    });

    it('should return null when no selection and no word at cursor', () => {
      mockEditor.selection.isEmpty = true;
      mockEditor.document.getWordRangeAtPosition.returns(null);

      const result = service.getSelectionOrWordAtCursor(mockEditor);

      expect(result).to.be.null;
    });
  });

  describe('findLinkAtPosition', () => {
    it('should find a link at the given position', async () => {
      const codeLinks = {
        'codeLink:file:///path/to/file.js:5:10': {
          source: {
            uri: 'file:///path/to/file.js',
            position: {
              line: 5,
              character: 10
            },
            text: 'test'
          },
          target: {
            uri: 'file:///path/to/target.js'
          }
        }
      };

      vscode.workspace.getConfiguration.returns({
        get: sandbox.stub().returns(codeLinks)
      });

      const result = await service.findLinkAtPosition('file:///path/to/file.js', mockPosition);

      expect(result).to.deep.equal(codeLinks['codeLink:file:///path/to/file.js:5:10']);
    });

    it('should return null when no links exist', async () => {
      vscode.workspace.getConfiguration.returns({
        get: sandbox.stub().returns(null)
      });

      const result = await service.findLinkAtPosition('file:///path/to/file.js', mockPosition);

      expect(result).to.be.null;
    });

    it('should return null when no matching link is found', async () => {
      const codeLinks = {
        'codeLink:file:///path/to/file.js:6:10': {
          source: {
            uri: 'file:///path/to/file.js',
            position: {
              line: 6,
              character: 10
            },
            text: 'test'
          },
          target: {
            uri: 'file:///path/to/target.js'
          }
        }
      };

      vscode.workspace.getConfiguration.returns({
        get: sandbox.stub().returns(codeLinks)
      });

      const result = await service.findLinkAtPosition('file:///path/to/file.js', mockPosition);

      expect(result).to.be.null;
    });
  });

  describe('navigateToTarget', () => {
    it('should open the target document and navigate to the target position', async () => {
      const link = {
        source: {
          uri: 'file:///path/to/file.js',
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.js',
          position: {
            line: 10,
            character: 15
          }
        }
      };

      await service.navigateToTarget(link, mockEditor);

      expect(vscode.Uri.parse.calledWith(link.target.uri)).to.be.true;
      expect(vscode.workspace.openTextDocument.called).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.true;
      expect(mockEditor.selection).to.be.an.instanceOf(Object);
      expect(mockEditor.revealRange.called).to.be.true;
    });

    it('should navigate to the document without setting position when target position is not specified', async () => {
      const link = {
        source: {
          uri: 'file:///path/to/file.js',
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.js'
        }
      };

      await service.navigateToTarget(link, mockEditor);

      expect(vscode.Uri.parse.calledWith(link.target.uri)).to.be.true;
      expect(vscode.workspace.openTextDocument.called).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.true;
      expect(mockEditor.revealRange.called).to.be.false;
    });
  });

  describe('createStatusBarItem', () => {
    it('should create a status bar item with the correct text', () => {
      const statusBar = service.createStatusBarItem();

      expect(statusBar).to.equal(mockStatusBarItem);
      expect(mockStatusBarItem.text).to.equal('$(link) Click on target position for code link...');
      expect(mockStatusBarItem.show.called).to.be.true;
    });
  });

  describe('createHighlightDecoration', () => {
    it('should create a decoration type with correct styling', () => {
      const decoration = service.createHighlightDecoration();

      expect(decoration).to.equal(mockDecorationType);
      expect(vscode.window.createTextEditorDecorationType.called).to.be.true;
    });
  });

  describe('saveCodeLink', () => {
    it('should save a code link to workspace configuration', async () => {
      const link = {
        source: {
          uri: 'file:///path/to/file.js',
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.js'
        }
      };

      const configUpdate = sandbox.stub().resolves();
      vscode.workspace.getConfiguration.returns({
        update: configUpdate
      });

      await service.saveCodeLink(link);

      expect(configUpdate.called).to.be.true;
      expect(configUpdate.firstCall.args[0]).to.equal('copilot-ppa.codeLinks');
      expect(configUpdate.firstCall.args[1]).to.be.an('object');
      expect(configUpdate.firstCall.args[2]).to.equal(vscode.ConfigurationTarget.Workspace);
    });
  });
});
