// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\runtime-analyzer-commands.js.test.js
const { afterEach, beforeEach, describe, expect, it } = require('@jest/globals');
const sinon = require('sinon');
const vscode = require('vscode');
const { runtimeAnalyzer } = require('../../runtime-analyzer');
const { registerRuntimeAnalyzerCommands } = require('../runtime-analyzer-commands');

describe('Runtime Analyzer Commands', () => {
    let sandbox;
    let mockContext;
    let mockCommands;
    let mockWindow;
    let mockUri;
    let mockTextEditor;
    let mockInputBox;
    let mockInfoMessage;
    let mockErrorMessage;
    let mockShowSaveDialog;
    let mockRuntimeAnalyzer;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock VS Code extension context
        mockContext = {
            subscriptions: []
        };

        // Mock VS Code window APIs
        mockInputBox = sandbox.stub();
        mockInfoMessage = sandbox.stub();
        mockErrorMessage = sandbox.stub();
        mockShowSaveDialog = sandbox.stub();

        // Mock Uri
        mockUri = {
            fsPath: '/path/to/file.json'
        };

        // Mock text editor
        mockTextEditor = {
            selection: {
                isEmpty: false,
                start: { line: 1 }
            },
            document: {
                getText: sandbox.stub().returns('const x = 10;'),
                lineAt: sandbox.stub().returns({
                    text: '    const x = 10;'
                })
            },
            edit: sandbox.stub().resolves(true)
        };

        mockWindow = {
            showInputBox: mockInputBox,
            showInformationMessage: mockInfoMessage,
            showErrorMessage: mockErrorMessage,
            showSaveDialog: mockShowSaveDialog,
            activeTextEditor: mockTextEditor,
            createOutputChannel: sandbox.stub().returns({
                appendLine: sandbox.stub(),
                show: sandbox.stub()
            })
        };

        // Mock VS Code commands
        mockCommands = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
        };

        // Replace VS Code namespaces with mocks
        sandbox.stub(vscode, 'window').value(mockWindow);
        sandbox.stub(vscode, 'commands').value(mockCommands);
        sandbox.stub(vscode.Uri, 'file').returns(mockUri);

        // Mock Runtime Analyzer
        mockRuntimeAnalyzer = {
            startRecording: sandbox.stub(),
            stopRecording: sandbox.stub(),
            exportResults: sandbox.stub(),
            visualizeResults: sandbox.stub(),
            markStart: sandbox.stub(),
            markEnd: sandbox.stub()
        };

        // Replace runtime analyzer with mock
        sandbox.stub(runtimeAnalyzer).value(mockRuntimeAnalyzer);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerRuntimeAnalyzerCommands', () => {
        it('should register all runtime analyzer commands', () => {
            registerRuntimeAnalyzerCommands(mockContext);

            // Verify commands are registered
            expect(mockCommands.registerCommand.callCount).toBe(5);
            expect(mockCommands.registerCommand.args[0][0]).toBe('localLLMAgent.runtimeAnalyzer.startRecording');
            expect(mockCommands.registerCommand.args[1][0]).toBe('localLLMAgent.runtimeAnalyzer.stopRecording');
            expect(mockCommands.registerCommand.args[2][0]).toBe('localLLMAgent.runtimeAnalyzer.exportResults');
            expect(mockCommands.registerCommand.args[3][0]).toBe('localLLMAgent.runtimeAnalyzer.visualize');
            expect(mockCommands.registerCommand.args[4][0]).toBe('localLLMAgent.runtimeAnalyzer.addMarkers');

            // Verify context subscriptions are updated
            expect(mockContext.subscriptions.length).toBe(5);
        });
    });

    describe('startRecording command', () => {
        beforeEach(() => {
            registerRuntimeAnalyzerCommands(mockContext);
        });

        it('should start runtime recording', () => {
            // Get the command callback
            const startRecordingCallback = mockCommands.registerCommand.args[0][1];

            // Call the command
            startRecordingCallback();

            // Verify runtime analyzer was called
            expect(mockRuntimeAnalyzer.startRecording).toHaveBeenCalled();

            // Verify user notification
            expect(mockInfoMessage).toHaveBeenCalledWith('Runtime analysis recording started');
        });
    });

    describe('stopRecording command', () => {
        beforeEach(() => {
            registerRuntimeAnalyzerCommands(mockContext);
        });

        it('should stop runtime recording', () => {
            // Get the command callback
            const stopRecordingCallback = mockCommands.registerCommand.args[1][1];

            // Call the command
            stopRecordingCallback();

            // Verify runtime analyzer was called
            expect(mockRuntimeAnalyzer.stopRecording).toHaveBeenCalled();

            // Verify user notification
            expect(mockInfoMessage).toHaveBeenCalledWith('Runtime analysis recording stopped');
        });
    });

    describe('exportResults command', () => {
        beforeEach(() => {
            registerRuntimeAnalyzerCommands(mockContext);
        });

        it('should export results when URI is selected', async () => {
            // Setup mock save dialog to return a URI
            mockShowSaveDialog.resolves(mockUri);

            // Get the command callback
            const exportResultsCallback = mockCommands.registerCommand.args[2][1];

            // Call the command
            await exportResultsCallback();

            // Verify save dialog was shown with correct options
            expect(mockShowSaveDialog).toHaveBeenCalledWith({
                defaultUri: mockUri,
                filters: {
                    'JSON files': ['json'],
                    'All files': ['*']
                }
            });

            // Verify runtime analyzer was called with the URI
            expect(mockRuntimeAnalyzer.exportResults).toHaveBeenCalledWith(mockUri.fsPath);
        });

        it('should not export results when no URI is selected', async () => {
            // Setup mock save dialog to return undefined (cancelled)
            mockShowSaveDialog.resolves(undefined);

            // Get the command callback
            const exportResultsCallback = mockCommands.registerCommand.args[2][1];

            // Call the command
            await exportResultsCallback();

            // Verify save dialog was shown
            expect(mockShowSaveDialog).toHaveBeenCalled();

            // Verify runtime analyzer was NOT called
            expect(mockRuntimeAnalyzer.exportResults).not.toHaveBeenCalled();
        });
    });

    describe('visualize command', () => {
        beforeEach(() => {
            registerRuntimeAnalyzerCommands(mockContext);
        });

        it('should visualize results', () => {
            // Get the command callback
            const visualizeCallback = mockCommands.registerCommand.args[3][1];

            // Call the command
            visualizeCallback();

            // Verify runtime analyzer was called
            expect(mockRuntimeAnalyzer.visualizeResults).toHaveBeenCalled();
        });
    });

    describe('addMarkers command', () => {
        beforeEach(() => {
            registerRuntimeAnalyzerCommands(mockContext);
        });

        it('should show error when no active editor', async () => {
            // Remove active editor
            mockWindow.activeTextEditor = undefined;

            // Get the command callback
            const addMarkersCallback = mockCommands.registerCommand.args[4][1];

            // Call the command
            await addMarkersCallback();

            // Verify error message was shown
            expect(mockErrorMessage).toHaveBeenCalledWith('No active editor');
        });

        it('should show error when selection is empty', async () => {
            // Set empty selection
            mockTextEditor.selection.isEmpty = true;

            // Get the command callback
            const addMarkersCallback = mockCommands.registerCommand.args[4][1];

            // Call the command
            await addMarkersCallback();

            // Verify error message was shown
            expect(mockErrorMessage).toHaveBeenCalledWith('No code selected');
        });

        it('should do nothing when input is cancelled', async () => {
            // Set input box to return undefined
            mockInputBox.resolves(undefined);

            // Get the command callback
            const addMarkersCallback = mockCommands.registerCommand.args[4][1];

            // Call the command
            await addMarkersCallback();

            // Verify input box was shown
            expect(mockInputBox).toHaveBeenCalled();

            // Verify editor was not modified
            expect(mockTextEditor.edit).not.toHaveBeenCalled();
        });

        it('should add performance markers to selected code', async () => {
            // Set up mock input box to return a marker ID
            mockInputBox.resolves('testMarker');

            // Get the command callback
            const addMarkersCallback = mockCommands.registerCommand.args[4][1];

            // Call the command
            await addMarkersCallback();

            // Verify input box was shown with correct options
            expect(mockInputBox).toHaveBeenCalledWith({
                prompt: 'Enter a marker ID for this code section',
                placeHolder: 'e.g., functionName, processData, etc.'
            });

            // Verify editor was modified with correct content
            expect(mockTextEditor.edit).toHaveBeenCalled();
            const editCallback = mockTextEditor.edit.getCall(0).args[0];

            // Create a mock edit builder to test the callback
            const mockEditBuilder = {
                replace: sandbox.stub()
            };

            // Call the edit callback
            editCallback(mockEditBuilder);

            // Get indentation from the selection
            const expectedIndentation = '    ';

            // Verify the correct text was used for replacement
            const expectedText =
`${expectedIndentation}// START performance marker: testMarker
${expectedIndentation}runtimeAnalyzer.markStart('testMarker');
const x = 10;
${expectedIndentation}runtimeAnalyzer.markEnd('testMarker');
${expectedIndentation}// END performance marker: testMarker`;

            // Verify replace was called with correct parameters
            expect(mockEditBuilder.replace).toHaveBeenCalledWith(
                mockTextEditor.selection,
                expectedText
            );

            // Verify success message was shown
            expect(mockInfoMessage).toHaveBeenCalledWith('Runtime analyzer markers added for "testMarker"');
        });
    });
});
