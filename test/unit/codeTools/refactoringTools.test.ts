import { expect } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { RefactoringTools } from '../../../src/codeTools/refactoringTools';

describe('RefactoringTools - TypeScript', () => {
  let refactoringTools: RefactoringTools;
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;
  let mockWorkspace: any;
  let mockWindow: any;
  let mockDiffView: any;

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
        getText: sandbox.stub().returns('const test = 1 + 2;'),
        fileName: '/path/to/file.ts',
        languageId: 'typescript',
        save: sandbox.stub().resolves(true)
      }),
      saveAll: sandbox.stub().resolves(true),
      findFiles: sandbox.stub().resolves([
        vscode.Uri.file('/path/to/file1.ts'),
        vscode.Uri.file('/path/to/file2.ts')
      ]),
      applyEdit: sandbox.stub().resolves(true)
    };
    sandbox.stub(vscode, 'workspace').value(mockWorkspace);

    // Mock VS Code window
    mockWindow = {
      showInformationMessage: sandbox.stub().resolves(),
      showErrorMessage: sandbox.stub().resolves(),
      showWarningMessage: sandbox.stub().resolves(),
      showQuickPick: sandbox.stub().resolves(),
      showInputBox: sandbox.stub().resolves(),
      createWebviewPanel: sandbox.stub().returns({
        webview: {
          html: '',
          onDidReceiveMessage: sandbox.stub(),
          postMessage: sandbox.stub().resolves(true),
          asWebviewUri: sandbox.stub().returns(vscode.Uri.parse('https://example.com'))
        },
        onDidDispose: sandbox.stub(),
        reveal: sandbox.stub()
      }),
      showTextDocument: sandbox.stub().resolves(),
      activeTextEditor: {
        document: {
          getText: sandbox.stub().returns('const test = 1 + 2;'),
          fileName: '/path/to/file.ts',
          languageId: 'typescript'
        },
        selection: new vscode.Selection(0, 0, 0, 10),
        edit: sandbox.stub().resolves(true)
      }
    };
    sandbox.stub(vscode, 'window').value(mockWindow);

    // Mock VS Code diff view
    mockDiffView = {
      createDiffEditor: sandbox.stub().returns({
        title: 'Diff View',
        dispose: sandbox.stub()
      })
    };
    sandbox.stub(vscode.commands, 'executeCommand').resolves();

    // Create RefactoringTools instance
    refactoringTools = new RefactoringTools(mockContext);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('initialize', () => {
    it('should initialize refactoring tools with supported languages', async () => {
      // Stub the registerCommands method to verify it's called
      const registerCommandsStub = sandbox.stub(refactoringTools as any, 'registerCommands');

      await refactoringTools.initialize();

      expect(registerCommandsStub.calledOnce).to.be.true;
      expect(mockContext.subscriptions.length).to.be.greaterThan(0);
    });

    it('should handle errors during initialization', async () => {
      // Force an error during initialization
      const registerCommandsStub = sandbox.stub(refactoringTools as any, 'registerCommands').throws(new Error('Initialization error'));

      // Spy on console.error or a logger method if there's one
      const errorSpy = sandbox.spy(console, 'error');

      await refactoringTools.initialize();

      expect(errorSpy.calledWith(sinon.match(/Failed to initialize RefactoringTools/))).to.be.true;
    });
  });

  describe('registerCommands', () => {
    it('should register refactoring commands with VS Code', () => {
      // Create stub for vscode.commands.registerCommand
      const registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({
        dispose: sandbox.stub()
      } as any);

      // Call the private method using any type assertion
      (refactoringTools as any).registerCommands();

      // Verify commands were registered
      expect(registerCommandStub.called).to.be.true;
      expect(mockContext.subscriptions.length).to.be.greaterThan(0);
    });
  });

  describe('simplifyCode', () => {
    it('should simplify code in a file using AI suggestions', async () => {
      const filePath = '/path/to/file.ts';
      const originalCode = 'const sum = 1 + 2;';
      const simplifiedCode = 'const sum = 3;';

      // Mock document with original code
      mockWorkspace.openTextDocument.resolves({
        getText: sandbox.stub().returns(originalCode),
        fileName: filePath,
        languageId: 'typescript',
        save: sandbox.stub().resolves(true)
      });

      // Stub the AI simplification method
      sandbox.stub(refactoringTools as any, 'getSimplificationSuggestions').resolves([
        {
          originalCode: 'const sum = 1 + 2;',
          simplifiedCode: 'const sum = 3;',
          range: new vscode.Range(0, 0, 0, 16),
          explanation: 'Simplified constant expression'
        }
      ]);

      const suggestions = await refactoringTools.simplifyCode(filePath);

      expect(mockWorkspace.openTextDocument.calledWith(vscode.Uri.file(filePath))).to.be.true;
      expect(suggestions).to.be.an('array').with.lengthOf(1);
      expect(suggestions[0].originalCode).to.equal(originalCode);
      expect(suggestions[0].simplifiedCode).to.equal(simplifiedCode);
      expect(suggestions[0].explanation).to.equal('Simplified constant expression');
    });

    it('should handle errors when simplifying code', async () => {
      const filePath = '/path/to/file.ts';

      // Mock document opening failure
      mockWorkspace.openTextDocument.rejects(new Error('Failed to open document'));

      const errorSpy = sandbox.spy(console, 'error');

      const suggestions = await refactoringTools.simplifyCode(filePath);

      expect(suggestions).to.be.an('array').that.is.empty;
      expect(errorSpy.calledWith(sinon.match(/Error simplifying code in file/))).to.be.true;
    });

    it('should return empty array for unsupported file types', async () => {
      const filePath = '/path/to/file.css';

      // Mock document with unsupported language
      mockWorkspace.openTextDocument.resolves({
        getText: sandbox.stub().returns('body { color: red; }'),
        fileName: filePath,
        languageId: 'css',
        save: sandbox.stub().resolves(true)
      });

      const suggestions = await refactoringTools.simplifyCode(filePath);

      expect(suggestions).to.be.an('array').that.is.empty;
    });
  });

  describe('applySimplification', () => {
    it('should apply simplification suggestions to a file', async () => {
      const filePath = '/path/to/file.ts';
      const suggestions = [
        {
          originalCode: 'const sum = 1 + 2;',
          simplifiedCode: 'const sum = 3;',
          range: new vscode.Range(0, 0, 0, 16),
          explanation: 'Simplified constant expression'
        }
      ];

      // Mock document
      const mockDocument = {
        getText: sandbox.stub().returns('const sum = 1 + 2;'),
        fileName: filePath,
        languageId: 'typescript',
        save: sandbox.stub().resolves(true)
      };
      mockWorkspace.openTextDocument.resolves(mockDocument);

      // Mock edit builder
      const editBuilder = {
        replace: sandbox.stub()
      };

      // Mock edit creation
      const mockEdit = {
        edit: sandbox.stub().callsFake((callback: any) => {
          callback(editBuilder);
          return Promise.resolve(true);
        })
      };
      mockWindow.showTextDocument.resolves(mockEdit);

      const success = await refactoringTools.applySimplification(filePath, suggestions);

      expect(mockWorkspace.openTextDocument.calledWith(vscode.Uri.file(filePath))).to.be.true;
      expect(mockWindow.showTextDocument.calledOnce).to.be.true;
      expect(editBuilder.replace.calledWith(suggestions[0].range, suggestions[0].simplifiedCode)).to.be.true;
      expect(success).to.be.true;
    });

    it('should handle errors when applying simplifications', async () => {
      const filePath = '/path/to/file.ts';
      const suggestions = [
        {
          originalCode: 'const sum = 1 + 2;',
          simplifiedCode: 'const sum = 3;',
          range: new vscode.Range(0, 0, 0, 16),
          explanation: 'Simplified constant expression'
        }
      ];

      // Mock document opening failure
      mockWorkspace.openTextDocument.rejects(new Error('Failed to open document'));

      const errorSpy = sandbox.spy(console, 'error');

      const success = await refactoringTools.applySimplification(filePath, suggestions);

      expect(success).to.be.false;
      expect(errorSpy.calledWith(sinon.match(/Error applying simplifications to file/))).to.be.true;
    });
  });

  describe('showDiff', () => {
    it('should show diff between original and refactored code', async () => {
      const originalCode = 'const sum = 1 + 2;';
      const refactoredCode = 'const sum = 3;';
      const language = 'typescript';

      // Mock temporary file creation
      const tempUriOriginal = vscode.Uri.file('/path/to/temp/original.ts');
      const tempUriRefactored = vscode.Uri.file('/path/to/temp/refactored.ts');
      sandbox.stub(refactoringTools as any, 'createTempFile').resolves(tempUriOriginal);

      // Mock executeCommand for diff view
      const diffCommand = sandbox.stub(vscode.commands, 'executeCommand');

      await refactoringTools.showDiff(originalCode, refactoredCode, language);

      expect(diffCommand.calledWith('vscode.diff', tempUriOriginal, tempUriOriginal, 'Original vs. Refactored')).to.be.true;
      expect((refactoringTools as any).createTempFile.calledTwice).to.be.true;
    });

    it('should handle errors when showing diff', async () => {
      const originalCode = 'const sum = 1 + 2;';
      const refactoredCode = 'const sum = 3;';
      const language = 'typescript';

      // Mock temporary file creation error
      sandbox.stub(refactoringTools as any, 'createTempFile').rejects(new Error('Failed to create temp file'));

      const errorSpy = sandbox.spy(console, 'error');

      await refactoringTools.showDiff(originalCode, refactoredCode, language);

      expect(errorSpy.calledWith(sinon.match(/Error showing diff/))).to.be.true;
    });
  });

  describe('extractMethod', () => {
    it('should extract selected code into a new method', async () => {
      const filePath = '/path/to/file.ts';
      const selectedCode = 'const result = a + b;';
      const methodName = 'calculateSum';

      // Mock document with code
      const mockDocument = {
        getText: sandbox.stub().returns(`function test() {\n  ${selectedCode}\n  return result;\n}`),
        fileName: filePath,
        languageId: 'typescript',
        save: sandbox.stub().resolves(true),
        lineAt: sandbox.stub().returns({
          text: '  const result = a + b;',
          range: new vscode.Range(1, 0, 1, 20)
        }),
        positionAt: sandbox.stub().returns(new vscode.Position(1, 2))
      };
      mockWorkspace.openTextDocument.resolves(mockDocument);

      // Mock active editor
      const activeEditor = {
        document: mockDocument,
        selection: new vscode.Selection(1, 2, 1, 22),
        edit: sandbox.stub().resolves(true)
      };
      mockWindow.activeTextEditor = activeEditor;

      // Mock edit builder
      const editBuilder = {
        replace: sandbox.stub(),
        insert: sandbox.stub()
      };

      // Mock edit creation
      const mockEdit = {
        edit: sandbox.stub().callsFake((callback: any) => {
          callback(editBuilder);
          return Promise.resolve(true);
        })
      };
      mockWindow.showTextDocument.resolves(mockEdit);

      // Mock method name input
      mockWindow.showInputBox.resolves(methodName);

      const success = await refactoringTools.extractMethod(filePath);

      expect(mockWorkspace.openTextDocument.calledWith(vscode.Uri.file(filePath))).to.be.true;
      expect(mockWindow.showTextDocument.calledOnce).to.be.true;
      expect(mockWindow.showInputBox.calledOnce).to.be.true;
      expect(editBuilder.replace.calledOnce).to.be.true;
      expect(editBuilder.insert.calledOnce).to.be.true;
      expect(success).to.be.true;
    });

    it('should handle cancelled method name input', async () => {
      const filePath = '/path/to/file.ts';

      // Mock document
      mockWorkspace.openTextDocument.resolves({
        getText: sandbox.stub().returns('function test() {\n  const result = a + b;\n  return result;\n}'),
        fileName: filePath,
        languageId: 'typescript',
        save: sandbox.stub().resolves(true)
      });

      // Mock method name input (cancelled)
      mockWindow.showInputBox.resolves(undefined);

      const success = await refactoringTools.extractMethod(filePath);

      expect(mockWindow.showInputBox.calledOnce).to.be.true;
      expect(success).to.be.false;
    });

    it('should handle errors during method extraction', async () => {
      const filePath = '/path/to/file.ts';

      // Mock document opening failure
      mockWorkspace.openTextDocument.rejects(new Error('Failed to open document'));

      const errorSpy = sandbox.spy(console, 'error');

      const success = await refactoringTools.extractMethod(filePath);

      expect(success).to.be.false;
      expect(errorSpy.calledWith(sinon.match(/Error extracting method/))).to.be.true;
    });
  });

  describe('renameVariable', () => {
    it('should rename a variable throughout a file', async () => {
      const filePath = '/path/to/file.ts';
      const oldName = 'oldVar';
      const newName = 'newVar';

      // Mock document with code
      const mockDocument = {
        getText: sandbox.stub().returns(`const ${oldName} = 10;\nconsole.log(${oldName});`),
        fileName: filePath,
        languageId: 'typescript',
        save: sandbox.stub().resolves(true)
      };
      mockWorkspace.openTextDocument.resolves(mockDocument);

      // Mock references
      const mockReferences = [
        { uri: vscode.Uri.file(filePath), range: new vscode.Range(0, 6, 0, 12) },
        { uri: vscode.Uri.file(filePath), range: new vscode.Range(1, 12, 1, 18) }
      ];

      // Mock VS Code commands
      const executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand');
      executeCommandStub.withArgs('vscode.executeReferenceProvider', sinon.match.any, sinon.match.any).resolves(mockReferences);
      executeCommandStub.withArgs('vscode.executeDefinitionProvider', sinon.match.any, sinon.match.any).resolves([
        { uri: vscode.Uri.file(filePath), range: new vscode.Range(0, 6, 0, 12) }
      ]);

      // Mock variable name input
      mockWindow.showInputBox.resolves(newName);

      // Mock edit
      const workspaceEdit = new vscode.WorkspaceEdit();
      const spyWorkspaceEdit = sandbox.spy(workspaceEdit, 'replace');
      sandbox.stub(vscode, 'WorkspaceEdit').returns(workspaceEdit);

      const success = await refactoringTools.renameVariable(filePath, oldName);

      expect(mockWorkspace.openTextDocument.calledWith(vscode.Uri.file(filePath))).to.be.true;
      expect(mockWindow.showInputBox.calledOnce).to.be.true;
      expect(executeCommandStub.calledWith('vscode.executeReferenceProvider', sinon.match.any, sinon.match.any)).to.be.true;
      expect(spyWorkspaceEdit.calledTwice).to.be.true;
      expect(mockWorkspace.applyEdit.calledOnce).to.be.true;
      expect(success).to.be.true;
    });

    it('should handle cancelled variable name input', async () => {
      const filePath = '/path/to/file.ts';
      const oldName = 'oldVar';

      // Mock document
      mockWorkspace.openTextDocument.resolves({
        getText: sandbox.stub().returns(`const ${oldName} = 10;\nconsole.log(${oldName});`),
        fileName: filePath,
        languageId: 'typescript',
        save: sandbox.stub().resolves(true)
      });

      // Mock variable name input (cancelled)
      mockWindow.showInputBox.resolves(undefined);

      const success = await refactoringTools.renameVariable(filePath, oldName);

      expect(mockWindow.showInputBox.calledOnce).to.be.true;
      expect(success).to.be.false;
    });

    it('should handle errors during variable renaming', async () => {
      const filePath = '/path/to/file.ts';
      const oldName = 'oldVar';

      // Mock document opening failure
      mockWorkspace.openTextDocument.rejects(new Error('Failed to open document'));

      const errorSpy = sandbox.spy(console, 'error');

      const success = await refactoringTools.renameVariable(filePath, oldName);

      expect(success).to.be.false;
      expect(errorSpy.calledWith(sinon.match(/Error renaming variable/))).to.be.true;
    });
  });

  describe('inlineVariable', () => {
    it('should inline a variable throughout a file', async () => {
      const filePath = '/path/to/file.ts';
      const variableName = 'testVar';
      const variableValue = '42';

      // Mock document with code
      const mockDocument = {
        getText: sandbox.stub().returns(`const ${variableName} = ${variableValue};\nconsole.log(${variableName});`),
        fileName: filePath,
        languageId: 'typescript',
        save: sandbox.stub().resolves(true)
      };
      mockWorkspace.openTextDocument.resolves(mockDocument);

      // Mock VS Code commands for finding references
      const mockReferences = [
        { uri: vscode.Uri.file(filePath), range: new vscode.Range(0, 6, 0, 13) },
        { uri: vscode.Uri.file(filePath), range: new vscode.Range(1, 12, 1, 19) }
      ];
      const executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand');
      executeCommandStub.withArgs('vscode.executeReferenceProvider', sinon.match.any, sinon.match.any).resolves(mockReferences);

      // Mock parse AST to find variable value
      sandbox.stub(refactoringTools as any, 'getVariableValue').returns(variableValue);

      // Mock edit
      const workspaceEdit = new vscode.WorkspaceEdit();
      const spyWorkspaceEdit = sandbox.spy(workspaceEdit, 'replace');
      sandbox.stub(vscode, 'WorkspaceEdit').returns(workspaceEdit);

      const success = await refactoringTools.inlineVariable(filePath, variableName);

      expect(mockWorkspace.openTextDocument.calledWith(vscode.Uri.file(filePath))).to.be.true;
      expect(executeCommandStub.calledWith('vscode.executeReferenceProvider', sinon.match.any, sinon.match.any)).to.be.true;
      expect(spyWorkspaceEdit.called).to.be.true;
      expect(mockWorkspace.applyEdit.calledOnce).to.be.true;
      expect(success).to.be.true;
    });

    it('should handle variable not found scenario', async () => {
      const filePath = '/path/to/file.ts';
      const variableName = 'nonExistentVar';

      // Mock document
      mockWorkspace.openTextDocument.resolves({
        getText: sandbox.stub().returns('const otherVar = 10;'),
        fileName: filePath,
        languageId: 'typescript',
        save: sandbox.stub().resolves(true)
      });

      // Mock no references found
      sandbox.stub(vscode.commands, 'executeCommand').withArgs('vscode.executeReferenceProvider', sinon.match.any, sinon.match.any).resolves([]);

      const success = await refactoringTools.inlineVariable(filePath, variableName);

      expect(mockWindow.showWarningMessage.calledWith(`Variable ${variableName} not found in the file.`)).to.be.true;
      expect(success).to.be.false;
    });

    it('should handle errors during variable inlining', async () => {
      const filePath = '/path/to/file.ts';
      const variableName = 'testVar';

      // Mock document opening failure
      mockWorkspace.openTextDocument.rejects(new Error('Failed to open document'));

      const errorSpy = sandbox.spy(console, 'error');

      const success = await refactoringTools.inlineVariable(filePath, variableName);

      expect(success).to.be.false;
      expect(errorSpy.calledWith(sinon.match(/Error inlining variable/))).to.be.true;
    });
  });

  describe('detectCodeSmells', () => {
    it('should detect common code smells in a file', async () => {
      const filePath = '/path/to/file.ts';

      // Mock document with code that has code smells
      const mockCode = `
        // Long method code smell
        function longMethod() {
          let i = 0;
          // Lots of comments to simulate a long method
          // ...
          // More code
          // ...
          return i;
        }

        // Duplicate code smell
        function duplicate1() {
          console.log("This is duplicated");
          console.log("This is duplicated");
        }

        // Large class code smell
        class LargeClass {
          prop1: string;
          prop2: string;
          prop3: string;
          prop4: string;
          prop5: string;
          // Many more properties...

          method1() {}
          method2() {}
          method3() {}
          // Many more methods...
        }
      `;

      const mockDocument = {
        getText: sandbox.stub().returns(mockCode),
        fileName: filePath,
        languageId: 'typescript',
        save: sandbox.stub().resolves(true)
      };
      mockWorkspace.openTextDocument.resolves(mockDocument);

      // Stub the code smell detection methods
      sandbox.stub(refactoringTools as any, 'detectLongMethods').returns([
        { type: 'Long Method', location: { start: { line: 2 } }, message: 'Method is too long' }
      ]);

      sandbox.stub(refactoringTools as any, 'detectDuplicateCode').returns([
        { type: 'Duplicate Code', location: { start: { line: 12 } }, message: 'Duplicate code detected' }
      ]);

      sandbox.stub(refactoringTools as any, 'detectLargeClasses').returns([
        { type: 'Large Class', location: { start: { line: 18 } }, message: 'Class has too many members' }
      ]);

      const codeSmells = await refactoringTools.detectCodeSmells(filePath);

      expect(mockWorkspace.openTextDocument.calledWith(vscode.Uri.file(filePath))).to.be.true;
      expect(codeSmells).to.be.an('array').with.lengthOf(3);
      expect(codeSmells[0].type).to.equal('Long Method');
      expect(codeSmells[1].type).to.equal('Duplicate Code');
      expect(codeSmells[2].type).to.equal('Large Class');
    });

    it('should handle errors during code smell detection', async () => {
      const filePath = '/path/to/file.ts';

      // Mock document opening failure
      mockWorkspace.openTextDocument.rejects(new Error('Failed to open document'));

      const errorSpy = sandbox.spy(console, 'error');

      const codeSmells = await refactoringTools.detectCodeSmells(filePath);

      expect(codeSmells).to.be.an('array').that.is.empty;
      expect(errorSpy.calledWith(sinon.match(/Error detecting code smells/))).to.be.true;
    });
  });

  describe('createTempFile', () => {
    it('should create a temporary file with the provided content', async () => {
      const content = 'const test = 42;';
      const extension = '.ts';

      // Mock creation of temp directory
      const mockMkdir = sandbox.stub(vscode.workspace.fs, 'createDirectory').resolves();

      // Mock writing to file
      const mockWriteFile = sandbox.stub(vscode.workspace.fs, 'writeFile').resolves();

      // Call the private method using any type assertion
      const uri = await (refactoringTools as any).createTempFile(content, extension);

      expect(mockMkdir.calledOnce).to.be.true;
      expect(mockWriteFile.calledOnce).to.be.true;
      expect(uri).to.be.instanceOf(vscode.Uri);
      expect(uri.fsPath.endsWith(extension)).to.be.true;
    });

    it('should handle errors during temp file creation', async () => {
      const content = 'const test = 42;';
      const extension = '.ts';

      // Mock directory creation error
      sandbox.stub(vscode.workspace.fs, 'createDirectory').rejects(new Error('Failed to create directory'));

      await expect((refactoringTools as any).createTempFile(content, extension))
        .to.eventually.be.rejectedWith(/Error creating temporary file/);
    });
  });

  describe('dispose', () => {
    it('should dispose all disposable resources', () => {
      // Set up mock disposables
      const mockDisposable1 = { dispose: sandbox.stub() };
      const mockDisposable2 = { dispose: sandbox.stub() };

      (refactoringTools as any).disposables = [mockDisposable1, mockDisposable2];

      refactoringTools.dispose();

      expect(mockDisposable1.dispose.calledOnce).to.be.true;
      expect(mockDisposable2.dispose.calledOnce).to.be.true;
      expect((refactoringTools as any).disposables.length).to.equal(0);
    });

    it('should also clean up temp directory if it exists', async () => {
      // Set up mock tempDir
      (refactoringTools as any).tempDir = vscode.Uri.file('/path/to/temp');

      // Mock file system delete
      const mockDelete = sandbox.stub(vscode.workspace.fs, 'delete').resolves();

      await refactoringTools.dispose();

      expect(mockDelete.calledWith((refactoringTools as any).tempDir, { recursive: true })).to.be.true;
    });
  });

  describe('getSimplificationSuggestions', () => {
    it('should generate code simplification suggestions', async () => {
      const code = 'const sum = 1 + 2;';
      const language = 'typescript';

      // Mock LLM API response
      const mockLLMResponse = [
        {
          originalCode: 'const sum = 1 + 2;',
          simplifiedCode: 'const sum = 3;',
          explanation: 'Simplified constant expression'
        }
      ];

      // Stub the LLM service
      sandbox.stub(refactoringTools as any, 'callLLM').resolves(mockLLMResponse);

      const suggestions = await (refactoringTools as any).getSimplificationSuggestions(code, language);

      expect(suggestions).to.be.an('array').with.lengthOf(1);
      expect(suggestions[0].originalCode).to.equal('const sum = 1 + 2;');
      expect(suggestions[0].simplifiedCode).to.equal('const sum = 3;');
      expect(suggestions[0].explanation).to.equal('Simplified constant expression');
    });

    it('should handle LLM service errors', async () => {
      const code = 'const sum = 1 + 2;';
      const language = 'typescript';

      // Stub the LLM service to throw an error
      sandbox.stub(refactoringTools as any, 'callLLM').rejects(new Error('LLM service error'));

      const suggestions = await (refactoringTools as any).getSimplificationSuggestions(code, language);

      expect(suggestions).to.be.an('array').that.is.empty;
    });
  });

  describe('callLLM', () => {
    it('should call the LLM service with appropriate prompt', async () => {
      const prompt = 'Simplify this code: const sum = 1 + 2;';
      const mockResponse = { content: 'const sum = 3;' };

      // Mock VS Code API call to LLM
      sandbox.stub(vscode.commands, 'executeCommand').withArgs('copilot-ppa.callLLM', prompt).resolves(mockResponse);

      const response = await (refactoringTools as any).callLLM(prompt);

      expect(vscode.commands.executeCommand.calledWith('copilot-ppa.callLLM', prompt)).to.be.true;
      expect(response).to.deep.equal(mockResponse);
    });

    it('should handle errors from LLM service', async () => {
      const prompt = 'Simplify this code: const sum = 1 + 2;';

      // Mock VS Code API call to LLM that fails
      sandbox.stub(vscode.commands, 'executeCommand').withArgs('copilot-ppa.callLLM', prompt).rejects(new Error('LLM service error'));

      await expect((refactoringTools as any).callLLM(prompt))
        .to.eventually.be.rejectedWith(/Error calling LLM service/);
    });
  });
});
