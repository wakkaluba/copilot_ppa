import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceManager } from '../../services/WorkspaceManager';
import { TestLogger } from '../helpers/TestLogger';

describe('WorkspaceManager Tests', () => {
    let workspaceManager: WorkspaceManager;
    let sandbox: sinon.SinonSandbox;
    let fsStub: sinon.SinonStubbedInstance<typeof vscode.workspace.fs>;
    let workspaceFoldersStub: sinon.SinonStub;
    let commandsStub: sinon.SinonStub;
    let workspaceStub: sinon.SinonStub;
    let logger: TestLogger;

    setup(() => {
        logger = new TestLogger();
        sandbox = sinon.createSandbox();
        
        // Reset the singleton instance
        (WorkspaceManager as any).instance = undefined;

        // Create comprehensive stubs
        setupVSCodeStubs();
        
        // Initialize fresh instance
        workspaceManager = WorkspaceManager.getInstance(logger);
    });

    teardown(() => {
        sandbox.restore();
    });

    function setupVSCodeStubs() {
        // Setup filesystem stubs with comprehensive error handling
        fsStub = {
            readFile: sandbox.stub().resolves(Buffer.from('')),
            writeFile: sandbox.stub().resolves(),
            delete: sandbox.stub().resolves(),
            createDirectory: sandbox.stub().resolves(),
            readDirectory: sandbox.stub().resolves([]),
            stat: sandbox.stub().resolves({} as vscode.FileStat),
            copy: sandbox.stub().resolves(),
            rename: sandbox.stub().resolves(),
            isWritableFileSystem: sandbox.stub().returns(true)
        };
        sandbox.stub(vscode.workspace, 'fs').value(fsStub);
        
        // Setup workspace stubs
        workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([{
            uri: vscode.Uri.file('d:\\test\\workspace'),
            name: 'workspace',
            index: 0
        }]);
        
        // Setup command stubs
        commandsStub = sandbox.stub(vscode.commands, 'executeCommand').resolves();
        
        // Setup workspace stubs with proper error handling
        workspaceStub = sandbox.stub(vscode.workspace, 'openTextDocument')
            .resolves({
                languageId: 'plaintext',
                save: sandbox.stub().resolves(true)
            } as any);
        sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().callsFake((key, defaultValue) => defaultValue)
        } as any);
        
        // Setup window stubs
        sandbox.stub(vscode.window, 'showTextDocument').resolves({} as any);
    }

    // Organized test describes by functionality
    describe('Instance Management', () => {
        it('getInstance should return singleton instance', () => {
            const instance1 = WorkspaceManager.getInstance();
            const instance2 = WorkspaceManager.getInstance();
            assert.strictEqual(instance1, instance2);
        });
    });

    describe('File Operations', () => {
        it('readFile should read a file and return its content', async () => {
            const fileContent = 'file content';
            fsStub.readFile.resolves(Buffer.from(fileContent));
            
            const content = await workspaceManager.readFile('test.txt');
            
            assert.strictEqual(content, fileContent);
            assert.strictEqual(fsStub.readFile.calledOnce, true);
            
            // Verify correct URI was passed
            const uri = fsStub.readFile.firstCall.args[0];
            assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'test.txt'));
        });

        it('readFile should handle absolute paths', async () => {
            const fileContent = 'file content';
            fsStub.readFile.resolves(Buffer.from(fileContent));
            
            const absolutePath = 'd:\\some\\absolute\\path\\test.txt';
            const content = await workspaceManager.readFile(absolutePath);
            
            assert.strictEqual(content, fileContent);
            
            // Verify correct URI was passed
            const uri = fsStub.readFile.firstCall.args[0];
            assert.strictEqual(uri.fsPath, absolutePath);
        });

        it('readFile should handle UTF-8 encoding properly', async () => {
            const nonAsciiContent = 'Hello, 世界!';
            fsStub.readFile.resolves(Buffer.from(nonAsciiContent));
            
            const content = await workspaceManager.readFile('test.txt');
            
            assert.strictEqual(content, nonAsciiContent);
        });

        it('readFile should throw error when file read fails', async () => {
            fsStub.readFile.rejects(new Error('Read error'));
            
            await assert.rejects(
                () => workspaceManager.readFile('test.txt'),
                /Failed to read file: Error: Read error/
            );
        });

        it('writeFile should write content to a file', async () => {
            fsStub.writeFile.resolves();
            fsStub.stat.resolves({} as vscode.FileStat);
            
            // Mock document and formatting
            const mockDocument = {
                languageId: 'plaintext',
                save: sandbox.stub().resolves(true)
            };
            workspaceStub.resolves(mockDocument as any);
            commandsStub.resolves([]);
            
            await workspaceManager.writeFile('test.txt', 'file content');
            
            assert.strictEqual(fsStub.writeFile.calledOnce, true);
            
            // Verify correct URI and content were passed
            const [uri, content] = fsStub.writeFile.firstCall.args;
            assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'test.txt'));
            assert.deepStrictEqual(content, Buffer.from('file content'));
        });

        it('writeFile should create parent directory if it does not exist', async () => {
            fsStub.writeFile.resolves();
            fsStub.stat.onFirstCall().rejects(new Error('Directory not found'));
            fsStub.createDirectory.resolves();
            
            // Mock document and formatting
            const mockDocument = {
                languageId: 'plaintext',
                save: sandbox.stub().resolves(true)
            };
            workspaceStub.resolves(mockDocument as any);
            commandsStub.resolves([]);
            
            await workspaceManager.writeFile('subdir/test.txt', 'file content');
            
            assert.strictEqual(fsStub.createDirectory.calledOnce, true);
            assert.strictEqual(fsStub.writeFile.calledOnce, true);
            
            // Verify directory was created
            const dirUri = fsStub.createDirectory.firstCall.args[0];
            assert.strictEqual(path.basename(dirUri.fsPath), 'subdir');
        });

        it('deleteFile should delete a file', async () => {
            fsStub.delete.resolves();
            
            await workspaceManager.deleteFile('test.txt');
            
            assert.strictEqual(fsStub.delete.calledOnce, true);
            
            // Verify correct URI and options were passed
            const [uri, options] = fsStub.delete.firstCall.args;
            assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'test.txt'));
            assert.deepStrictEqual(options, { recursive: false });
        });
    });

    describe('Directory Operations', () => {
        it('createDirectory should create a directory', async () => {
            fsStub.createDirectory.resolves();
            
            await workspaceManager.createDirectory('testdir');
            
            assert.strictEqual(fsStub.createDirectory.calledOnce, true);
            
            // Verify correct URI was passed
            const uri = fsStub.createDirectory.firstCall.args[0];
            assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'testdir'));
        });

        it('listFiles should return files in a directory', async () => {
            fsStub.readDirectory.resolves([
                ['file1.txt', vscode.FileType.File],
                ['file2.txt', vscode.FileType.File],
                ['subdir', vscode.FileType.Directory]
            ]);
            
            const files = await workspaceManager.listFiles('testdir');
            
            assert.strictEqual(fsStub.readDirectory.calledOnce, true);
            assert.deepStrictEqual(files, [
                path.join('testdir', 'file1.txt'),
                path.join('testdir', 'file2.txt'),
                path.join('testdir', 'subdir')
            ]);
        });

        it('listFiles should handle empty directories', async () => {
            fsStub.readDirectory.resolves([]);
            
            const files = await workspaceManager.listFiles('emptydir');
            
            assert.deepStrictEqual(files, []);
        });
    });

    describe('Todo Operations', () => {
        it('parseTodoFile should parse content into lines', async () => {
            const fileContent = 'Line 1\nLine 2\n\nLine 3';
            fsStub.readFile.resolves(Buffer.from(fileContent));
            
            const lines = await workspaceManager.parseTodoFile('todo.md');
            
            assert.deepStrictEqual(lines, ['Line 1', 'Line 2', 'Line 3']);
        });

        it('updateTodoFile should write lines to file', async () => {
            fsStub.writeFile.resolves();
            fsStub.stat.resolves({} as vscode.FileStat);
            
            // Mock document and formatting
            const mockDocument = {
                languageId: 'markdown',
                save: sandbox.stub().resolves(true)
            };
            workspaceStub.resolves(mockDocument as any);
            commandsStub.resolves([]);
            
            const lines = ['Line 1', 'Line 2', 'Line 3'];
            await workspaceManager.updateTodoFile('todo.md', lines);
            
            assert.strictEqual(fsStub.writeFile.calledOnce, true);
            
            // Verify correct content was written
            const content = fsStub.writeFile.firstCall.args[1];
            assert.deepStrictEqual(Buffer.from(content).toString(), 'Line 1\nLine 2\nLine 3');
        });

        it('moveCompletedTasks should move completed tasks to target file', async () => {
            // Setup mock data
            const sourceTodo = [
                '- [ ] Task 1 (0%)',
                '- [X] Task 2 (100%)',
                '- [/] Task 3 (50%)',
                '- [X] Task 4 (100%)'
            ].join('\n');
            
            const targetTodo = [
                '- [X] Old Task (100%) [completed: 2023-01-01]'
            ].join('\n');
            
            // Mock file operations
            fsStub.readFile.onFirstCall().resolves(Buffer.from(sourceTodo));
            fsStub.readFile.onSecondCall().resolves(Buffer.from(targetTodo));
            fsStub.stat.resolves({} as vscode.FileStat);
            fsStub.writeFile.resolves();
            
            // Mock document and formatting
            const mockDocument = {
                languageId: 'markdown',
                save: sandbox.stub().resolves(true)
            };
            workspaceStub.resolves(mockDocument as any);
            commandsStub.resolves([]);
            
            // Run the method
            await workspaceManager.moveCompletedTasks('source.md', 'target.md');
            
            // Verify source file was updated correctly
            const sourceContent = fsStub.writeFile.firstCall.args[1];
            assert.ok(Buffer.from(sourceContent).toString().includes('Task 1'));
            assert.ok(Buffer.from(sourceContent).toString().includes('Task 3'));
            assert.ok(!Buffer.from(sourceContent).toString().includes('Task 2'));
            assert.ok(!Buffer.from(sourceContent).toString().includes('Task 4'));
            
            // Verify target file was updated correctly
            const targetContent = fsStub.writeFile.secondCall.args[1];
            assert.ok(Buffer.from(targetContent).toString().includes('Old Task'));
            assert.ok(Buffer.from(targetContent).toString().includes('Task 2'));
            assert.ok(Buffer.from(targetContent).toString().includes('Task 4'));
            assert.ok(Buffer.from(targetContent).toString().includes('[completed:'));
        });

        it('updateTaskStatus should add status markers to tasks', async () => {
            // Setup mock data
            const todo = [
                '- Task without status',
                '- [ ] Task with status but no percentage',
                '- [X] Task with status and percentage (100%)',
                'Not a task line'
            ].join('\n');
            
            // Mock file operations
            fsStub.readFile.resolves(Buffer.from(todo));
            fsStub.stat.resolves({} as vscode.FileStat);
            fsStub.writeFile.resolves();
            
            // Mock document and formatting
            const mockDocument = {
                languageId: 'markdown',
                save: sandbox.stub().resolves(true)
            };
            workspaceStub.resolves(mockDocument as any);
            commandsStub.resolves([]);
            
            // Run the method
            await workspaceManager.updateTaskStatus('todo.md');
            
            // Verify file was updated correctly
            const content = fsStub.writeFile.firstCall.args[1];
            const updatedTodo = Buffer.from(content).toString();
            
            assert.ok(updatedTodo.includes('- [ ] Task without status'));
            assert.ok(updatedTodo.includes('- [ ] Task with status but no percentage (0%)'));
            assert.ok(updatedTodo.includes('- [X] Task with status and percentage (100%)'));
            assert.ok(updatedTodo.includes('Not a task line'));
        });
    });

    describe('Error Handling', () => {
        it('readFile should handle read errors gracefully', async () => {
            fsStub.readFile.rejects(new Error('Read error'));
            
            await assert.rejects(
                () => workspaceManager.readFile('test.txt'),
                /Failed to read file: Error: Read error/
            );
        });

        it('writeFile should handle write errors gracefully', async () => {
            fsStub.writeFile.rejects(new Error('Write error'));
            
            await assert.rejects(
                () => workspaceManager.writeFile('test.txt', 'content'),
                /Failed to write file: Error: Write error/
            );
        });

        it('resolveFilePath should handle missing workspace gracefully', async () => {
            workspaceFoldersStub.value(undefined);
            
            assert.throws(
                () => (workspaceManager as any).resolveFilePath('test.txt'),
                /No workspace folder found/
            );
        });

        // Add new error cases
        it('formatDocument should handle formatting errors gracefully', async () => {
            commandsStub.rejects(new Error('Format error'));
            const mockDocument = {
                languageId: 'plaintext',
                save: sandbox.stub().resolves(true)
            };
            workspaceStub.resolves(mockDocument as any);
            
            // Should not throw, just log warning
            await workspaceManager.formatDocumentAtPath('test.txt');
            
            assert.ok(logger.warnings.some(w => w.includes('Format error')));
        });
    });

    describe('Cleanup', () => {
        it('should properly clean up resources', () => {
            // Add cleanup test logic if needed
        });
    });
});
