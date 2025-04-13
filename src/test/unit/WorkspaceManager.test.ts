import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceManager } from '../../services/WorkspaceManager';

suite('WorkspaceManager Tests', () => {
    let workspaceManager: WorkspaceManager;
    let sandbox: sinon.SinonSandbox;
    let fsStub: sinon.SinonStubbedInstance<typeof vscode.workspace.fs>;
    let workspaceFoldersStub: sinon.SinonStub;
    let commandsStub: sinon.SinonStub;
    let workspaceStub: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Reset the singleton instance to ensure tests are isolated
        (WorkspaceManager as any).instance = undefined;
        
        // Stub vscode.workspace.fs methods
        fsStub = {
            readFile: sandbox.stub(),
            writeFile: sandbox.stub(),
            delete: sandbox.stub(),
            createDirectory: sandbox.stub(),
            readDirectory: sandbox.stub(),
            stat: sandbox.stub(),
            copy: sandbox.stub(),
            rename: sandbox.stub(),
            isWritableFileSystem: sandbox.stub() as unknown as ((scheme: string) => boolean | undefined) & sinon.SinonStub<[scheme: string], boolean | undefined>
        };
        
        sandbox.stub(vscode.workspace, 'fs').value(fsStub);
        
        // Stub workspace folders
        workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders').value([
            {
                uri: vscode.Uri.file('d:\\test\\workspace'),
                name: 'workspace',
                index: 0
            }
        ]);
        
        // Stub commands
        commandsStub = sandbox.stub(vscode.commands, 'executeCommand');
        
        // Stub workspace
        workspaceStub = sandbox.stub(vscode.workspace, 'openTextDocument');
        sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().callsFake((key: string, defaultValue: any) => defaultValue)
        } as any);
        
        // Stub window
        sandbox.stub(vscode.window, 'showTextDocument').resolves({} as any);
        
        // Create a fresh instance of WorkspaceManager for each test
        workspaceManager = WorkspaceManager.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return singleton instance', () => {
        const instance1 = WorkspaceManager.getInstance();
        const instance2 = WorkspaceManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('readFile should read a file and return its content', async () => {
        const fileContent = 'file content';
        fsStub.readFile.resolves(Buffer.from(fileContent));
        
        const content = await workspaceManager.readFile('test.txt');
        
        assert.strictEqual(content, fileContent);
        assert.strictEqual(fsStub.readFile.calledOnce, true);
        
        // Verify correct URI was passed
        const uri = fsStub.readFile.firstCall.args[0];
        assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'test.txt'));
    });

    test('readFile should handle absolute paths', async () => {
        const fileContent = 'file content';
        fsStub.readFile.resolves(Buffer.from(fileContent));
        
        const absolutePath = 'd:\\some\\absolute\\path\\test.txt';
        const content = await workspaceManager.readFile(absolutePath);
        
        assert.strictEqual(content, fileContent);
        
        // Verify correct URI was passed
        const uri = fsStub.readFile.firstCall.args[0];
        assert.strictEqual(uri.fsPath, absolutePath);
    });

    test('readFile should throw error when file read fails', async () => {
        fsStub.readFile.rejects(new Error('Read error'));
        
        await assert.rejects(
            () => workspaceManager.readFile('test.txt'),
            /Failed to read file: Error: Read error/
        );
    });

    test('writeFile should write content to a file', async () => {
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

    test('writeFile should create parent directory if it does not exist', async () => {
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

    test('deleteFile should delete a file', async () => {
        fsStub.delete.resolves();
        
        await workspaceManager.deleteFile('test.txt');
        
        assert.strictEqual(fsStub.delete.calledOnce, true);
        
        // Verify correct URI and options were passed
        const [uri, options] = fsStub.delete.firstCall.args;
        assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'test.txt'));
        assert.deepStrictEqual(options, { recursive: false });
    });

    test('createDirectory should create a directory', async () => {
        fsStub.createDirectory.resolves();
        
        await workspaceManager.createDirectory('testdir');
        
        assert.strictEqual(fsStub.createDirectory.calledOnce, true);
        
        // Verify correct URI was passed
        const uri = fsStub.createDirectory.firstCall.args[0];
        assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'testdir'));
    });

    test('listFiles should return files in a directory', async () => {
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

    test('fileExists should return true when file exists', async () => {
        fsStub.stat.resolves({} as vscode.FileStat);
        
        const exists = await workspaceManager.fileExists('test.txt');
        
        assert.strictEqual(exists, true);
        assert.strictEqual(fsStub.stat.calledOnce, true);
    });

    test('fileExists should return false when file does not exist', async () => {
        fsStub.stat.rejects(new Error('File not found'));
        
        const exists = await workspaceManager.fileExists('nonexistent.txt');
        
        assert.strictEqual(exists, false);
        assert.strictEqual(fsStub.stat.calledOnce, true);
    });

    test('parseTodoFile should parse content into lines', async () => {
        const fileContent = 'Line 1\nLine 2\n\nLine 3';
        fsStub.readFile.resolves(Buffer.from(fileContent));
        
        const lines = await workspaceManager.parseTodoFile('todo.md');
        
        assert.deepStrictEqual(lines, ['Line 1', 'Line 2', 'Line 3']);
    });

    test('updateTodoFile should write lines to file', async () => {
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

    test('moveCompletedTasks should move completed tasks to target file', async () => {
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

    test('updateTaskStatus should add status markers to tasks', async () => {
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

    test('resolveFilePath should throw error when no workspace folder is found', async () => {
        // Remove workspace folders
        workspaceFoldersStub.value(undefined);
        
        assert.throws(() => {
            (workspaceManager as any).resolveFilePath('test.txt');
        }, /No workspace folder found/);
    });
});
