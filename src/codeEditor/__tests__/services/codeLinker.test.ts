import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeLinkerService } from '../../services/codeLinker';
import { CodeLink } from '../../types';

describe('CodeLinkerService', () => {
  let service: CodeLinkerService;
  let sandbox: sinon.SinonSandbox;
  let mockEditor: any;
  let mockPosition: vscode.Position;
  let mockUri: vscode.Uri;
  let mockStatusBarItem: vscode.StatusBarItem;
  let mockDecorationType: vscode.TextEditorDecorationType;
  let mockSelection: vscode.Selection;
  let mockDocument: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock VS Code APIs
    mockPosition = {
      line: 5,
      character: 10,
      translate: sandbox.stub().returns({ line: 5, character: 11 }),
      with: sandbox.stub().returns({ line: 5, character: 11 })
    } as unknown as vscode.Position;

    mockUri = {
      fsPath: '/path/to/file.ts',
      scheme: 'file',
      toString: sandbox.stub().returns('file:///path/to/file.ts')
    } as unknown as vscode.Uri;

    mockDocument = {
      getText: sandbox.stub().returns('const test: string = "sample code";'),
      uri: mockUri,
      lineAt: sandbox.stub().returns({
        text: 'const test: string = "sample code";',
        range: { start: { line: 5, character: 0 }, end: { line: 5, character: 35 } }
      }),
      positionAt: sandbox.stub().returns(mockPosition),
      offsetAt: sandbox.stub().returns(100),
      getWordRangeAtPosition: sandbox.stub().returns({
        start: { line: 5, character: 10 },
        end: { line: 5, character: 14 },
        isEmpty: sandbox.stub().returns(false),
        contains: sandbox.stub().returns(true)
      } as unknown as vscode.Range)
    };

    mockSelection = {
      isEmpty: false,
      active: mockPosition,
      anchor: mockPosition,
      start: { line: 5, character: 10 },
      end: { line: 5, character: 14 }
    } as unknown as vscode.Selection;

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
    } as unknown as vscode.StatusBarItem;

    mockDecorationType = {
      dispose: sandbox.stub()
    } as unknown as vscode.TextEditorDecorationType;

    // Mock vscode namespace
    sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);
    sandbox.stub(vscode.window, 'showTextDocument').resolves(mockEditor);
    sandbox.stub(vscode.window, 'createStatusBarItem').returns(mockStatusBarItem);
    sandbox.stub(vscode.window, 'showInformationMessage').resolves();
    sandbox.stub(vscode.window, 'showErrorMessage').resolves();
    sandbox.stub(vscode.window, 'showOpenDialog').resolves([mockUri]);
    sandbox.stub(vscode.workspace, 'openTextDocument').resolves(mockDocument as unknown as vscode.TextDocument);
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

      sandbox.stub(service as any, 'getSelectionOrWordAtCursor').returns(selectionResult);

      // Mock saveCodeLink method
      sandbox.stub(service as any, 'saveCodeLink').resolves();

      await service.createCodeLink();

      expect((service as any).getSelectionOrWordAtCursor.calledWith(mockEditor)).to.be.true;
      expect((service as any).saveCodeLink.called).to.be.true;
      expect(vscode.window.showInformationMessage.called).to.be.true;
    });

    it('should show error when no editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await service.createCodeLink();

      expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
    });

    it('should show error when no text is selected', async () => {
      sandbox.stub(service as any, 'getSelectionOrWordAtCursor').returns(null);

      await service.createCodeLink();

      expect(vscode.window.showErrorMessage.calledWith('No text selected or cursor not on a word')).to.be.true;
    });

    it('should show error when no target file is selected', async () => {
      const selectionResult = {
        selection: mockSelection,
        text: 'test'
      };

      sandbox.stub(service as any, 'getSelectionOrWordAtCursor').returns(selectionResult);
      (vscode.window.showOpenDialog as sinon.SinonStub).resolves(null);

      await service.createCodeLink();

      expect((service as any).getSelectionOrWordAtCursor.calledWith(mockEditor)).to.be.true;
      expect(vscode.window.showOpenDialog.called).to.be.true;
    });

    it('should handle errors during link creation', async () => {
      const selectionResult = {
        selection: mockSelection,
        text: 'test'
      };

      sandbox.stub(service as any, 'getSelectionOrWordAtCursor').returns(selectionResult);
      (vscode.workspace.openTextDocument as sinon.SinonStub).rejects(new Error('Test error'));

      await service.createCodeLink();

      expect(vscode.window.showErrorMessage.calledWith('Failed to create code link: Error: Test error')).to.be.true;
    });

    it('should create a CodeLink with the correct structure', async () => {
      // Setup the getSelectionOrWordAtCursor stub
      const selectionResult = {
        selection: mockSelection,
        text: 'testSymbol'
      };

      sandbox.stub(service as any, 'getSelectionOrWordAtCursor').returns(selectionResult);

      // Add a spy on the saveCodeLink method to capture the link being saved
      const saveCodeLinkSpy = sandbox.stub(service as any, 'saveCodeLink').resolves();

      await service.createCodeLink();

      // Verify the link has the correct structure
      expect(saveCodeLinkSpy.called).to.be.true;
      const savedLink = saveCodeLinkSpy.firstCall.args[0];
      expect(savedLink).to.have.property('source');
      expect(savedLink.source).to.have.property('uri').that.equals(mockUri.toString());
      expect(savedLink.source).to.have.property('position').that.deep.equals({
        line: mockSelection.start.line,
        character: mockSelection.start.character
      });
      expect(savedLink.source).to.have.property('text').that.equals('testSymbol');
      expect(savedLink).to.have.property('target');
      expect(savedLink.target).to.have.property('uri').that.equals(mockUri.toString());
    });

    it('should handle case where targetUri is undefined in showOpenDialog result', async () => {
      const selectionResult = {
        selection: mockSelection,
        text: 'test'
      };

      sandbox.stub(service as any, 'getSelectionOrWordAtCursor').returns(selectionResult);
      (vscode.window.showOpenDialog as sinon.SinonStub).resolves([undefined]);

      await service.createCodeLink();

      expect(vscode.window.showErrorMessage.calledWith('Failed to create code link: Error: No target file selected')).to.be.true;
    });

    it('should handle when no editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;
      await service.createCodeLink();
      expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
    });

    it('should handle empty selection', async () => {
      mockSelection.isEmpty = true;
      mockDocument.getWordRangeAtPosition.returns(null);
      await service.createCodeLink();
      expect(vscode.window.showErrorMessage.calledWith('No text selected or cursor not on a word')).to.be.true;
    });

    it('should handle canceled file selection', async () => {
      (vscode.window.showOpenDialog as sinon.SinonStub).resolves(undefined);
      await service.createCodeLink();
      expect(vscode.window.showOpenDialog.called).to.be.true;
    });

    it('should create a code link with proper structure', async () => {
      const targetUri = { ...mockUri, toString: () => 'file:///path/to/target.ts' };
      (vscode.window.showOpenDialog as sinon.SinonStub).resolves([targetUri]);
      (vscode.workspace.openTextDocument as sinon.SinonStub).resolves(mockDocument);

      await service.createCodeLink();

      const config = vscode.workspace.getConfiguration();
      expect(config.update.called).to.be.true;
      const updateCall = config.update.getCall(0);
      expect(updateCall.args[0]).to.equal('copilot-ppa.codeLinks');
      expect(updateCall.args[1]).to.be.an('object');
      expect(updateCall.args[2]).to.equal(vscode.ConfigurationTarget.Workspace);
    });

    it('should handle errors during link creation', async () => {
      const error = new Error('Test error');
      (vscode.window.showOpenDialog as sinon.SinonStub).rejects(error);
      await service.createCodeLink();
      expect(vscode.window.showErrorMessage.calledWith(`Failed to create code link: ${error}`)).to.be.true;
    });
  });

  describe('navigateCodeLink', () => {
    it('should navigate to a code link at the current position', async () => {
      // Mock findLinkAtPosition method
      const mockLink: CodeLink = {
        source: {
          uri: mockUri.toString(),
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts',
          position: {
            line: 10,
            character: 15
          }
        }
      };

      sandbox.stub(service as any, 'findLinkAtPosition').resolves(mockLink);

      // Mock navigateToTarget method
      sandbox.stub(service as any, 'navigateToTarget').resolves();

      await service.navigateCodeLink();

      expect((service as any).findLinkAtPosition.called).to.be.true;
      expect((service as any).navigateToTarget.calledWith(mockLink, mockEditor)).to.be.true;
      expect(vscode.window.showInformationMessage.calledWith('Navigated to linked code')).to.be.true;
    });

    it('should show error when no editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;

      await service.navigateCodeLink();

      expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
    });

    it('should show information when no link is found at the current position', async () => {
      sandbox.stub(service as any, 'findLinkAtPosition').resolves(null);

      await service.navigateCodeLink();

      expect((service as any).findLinkAtPosition.called).to.be.true;
      expect(vscode.window.showInformationMessage.calledWith('No code link found at current position')).to.be.true;
    });

    it('should handle errors during navigation', async () => {
      // Mock findLinkAtPosition method
      const mockLink: CodeLink = {
        source: {
          uri: mockUri.toString(),
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts',
          position: {
            line: 10,
            character: 15
          }
        }
      };

      sandbox.stub(service as any, 'findLinkAtPosition').resolves(mockLink);

      // Mock navigateToTarget method to throw error
      sandbox.stub(service as any, 'navigateToTarget').rejects(new Error('Test error'));

      await service.navigateCodeLink();

      expect((service as any).findLinkAtPosition.called).to.be.true;
      expect((service as any).navigateToTarget.calledWith(mockLink, mockEditor)).to.be.true;
      expect(vscode.window.showErrorMessage.calledWith('Failed to navigate to linked code: Error: Test error')).to.be.true;
    });

    it('should handle target document with no position field', async () => {
      const mockLink: CodeLink = {
        source: {
          uri: mockUri.toString(),
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts'
          // no position field
        }
      };

      sandbox.stub(service as any, 'findLinkAtPosition').resolves(mockLink);
      const navigateToTargetSpy = sandbox.stub(service as any, 'navigateToTarget').resolves();

      await service.navigateCodeLink();

      expect(navigateToTargetSpy.called).to.be.true;
      expect(navigateToTargetSpy.firstCall.args[0].target.position).to.be.undefined;
    });

    it('should handle when no editor is active', async () => {
      (vscode.window.activeTextEditor as any) = undefined;
      await service.navigateCodeLink();
      expect(vscode.window.showErrorMessage.calledWith('No active editor found')).to.be.true;
    });

    it('should handle when no link found at position', async () => {
      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns(null)
      });

      await service.navigateCodeLink();
      expect(vscode.window.showInformationMessage.calledWith('No code link found at current position')).to.be.true;
    });

    it('should navigate to linked code successfully', async () => {
      const mockLink: CodeLink = {
        source: {
          uri: mockUri.toString(),
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts',
          position: {
            line: 10,
            character: 15
          }
        }
      };

      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns({
          [`codeLink:${mockUri.toString()}:5:10`]: mockLink
        })
      });

      await service.navigateCodeLink();
      expect(vscode.workspace.openTextDocument.called).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.true;
      expect(vscode.window.showInformationMessage.calledWith('Navigated to linked code')).to.be.true;
    });

    it('should handle errors during navigation', async () => {
      const mockLink: CodeLink = {
        source: {
          uri: mockUri.toString(),
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts',
          position: {
            line: 10,
            character: 15
          }
        }
      };

      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns({
          [`codeLink:${mockUri.toString()}:5:10`]: mockLink
        })
      });

      const error = new Error('Test error');
      (vscode.workspace.openTextDocument as sinon.SinonStub).rejects(error);
      await service.navigateCodeLink();
      expect(vscode.window.showErrorMessage.calledWith(`Failed to navigate to linked code: ${error}`)).to.be.true;
    });
  });

  describe('getSelectionOrWordAtCursor', () => {
    it('should return the selected text when selection is not empty', () => {
      mockEditor.selection.isEmpty = false;
      mockEditor.document.getText.returns('selected text');

      const result = (service as any).getSelectionOrWordAtCursor(mockEditor);

      expect(result.text).to.equal('selected text');
      expect(result.selection).to.equal(mockEditor.selection);
    });

    it('should return the word at cursor when selection is empty', () => {
      mockEditor.selection.isEmpty = true;
      const wordRange = {
        start: { line: 5, character: 10 },
        end: { line: 5, character: 14 }
      } as vscode.Range;
      mockEditor.document.getWordRangeAtPosition.returns(wordRange);
      mockEditor.document.getText.withArgs(wordRange).returns('word');

      const result = (service as any).getSelectionOrWordAtCursor(mockEditor);

      expect(result.text).to.equal('word');
      expect(result.selection).to.be.an.instanceOf(Object);
    });

    it('should return null when no selection and no word at cursor', () => {
      mockEditor.selection.isEmpty = true;
      mockEditor.document.getWordRangeAtPosition.returns(null);

      const result = (service as any).getSelectionOrWordAtCursor(mockEditor);

      expect(result).to.be.null;
    });

    it('should create a new Selection from range when selection is empty and word is found', () => {
      mockEditor.selection.isEmpty = true;
      const wordRange = {
        start: { line: 3, character: 5 },
        end: { line: 3, character: 10 }
      };
      mockEditor.document.getWordRangeAtPosition.returns(wordRange);
      mockEditor.document.getText.withArgs(wordRange).returns('testWord');

      const SelectionStub = sandbox.stub(vscode, 'Selection').returns(mockSelection);

      const result = (service as any).getSelectionOrWordAtCursor(mockEditor);

      expect(SelectionStub.calledWith(wordRange.start, wordRange.end)).to.be.true;
      expect(result.text).to.equal('testWord');
    });
  });

  describe('findLinkAtPosition', () => {
    it('should find a link at the given position', async () => {
      const codeLinks = {
        'codeLink:file:///path/to/file.ts:5:10': {
          source: {
            uri: 'file:///path/to/file.ts',
            position: {
              line: 5,
              character: 10
            },
            text: 'test'
          },
          target: {
            uri: 'file:///path/to/target.ts'
          }
        }
      };

      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns(codeLinks)
      });

      const result = await (service as any).findLinkAtPosition('file:///path/to/file.ts', mockPosition);

      expect(result).to.deep.equal(codeLinks['codeLink:file:///path/to/file.ts:5:10']);
    });

    it('should return null when no links exist', async () => {
      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns(null)
      });

      const result = await (service as any).findLinkAtPosition('file:///path/to/file.ts', mockPosition);

      expect(result).to.be.null;
    });

    it('should return null when no matching link is found', async () => {
      const codeLinks = {
        'codeLink:file:///path/to/file.ts:6:10': {
          source: {
            uri: 'file:///path/to/file.ts',
            position: {
              line: 6,
              character: 10
            },
            text: 'test'
          },
          target: {
            uri: 'file:///path/to/target.ts'
          }
        }
      };

      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns(codeLinks)
      });

      const result = await (service as any).findLinkAtPosition('file:///path/to/file.ts', mockPosition);

      expect(result).to.be.null;
    });

    it('should handle case sensitivity when finding links', async () => {
      const codeLinks = {
        'codeLink:file:///path/to/file.ts:5:10': {
          source: {
            uri: 'file:///path/to/file.ts',
            position: {
              line: 5,
              character: 10
            },
            text: 'TEST'
          },
          target: {
            uri: 'file:///path/to/target.ts'
          }
        }
      };

      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns(codeLinks)
      });

      const result = await (service as any).findLinkAtPosition('file:///path/to/file.ts', mockPosition);

      expect(result).to.deep.equal(codeLinks['codeLink:file:///path/to/file.ts:5:10']);
    });

    it('should match when cursor is in the middle of the linked word', async () => {
      const codeLinks = {
        'codeLink:file:///path/to/file.ts:5:10': {
          source: {
            uri: 'file:///path/to/file.ts',
            position: {
              line: 5,
              character: 10
            },
            text: 'testFunction'  // 12 characters long
          },
          target: {
            uri: 'file:///path/to/target.ts'
          }
        }
      };

      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns(codeLinks)
      });

      // Position in the middle of the word
      const middlePosition = {
        line: 5,
        character: 15 // 5 characters into 'testFunction'
      } as vscode.Position;

      const result = await (service as any).findLinkAtPosition('file:///path/to/file.ts', middlePosition);

      expect(result).to.deep.equal(codeLinks['codeLink:file:///path/to/file.ts:5:10']);
    });

    it('should not match when position is outside the text range', async () => {
      const codeLinks = {
        'codeLink:file:///path/to/file.ts:5:10': {
          source: {
            uri: 'file:///path/to/file.ts',
            position: {
              line: 5,
              character: 10
            },
            text: 'test' // 4 characters
          },
          target: {
            uri: 'file:///path/to/target.ts'
          }
        }
      };

      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns(codeLinks)
      });

      const outsidePosition = {
        line: 5,
        character: 15 // Outside the range (10 + 4 = 14)
      } as vscode.Position;

      const result = await (service as any).findLinkAtPosition('file:///path/to/file.ts', outsidePosition);

      expect(result).to.be.null;
    });

    it('should not match when URI differs', async () => {
      const codeLinks = {
        'codeLink:file:///path/to/file.ts:5:10': {
          source: {
            uri: 'file:///path/to/file.ts',
            position: {
              line: 5,
              character: 10
            },
            text: 'test'
          },
          target: {
            uri: 'file:///path/to/target.ts'
          }
        }
      };

      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        get: sandbox.stub().returns(codeLinks)
      });

      const result = await (service as any).findLinkAtPosition('file:///path/to/other.ts', mockPosition);

      expect(result).to.be.null;
    });
  });

  describe('navigateToTarget', () => {
    it('should open the target document and navigate to the target position', async () => {
      const link: CodeLink = {
        source: {
          uri: 'file:///path/to/file.ts',
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts',
          position: {
            line: 10,
            character: 15
          }
        }
      };

      await (service as any).navigateToTarget(link, mockEditor);

      expect(vscode.Uri.parse.calledWith(link.target.uri)).to.be.true;
      expect(vscode.workspace.openTextDocument.called).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.true;
      expect(mockEditor.selection).to.be.an.instanceOf(Object);
      expect(mockEditor.revealRange.called).to.be.true;
    });

    it('should navigate to the document without setting position when target position is not specified', async () => {
      const link: CodeLink = {
        source: {
          uri: 'file:///path/to/file.ts',
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts'
        }
      };

      await (service as any).navigateToTarget(link, mockEditor);

      expect(vscode.Uri.parse.calledWith(link.target.uri)).to.be.true;
      expect(vscode.workspace.openTextDocument.called).to.be.true;
      expect(vscode.window.showTextDocument.called).to.be.true;
      expect(mockEditor.revealRange.called).to.be.false;
    });

    it('should handle errors when opening target document', async () => {
      const link: CodeLink = {
        source: {
          uri: 'file:///path/to/file.ts',
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/invalid.ts'
        }
      };

      (vscode.workspace.openTextDocument as sinon.SinonStub).rejects(new Error('Document not found'));

      try {
        await (service as any).navigateToTarget(link, mockEditor);
        expect.fail('Expected function to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Document not found');
      }
    });

    it('should set position to target line and character when available', async () => {
      const link: CodeLink = {
        source: {
          uri: 'file:///path/to/file.ts',
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts',
          position: {
            line: 15,
            character: 20
          }
        }
      };

      const PositionStub = sandbox.stub(vscode, 'Position').returns(mockPosition);
      const SelectionStub = sandbox.stub(vscode, 'Selection').returns(mockSelection);
      const RangeStub = sandbox.stub(vscode, 'Range').returns({} as vscode.Range);

      await (service as any).navigateToTarget(link, mockEditor);

      expect(PositionStub.calledWith(15, 20)).to.be.true;
      expect(SelectionStub.called).to.be.true;
      expect(RangeStub.called).to.be.true;
      expect(mockEditor.revealRange.called).to.be.true;
    });
  });

  describe('createStatusBarItem', () => {
    it('should create a status bar item with the correct text', () => {
      const statusBar = (service as any).createStatusBarItem();

      expect(statusBar).to.equal(mockStatusBarItem);
      expect(mockStatusBarItem.text).to.equal('$(link) Click on target position for code link...');
      expect(mockStatusBarItem.show.called).to.be.true;
    });
  });

  describe('createHighlightDecoration', () => {
    it('should create a decoration type with correct styling', () => {
      const decoration = (service as any).createHighlightDecoration();

      expect(decoration).to.equal(mockDecorationType);
      expect(vscode.window.createTextEditorDecorationType.called).to.be.true;
    });

    it('should create a decoration with proper background color', () => {
      const mockThemeColor = sandbox.stub();
      sandbox.stub(vscode, 'ThemeColor').returns(mockThemeColor);

      const decoration = (service as any).createHighlightDecoration();

      expect(vscode.window.createTextEditorDecorationType.calledWith(
        sinon.match({ backgroundColor: mockThemeColor, borderRadius: '3px' })
      )).to.be.true;
    });
  });

  describe('saveCodeLink', () => {
    it('should save a code link to workspace configuration', async () => {
      const link: CodeLink = {
        source: {
          uri: 'file:///path/to/file.ts',
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts'
        }
      };

      const configUpdate = sandbox.stub().resolves();
      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        update: configUpdate
      });

      await (service as any).saveCodeLink(link);

      expect(configUpdate.called).to.be.true;
      expect(configUpdate.firstCall.args[0]).to.equal('copilot-ppa.codeLinks');
      expect(configUpdate.firstCall.args[1]).to.be.an('object');
      expect(configUpdate.firstCall.args[2]).to.equal(vscode.ConfigurationTarget.Workspace);
    });

    it('should update configuration with the correct key format', async () => {
      const link: CodeLink = {
        source: {
          uri: 'file:///path/to/file.ts',
          position: {
            line: 10,
            character: 20
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts'
        }
      };

      const configUpdate = sandbox.stub().resolves();
      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        update: configUpdate
      });

      await (service as any).saveCodeLink(link);

      expect(configUpdate.firstCall.args[1]).to.have.property(`codeLink:${link.source.uri}:10:20`);
    });

    it('should handle errors during configuration update', async () => {
      const link: CodeLink = {
        source: {
          uri: 'file:///path/to/file.ts',
          position: {
            line: 5,
            character: 10
          },
          text: 'test'
        },
        target: {
          uri: 'file:///path/to/target.ts'
        }
      };

      const configUpdate = sandbox.stub().rejects(new Error('Update failed'));
      (vscode.workspace.getConfiguration as sinon.SinonStub).returns({
        update: configUpdate
      });

      try {
        await (service as any).saveCodeLink(link);
        expect.fail('Expected function to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Update failed');
      }
    });
  });

  describe('dispose', () => {
    it('should clean up resources', () => {
      const mockStatusBarItems = [
        { dispose: sandbox.stub() } as unknown as vscode.StatusBarItem,
        { dispose: sandbox.stub() } as unknown as vscode.StatusBarItem
      ];
      const mockDecorationTypes = [
        { dispose: sandbox.stub() } as unknown as vscode.TextEditorDecorationType,
        { dispose: sandbox.stub() } as unknown as vscode.TextEditorDecorationType
      ];

      (service as any).statusBarItems = mockStatusBarItems;
      (service as any).decorationTypes = mockDecorationTypes;

      service.dispose();

      mockStatusBarItems.forEach(item => {
        expect(item.dispose.called).to.be.true;
      });
      mockDecorationTypes.forEach(decoration => {
        expect(decoration.dispose.called).to.be.true;
      });
    });
  });
});
