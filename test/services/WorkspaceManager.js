/**
 * Tests for WorkspaceManager
 * Source: src\services\WorkspaceManager.js
 */
const assert = require('assert');
const path = require('path');
const vscode = require('vscode');
const sinon = require('sinon');
const fs = require('fs');
const { WorkspaceManager } = require('../../src/services/WorkspaceManager');
const { Logger } = require('../../src/utils/logger');

describe('WorkspaceManager (JavaScript)', () => {
    let workspaceManager;
    let sandbox;
    let loggerStub;
    let fsStub;
    let vscodeStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create logger stub
        loggerStub = sandbox.createStubInstance(Logger);
        sandbox.stub(Logger, 'getInstance').returns(loggerStub);

        // Stub fs.promises methods
        fsStub = {
            readFile: sandbox.stub(),
            writeFile: sandbox.stub(),
            mkdir: sandbox.stub(),
            readdir: sandbox.stub(),
            unlink: sandbox.stub(),
            access: sandbox.stub()
        };
        sandbox.stub(fs, 'promises').value(fsStub);

        // Stub vscode.workspace
        vscodeStub = {
            workspaceFolders: [{ uri: { fsPath: '/test-workspace' } }],
            findFiles: sandbox.stub().resolves([]),
            getConfiguration: sandbox.stub().returns({
                get: sandbox.stub(),
                update: sandbox.stub(),
                has: sandbox.stub(),
                inspect: sandbox.stub()
            })
        };
        sandbox.stub(vscode, 'workspace').value(vscodeStub);

        // Stub vscode.commands
        sandbox.stub(vscode, 'commands').value({
            executeCommand: sandbox.stub().resolves()
        });

        // Create instance of WorkspaceManager
        workspaceManager = WorkspaceManager.getInstance();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance when getInstance is called multiple times', () => {
            const instance1 = WorkspaceManager.getInstance();
            const instance2 = WorkspaceManager.getInstance();
            assert.strictEqual(instance1, instance2);
        });
    });

    describe('File Operations', () => {
        it('should read file content successfully', async () => {
            const expectedContent = 'test file content';
            fsStub.readFile.resolves(expectedContent);

            const result = await workspaceManager.readFile('test.txt');

            assert.strictEqual(result, expectedContent);
            assert(fsStub.readFile.calledOnce);
            assert(loggerStub.debug.calledOnce);
        });

        it('should handle errors when reading files', async () => {
            const errorMessage = 'File not found';
            fsStub.readFile.rejects(new Error(errorMessage));

            try {
                await workspaceManager.readFile('nonexistent.txt');
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof Error);
                assert(error.message.includes(errorMessage));
                assert(loggerStub.error.calledOnce);
            }
        });

        it('should write file content successfully', async () => {
            fsStub.writeFile.resolves();
            fsStub.mkdir.resolves();

            await workspaceManager.writeFile('test.txt', 'content');

            assert(fsStub.writeFile.calledOnce);
            assert(loggerStub.debug.calledOnce);
        });

        it('should create directories when writing files', async () => {
            fsStub.writeFile.resolves();
            fsStub.mkdir.resolves();

            await workspaceManager.writeFile('nested/path/test.txt', 'content');

            assert(fsStub.mkdir.calledOnce);
            assert(fsStub.writeFile.calledOnce);
        });

        it('should handle errors when writing files', async () => {
            const errorMessage = 'Permission denied';
            fsStub.writeFile.rejects(new Error(errorMessage));
            fsStub.mkdir.resolves();

            try {
                await workspaceManager.writeFile('test.txt', 'content');
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof Error);
                assert(error.message.includes(errorMessage));
                assert(loggerStub.error.calledOnce);
            }
        });

        it('should delete files successfully', async () => {
            fsStub.unlink.resolves();

            await workspaceManager.deleteFile('test.txt');

            assert(fsStub.unlink.calledOnce);
            assert(loggerStub.debug.calledOnce);
        });

        it('should handle errors when deleting files', async () => {
            const errorMessage = 'File not found';
            fsStub.unlink.rejects(new Error(errorMessage));

            try {
                await workspaceManager.deleteFile('nonexistent.txt');
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof Error);
                assert(error.message.includes(errorMessage));
                assert(loggerStub.error.calledOnce);
            }
        });
    });

    describe('Directory Operations', () => {
        it('should create directories successfully', async () => {
            fsStub.mkdir.resolves();

            await workspaceManager.createDirectory('test-dir');

            assert(fsStub.mkdir.calledOnce);
            assert(loggerStub.debug.calledOnce);
        });

        it('should handle errors when creating directories', async () => {
            const errorMessage = 'Permission denied';
            fsStub.mkdir.rejects(new Error(errorMessage));

            try {
                await workspaceManager.createDirectory('test-dir');
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof Error);
                assert(error.message.includes(errorMessage));
                assert(loggerStub.error.calledOnce);
            }
        });

        it('should list files in a directory successfully', async () => {
            const files = ['file1.txt', 'file2.txt', 'dir1'];
            fsStub.readdir.resolves(files);

            const result = await workspaceManager.listFiles('test-dir');

            assert.deepStrictEqual(result, files);
            assert(fsStub.readdir.calledOnce);
            assert(loggerStub.debug.calledOnce);
        });

        it('should handle errors when listing files', async () => {
            const errorMessage = 'Directory not found';
            fsStub.readdir.rejects(new Error(errorMessage));

            try {
                await workspaceManager.listFiles('nonexistent-dir');
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof Error);
                assert(error.message.includes(errorMessage));
                assert(loggerStub.error.calledOnce);
            }
        });
    });

    describe('Path Resolution', () => {
        it('should resolve absolute paths correctly', () => {
            const absolutePath = path.resolve('/absolute/path');
            const result = workspaceManager.resolveFilePath(absolutePath);

            assert.strictEqual(result, absolutePath);
        });

        it('should resolve relative paths to workspace root', () => {
            const relativePath = 'relative/path';
            const expected = path.join('/test-workspace', relativePath);

            const result = workspaceManager.resolveFilePath(relativePath);

            assert.strictEqual(result, expected);
        });

        it('should throw an error when no workspace is open', () => {
            vscodeStub.workspaceFolders = null;

            assert.throws(() => {
                workspaceManager.resolveFilePath('test.txt');
            }, /No workspace folder is open/);
        });
    });

    describe('File Existence Check', () => {
        it('should return true when file exists', async () => {
            fsStub.access.resolves();

            const result = await workspaceManager.fileExists('test.txt');

            assert.strictEqual(result, true);
        });

        it('should return false when file does not exist', async () => {
            fsStub.access.rejects(new Error('File not found'));

            const result = await workspaceManager.fileExists('nonexistent.txt');

            assert.strictEqual(result, false);
        });
    });

    describe('Task Management', () => {
        it('should parse todo file correctly', () => {
            const content = 'line1\nline2\nline3';
            const result = workspaceManager.parseTodoFile(content);

            assert.deepStrictEqual(result, ['line1', 'line2', 'line3']);
        });

        it('should update todo file with new content', async () => {
            fsStub.writeFile.resolves();
            const lines = ['task 1', 'task 2'];

            await workspaceManager.updateTodoFile('todo.md', lines);

            assert(fsStub.writeFile.calledWith(
                sinon.match.string,
                'task 1\ntask 2',
                'utf8'
            ));
        });

        it('should move completed tasks to a separate file', async () => {
            const sourceContent = '- [ ] task 1\n- [x] completed 1\n- [ ] task 2\n- [x] completed 2';
            const targetContent = '- [x] old completed';

            fsStub.readFile.onFirstCall().resolves(sourceContent);
            fsStub.readFile.onSecondCall().resolves(targetContent);
            fsStub.writeFile.resolves();
            fsStub.access.resolves();

            await workspaceManager.moveCompletedTasks('source.md', 'target.md');

            // Check source file has only incomplete tasks
            assert(fsStub.writeFile.calledWith(
                sinon.match.string,
                '- [ ] task 1\n- [ ] task 2',
                'utf8'
            ));

            // Check target file has old completed tasks plus new ones
            assert(fsStub.writeFile.calledWith(
                sinon.match.string,
                sinon.match(content => {
                    return content.includes('- [x] old completed') &&
                           content.includes('- [x] completed 1') &&
                           content.includes('- [x] completed 2');
                }),
                'utf8'
            ));
        });

        it('should update task status to completed', async () => {
            const todoContent = '- [ ] task 1\n- [ ] task 2\n- [ ] task 3';
            fsStub.readFile.resolves(todoContent);
            fsStub.writeFile.resolves();

            await workspaceManager.updateTaskStatus('todo.md', 1, true);

            // Check the second task is marked as completed
            assert(fsStub.writeFile.calledWith(
                sinon.match.string,
                '- [ ] task 1\n- [x] task 2\n- [ ] task 3',
                'utf8'
            ));
        });

        it('should update task status to not completed', async () => {
            const todoContent = '- [ ] task 1\n- [x] task 2\n- [ ] task 3';
            fsStub.readFile.resolves(todoContent);
            fsStub.writeFile.resolves();

            await workspaceManager.updateTaskStatus('todo.md', 1, false);

            // Check the second task is marked as not completed
            assert(fsStub.writeFile.calledWith(
                sinon.match.string,
                '- [ ] task 1\n- [ ] task 2\n- [ ] task 3',
                'utf8'
            ));
        });

        it('should throw an error when updating task status with invalid line number', async () => {
            const todoContent = '- [ ] task 1\n- [ ] task 2';
            fsStub.readFile.resolves(todoContent);

            try {
                await workspaceManager.updateTaskStatus('todo.md', 5, true);
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof Error);
                assert(error.message.includes('Invalid line number'));
            }
        });
    });

    describe('VSCode Integration', () => {
        it('should find files using vscode API', async () => {
            const mockUris = [
                { fsPath: '/test-workspace/file1.ts' },
                { fsPath: '/test-workspace/file2.ts' }
            ];
            vscodeStub.findFiles.resolves(mockUris);

            const result = await workspaceManager.findFiles('*.ts');

            assert.deepStrictEqual(result, mockUris);
        });

        it('should handle errors when finding files', async () => {
            vscodeStub.findFiles.rejects(new Error('Search failed'));

            try {
                await workspaceManager.findFiles('*.ts');
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof Error);
                assert(error.message.includes('Failed to find files'));
            }
        });

        it('should get workspace configuration', () => {
            const mockConfig = { get: sandbox.stub() };
            vscodeStub.getConfiguration.returns(mockConfig);

            const result = workspaceManager.getConfiguration('section');

            assert.strictEqual(result, mockConfig);
        });

        it('should update workspace configuration successfully', async () => {
            const updateStub = sandbox.stub().resolves();
            vscodeStub.getConfiguration.returns({
                update: updateStub
            });

            await workspaceManager.updateConfiguration('testSection', 'testValue', vscode.ConfigurationTarget.Workspace);

            assert(updateStub.calledOnce);
            assert(updateStub.calledWith('testSection', 'testValue', vscode.ConfigurationTarget.Workspace));
        });

        it('should handle errors when updating configuration', async () => {
            const updateError = new Error('Update failed');
            const updateStub = sandbox.stub().rejects(updateError);
            vscodeStub.getConfiguration.returns({
                update: updateStub
            });

            try {
                await workspaceManager.updateConfiguration('testSection', 'testValue');
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof Error);
                assert(error.message.includes('Failed to update configuration'));
                assert(loggerStub.error.called);
            }
        });

        it('should format document successfully', async () => {
            const commandStub = sandbox.stub(vscode.commands, 'executeCommand').resolves();
            const mockDocument = {
                uri: { scheme: 'file', path: '/test.js' },
                fileName: '/test.js',
                isUntitled: false,
                languageId: 'javascript',
                version: 1,
                isDirty: false,
                isClosed: false,
                save: sandbox.stub().resolves(true),
                lineAt: sandbox.stub(),
                lineCount: 10,
                getText: sandbox.stub().returns('test content'),
                getWordRangeAtPosition: sandbox.stub(),
                offsetAt: sandbox.stub(),
                positionAt: sandbox.stub(),
                validateRange: sandbox.stub(),
                validatePosition: sandbox.stub(),
                eol: vscode.EndOfLine.LF
            };

            await workspaceManager.formatDocument(mockDocument);

            sinon.assert.calledOnce(commandStub);
            sinon.assert.calledWith(commandStub, 'editor.action.formatDocument', mockDocument);
            commandStub.restore();
        });

        it('should handle errors when formatting document', async () => {
            const commandStub = sandbox.stub(vscode.commands, 'executeCommand').rejects(new Error('Format error'));
            const mockDocument = {
                uri: { scheme: 'file', path: '/test.js' },
                fileName: '/test.js',
                isUntitled: false,
                languageId: 'javascript',
                version: 1,
                isDirty: false,
                isClosed: false,
                save: sandbox.stub().resolves(true),
                lineAt: sandbox.stub(),
                lineCount: 10,
                getText: sandbox.stub().returns('test content'),
                getWordRangeAtPosition: sandbox.stub(),
                offsetAt: sandbox.stub(),
                positionAt: sandbox.stub(),
                validateRange: sandbox.stub(),
                validatePosition: sandbox.stub(),
                eol: vscode.EndOfLine.LF
            };

            try {
                await workspaceManager.formatDocument(mockDocument);
                assert.fail('Expected an error to be thrown');
            } catch (error) {
                assert(error instanceof Error);
                assert(error.message.includes('Failed to format document'));
                assert(loggerStub.error.called);
            }
            commandStub.restore();
        });
    });

    describe('Resource Cleanup', () => {
        it('should not throw errors when disposed', () => {
            assert.doesNotThrow(() => {
                workspaceManager.dispose();
            });
        });
    });
});
