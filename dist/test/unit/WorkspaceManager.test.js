"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var vscode = require("vscode");
var path = require("path");
var WorkspaceManager_1 = require("../../services/WorkspaceManager");
var TestLogger_1 = require("../helpers/TestLogger");
suite('WorkspaceManager Tests', function () {
    var workspaceManager;
    var sandbox;
    var fsStub;
    var workspaceFoldersStub;
    var commandsStub;
    var workspaceStub;
    var logger;
    setup(function () {
        logger = new TestLogger_1.TestLogger();
        sandbox = sinon.createSandbox();
        // Reset the singleton instance
        WorkspaceManager_1.WorkspaceManager.instance = undefined;
        // Create comprehensive stubs
        setupVSCodeStubs();
        // Initialize fresh instance
        workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance(logger);
    });
    teardown(function () {
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
            stat: sandbox.stub().resolves({}),
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
        });
        sandbox.stub(vscode.workspace, 'applyEdit').resolves(true);
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().callsFake(function (key, defaultValue) { return defaultValue; })
        });
        // Setup window stubs
        sandbox.stub(vscode.window, 'showTextDocument').resolves({});
    }
    // Organized test suites by functionality
    suite('Instance Management', function () {
        test('getInstance should return singleton instance', function () {
            var instance1 = WorkspaceManager_1.WorkspaceManager.getInstance();
            var instance2 = WorkspaceManager_1.WorkspaceManager.getInstance();
            assert.strictEqual(instance1, instance2);
        });
    });
    suite('File Operations', function () {
        test('readFile should read a file and return its content', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var fileContent, content, uri;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fileContent = 'file content';
                            fsStub.readFile.resolves(Buffer.from(fileContent));
                            return [4 /*yield*/, workspaceManager.readFile('test.txt')];
                        case 1:
                            content = _a.sent();
                            assert.strictEqual(content, fileContent);
                            assert.strictEqual(fsStub.readFile.calledOnce, true);
                            uri = fsStub.readFile.firstCall.args[0];
                            assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'test.txt'));
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('readFile should handle absolute paths', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var fileContent, absolutePath, content, uri;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fileContent = 'file content';
                            fsStub.readFile.resolves(Buffer.from(fileContent));
                            absolutePath = 'd:\\some\\absolute\\path\\test.txt';
                            return [4 /*yield*/, workspaceManager.readFile(absolutePath)];
                        case 1:
                            content = _a.sent();
                            assert.strictEqual(content, fileContent);
                            uri = fsStub.readFile.firstCall.args[0];
                            assert.strictEqual(uri.fsPath, absolutePath);
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('readFile should handle UTF-8 encoding properly', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var nonAsciiContent, content;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            nonAsciiContent = 'Hello, 世界!';
                            fsStub.readFile.resolves(Buffer.from(nonAsciiContent));
                            return [4 /*yield*/, workspaceManager.readFile('test.txt')];
                        case 1:
                            content = _a.sent();
                            assert.strictEqual(content, nonAsciiContent);
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('readFile should throw error when file read fails', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fsStub.readFile.rejects(new Error('Read error'));
                            return [4 /*yield*/, assert.rejects(function () { return workspaceManager.readFile('test.txt'); }, /Failed to read file: Error: Read error/)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('writeFile should write content to a file', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var mockDocument, _a, uri, content;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            fsStub.writeFile.resolves();
                            fsStub.stat.resolves({});
                            mockDocument = {
                                languageId: 'plaintext',
                                save: sandbox.stub().resolves(true)
                            };
                            workspaceStub.resolves(mockDocument);
                            commandsStub.resolves([]);
                            return [4 /*yield*/, workspaceManager.writeFile('test.txt', 'file content')];
                        case 1:
                            _b.sent();
                            assert.strictEqual(fsStub.writeFile.calledOnce, true);
                            _a = fsStub.writeFile.firstCall.args, uri = _a[0], content = _a[1];
                            assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'test.txt'));
                            assert.deepStrictEqual(content, Buffer.from('file content'));
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('writeFile should create parent directory if it does not exist', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var mockDocument, dirUri;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fsStub.writeFile.resolves();
                            fsStub.stat.onFirstCall().rejects(new Error('Directory not found'));
                            fsStub.createDirectory.resolves();
                            mockDocument = {
                                languageId: 'plaintext',
                                save: sandbox.stub().resolves(true)
                            };
                            workspaceStub.resolves(mockDocument);
                            commandsStub.resolves([]);
                            return [4 /*yield*/, workspaceManager.writeFile('subdir/test.txt', 'file content')];
                        case 1:
                            _a.sent();
                            assert.strictEqual(fsStub.createDirectory.calledOnce, true);
                            assert.strictEqual(fsStub.writeFile.calledOnce, true);
                            dirUri = fsStub.createDirectory.firstCall.args[0];
                            assert.strictEqual(path.basename(dirUri.fsPath), 'subdir');
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('deleteFile should delete a file', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var _a, uri, options;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            fsStub.delete.resolves();
                            return [4 /*yield*/, workspaceManager.deleteFile('test.txt')];
                        case 1:
                            _b.sent();
                            assert.strictEqual(fsStub.delete.calledOnce, true);
                            _a = fsStub.delete.firstCall.args, uri = _a[0], options = _a[1];
                            assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'test.txt'));
                            assert.deepStrictEqual(options, { recursive: false });
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    suite('Directory Operations', function () {
        test('createDirectory should create a directory', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var uri;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fsStub.createDirectory.resolves();
                            return [4 /*yield*/, workspaceManager.createDirectory('testdir')];
                        case 1:
                            _a.sent();
                            assert.strictEqual(fsStub.createDirectory.calledOnce, true);
                            uri = fsStub.createDirectory.firstCall.args[0];
                            assert.strictEqual(uri.fsPath, path.join('d:\\test\\workspace', 'testdir'));
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('listFiles should return files in a directory', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var files;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fsStub.readDirectory.resolves([
                                ['file1.txt', vscode.FileType.File],
                                ['file2.txt', vscode.FileType.File],
                                ['subdir', vscode.FileType.Directory]
                            ]);
                            return [4 /*yield*/, workspaceManager.listFiles('testdir')];
                        case 1:
                            files = _a.sent();
                            assert.strictEqual(fsStub.readDirectory.calledOnce, true);
                            assert.deepStrictEqual(files, [
                                path.join('testdir', 'file1.txt'),
                                path.join('testdir', 'file2.txt'),
                                path.join('testdir', 'subdir')
                            ]);
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('listFiles should handle empty directories', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var files;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fsStub.readDirectory.resolves([]);
                            return [4 /*yield*/, workspaceManager.listFiles('emptydir')];
                        case 1:
                            files = _a.sent();
                            assert.deepStrictEqual(files, []);
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    suite('Todo Operations', function () {
        test('parseTodoFile should parse content into lines', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var fileContent, lines;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fileContent = 'Line 1\nLine 2\n\nLine 3';
                            fsStub.readFile.resolves(Buffer.from(fileContent));
                            return [4 /*yield*/, workspaceManager.parseTodoFile('todo.md')];
                        case 1:
                            lines = _a.sent();
                            assert.deepStrictEqual(lines, ['Line 1', 'Line 2', 'Line 3']);
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('updateTodoFile should write lines to file', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var mockDocument, lines, content;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fsStub.writeFile.resolves();
                            fsStub.stat.resolves({});
                            mockDocument = {
                                languageId: 'markdown',
                                save: sandbox.stub().resolves(true)
                            };
                            workspaceStub.resolves(mockDocument);
                            commandsStub.resolves([]);
                            lines = ['Line 1', 'Line 2', 'Line 3'];
                            return [4 /*yield*/, workspaceManager.updateTodoFile('todo.md', lines)];
                        case 1:
                            _a.sent();
                            assert.strictEqual(fsStub.writeFile.calledOnce, true);
                            content = fsStub.writeFile.firstCall.args[1];
                            assert.deepStrictEqual(Buffer.from(content).toString(), 'Line 1\nLine 2\nLine 3');
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('moveCompletedTasks should move completed tasks to target file', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var sourceTodo, targetTodo, mockDocument, sourceContent, targetContent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            sourceTodo = [
                                '- [ ] Task 1 (0%)',
                                '- [X] Task 2 (100%)',
                                '- [/] Task 3 (50%)',
                                '- [X] Task 4 (100%)'
                            ].join('\n');
                            targetTodo = [
                                '- [X] Old Task (100%) [completed: 2023-01-01]'
                            ].join('\n');
                            // Mock file operations
                            fsStub.readFile.onFirstCall().resolves(Buffer.from(sourceTodo));
                            fsStub.readFile.onSecondCall().resolves(Buffer.from(targetTodo));
                            fsStub.stat.resolves({});
                            fsStub.writeFile.resolves();
                            mockDocument = {
                                languageId: 'markdown',
                                save: sandbox.stub().resolves(true)
                            };
                            workspaceStub.resolves(mockDocument);
                            commandsStub.resolves([]);
                            // Run the method
                            return [4 /*yield*/, workspaceManager.moveCompletedTasks('source.md', 'target.md')];
                        case 1:
                            // Run the method
                            _a.sent();
                            sourceContent = fsStub.writeFile.firstCall.args[1];
                            assert.ok(Buffer.from(sourceContent).toString().includes('Task 1'));
                            assert.ok(Buffer.from(sourceContent).toString().includes('Task 3'));
                            assert.ok(!Buffer.from(sourceContent).toString().includes('Task 2'));
                            assert.ok(!Buffer.from(sourceContent).toString().includes('Task 4'));
                            targetContent = fsStub.writeFile.secondCall.args[1];
                            assert.ok(Buffer.from(targetContent).toString().includes('Old Task'));
                            assert.ok(Buffer.from(targetContent).toString().includes('Task 2'));
                            assert.ok(Buffer.from(targetContent).toString().includes('Task 4'));
                            assert.ok(Buffer.from(targetContent).toString().includes('[completed:'));
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('updateTaskStatus should add status markers to tasks', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var todo, mockDocument, content, updatedTodo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            todo = [
                                '- Task without status',
                                '- [ ] Task with status but no percentage',
                                '- [X] Task with status and percentage (100%)',
                                'Not a task line'
                            ].join('\n');
                            // Mock file operations
                            fsStub.readFile.resolves(Buffer.from(todo));
                            fsStub.stat.resolves({});
                            fsStub.writeFile.resolves();
                            mockDocument = {
                                languageId: 'markdown',
                                save: sandbox.stub().resolves(true)
                            };
                            workspaceStub.resolves(mockDocument);
                            commandsStub.resolves([]);
                            // Run the method
                            return [4 /*yield*/, workspaceManager.updateTaskStatus('todo.md')];
                        case 1:
                            // Run the method
                            _a.sent();
                            content = fsStub.writeFile.firstCall.args[1];
                            updatedTodo = Buffer.from(content).toString();
                            assert.ok(updatedTodo.includes('- [ ] Task without status'));
                            assert.ok(updatedTodo.includes('- [ ] Task with status but no percentage (0%)'));
                            assert.ok(updatedTodo.includes('- [X] Task with status and percentage (100%)'));
                            assert.ok(updatedTodo.includes('Not a task line'));
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    suite('Error Handling', function () {
        test('readFile should handle read errors gracefully', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fsStub.readFile.rejects(new Error('Read error'));
                            return [4 /*yield*/, assert.rejects(function () { return workspaceManager.readFile('test.txt'); }, /Failed to read file: Error: Read error/)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('writeFile should handle write errors gracefully', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fsStub.writeFile.rejects(new Error('Write error'));
                            return [4 /*yield*/, assert.rejects(function () { return workspaceManager.writeFile('test.txt', 'content'); }, /Failed to write file: Error: Write error/)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('resolveFilePath should handle missing workspace gracefully', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    workspaceFoldersStub.value(undefined);
                    assert.throws(function () { return workspaceManager.resolveFilePath('test.txt'); }, /No workspace folder found/);
                    return [2 /*return*/];
                });
            });
        });
        // Add new error cases
        test('formatDocument should handle formatting errors gracefully', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var mockDocument;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            commandsStub.rejects(new Error('Format error'));
                            mockDocument = {
                                languageId: 'plaintext',
                                save: sandbox.stub().resolves(true)
                            };
                            workspaceStub.resolves(mockDocument);
                            // Should not throw, just log warning
                            return [4 /*yield*/, workspaceManager.formatDocumentAtPath('test.txt')];
                        case 1:
                            // Should not throw, just log warning
                            _a.sent();
                            assert.ok(logger.warnings.some(function (w) { return w.includes('Format error'); }));
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    suite('Cleanup', function () {
        test('should properly clean up resources', function () {
            // Add cleanup test logic if needed
        });
    });
});
//# sourceMappingURL=WorkspaceManager.test.js.map