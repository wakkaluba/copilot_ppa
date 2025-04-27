"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var vscode = require("vscode");
var WorkspaceManager_1 = require("../../src/services/WorkspaceManager");
var TestWorkspace_1 = require("../helpers/TestWorkspace");
describe('Workspace Manager', function () {
    var workspaceManager;
    var testWorkspace;
    var mockLogger;
    var mockFs;
    var originalWorkspaceFolders;
    var originalGetConfiguration;
    var originalFindFiles;
    var originalFs;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testWorkspace = new TestWorkspace_1.TestWorkspace();
                    return [4 /*yield*/, testWorkspace.setup()];
                case 1:
                    _a.sent();
                    mockLogger = {
                        debug: jest.fn(),
                        info: jest.fn(),
                        warn: jest.fn(),
                        error: jest.fn()
                    };
                    originalWorkspaceFolders = vscode.workspace.workspaceFolders;
                    originalGetConfiguration = vscode.workspace.getConfiguration;
                    originalFindFiles = vscode.workspace.findFiles;
                    originalFs = vscode.workspace.fs;
                    mockFs = {
                        readFile: jest.fn(),
                        writeFile: jest.fn(),
                        readDirectory: jest.fn(),
                        stat: jest.fn(),
                        createDirectory: jest.fn(),
                    };
                    vscode.workspace.fs = mockFs;
                    vscode.workspace.findFiles = jest.fn();
                    vscode.workspace.getConfiguration = jest.fn();
                    Object.defineProperty(vscode.workspace, 'workspaceFolders', {
                        value: [],
                        writable: true,
                        configurable: true
                    });
                    WorkspaceManager_1.WorkspaceManager.instance = undefined;
                    workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
                    if (workspaceManager.setLogger) {
                        workspaceManager.setLogger(mockLogger);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testWorkspace.cleanup()];
                case 1:
                    _a.sent();
                    Object.defineProperty(vscode.workspace, 'workspaceFolders', {
                        value: originalWorkspaceFolders,
                        writable: false,
                        configurable: true
                    });
                    vscode.workspace.getConfiguration = originalGetConfiguration;
                    vscode.workspace.findFiles = originalFindFiles;
                    vscode.workspace.fs = originalFs;
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('File Operations', function () {
        test('reads file content', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, expectedContent, content, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/file.ts');
                        expectedContent = 'test content';
                        mockFs.readFile.mockResolvedValue(Buffer.from(expectedContent));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, workspaceManager.readFile(uri)];
                    case 2:
                        content = _a.sent();
                        expect(content).toBe(expectedContent);
                        expect(mockFs.readFile).toHaveBeenCalledWith(uri);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        assert.fail("Test failed with error: ".concat(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('writes file content', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, content, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/file.ts');
                        content = 'new content';
                        mockFs.writeFile.mockResolvedValue(undefined);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, workspaceManager.writeFile(uri, content)];
                    case 2:
                        _a.sent();
                        expect(mockFs.writeFile).toHaveBeenCalledWith(uri, Buffer.from(content));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        assert.fail("Test failed with error: ".concat(error_2));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('lists directory contents', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, mockDirectoryContents, contents, error_3;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/dir');
                        mockDirectoryContents = [
                            ['file1.ts', vscode.FileType.File],
                            ['dir1', vscode.FileType.Directory]
                        ];
                        mockFs.readDirectory.mockResolvedValue(mockDirectoryContents);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, workspaceManager.listDirectory(uri)];
                    case 2:
                        contents = _e.sent();
                        expect(contents).toHaveLength(2);
                        expect((_a = contents === null || contents === void 0 ? void 0 : contents[0]) === null || _a === void 0 ? void 0 : _a[0]).toBe('file1.ts');
                        expect((_b = contents === null || contents === void 0 ? void 0 : contents[0]) === null || _b === void 0 ? void 0 : _b[1]).toBe(vscode.FileType.File);
                        expect((_c = contents === null || contents === void 0 ? void 0 : contents[1]) === null || _c === void 0 ? void 0 : _c[0]).toBe('dir1');
                        expect((_d = contents === null || contents === void 0 ? void 0 : contents[1]) === null || _d === void 0 ? void 0 : _d[1]).toBe(vscode.FileType.Directory);
                        expect(mockFs.readDirectory).toHaveBeenCalledWith(uri);
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _e.sent();
                        assert.fail("Test failed with error: ".concat(error_3));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('checks file existence', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, exists, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/file.ts');
                        mockFs.stat.mockResolvedValue({
                            type: vscode.FileType.File, size: 100, ctime: 0, mtime: 0
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, workspaceManager.fileExists(uri)];
                    case 2:
                        exists = _a.sent();
                        expect(exists).toBe(true);
                        expect(mockFs.stat).toHaveBeenCalledWith(uri);
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        assert.fail("Test failed with error: ".concat(error_4));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('checks file non-existence', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, exists, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/nonexistent.ts');
                        mockFs.stat.mockRejectedValue(new vscode.FileSystemError(uri));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, workspaceManager.fileExists(uri)];
                    case 2:
                        exists = _a.sent();
                        expect(exists).toBe(false);
                        expect(mockFs.stat).toHaveBeenCalledWith(uri);
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        assert.fail("Test failed unexpectedly: ".concat(error_5));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Workspace Operations', function () {
        test('gets workspace folders', function () {
            var _a, _b;
            var mockFoldersData = [
                { uri: vscode.Uri.file('/workspace1'), name: 'ws1', index: 0 },
                { uri: vscode.Uri.file('/workspace2'), name: 'ws2', index: 1 }
            ];
            Object.defineProperty(vscode.workspace, 'workspaceFolders', {
                value: mockFoldersData,
                writable: true,
                configurable: true
            });
            var folders = workspaceManager.getWorkspaceFolders();
            expect(folders).toHaveLength(2);
            expect((_a = folders === null || folders === void 0 ? void 0 : folders[0]) === null || _a === void 0 ? void 0 : _a.name).toBe('ws1');
            expect((_b = folders === null || folders === void 0 ? void 0 : folders[1]) === null || _b === void 0 ? void 0 : _b.name).toBe('ws2');
        });
        test('finds files by pattern', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockUris, files, error_6;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        mockUris = [
                            vscode.Uri.file('/test/file1.ts'),
                            vscode.Uri.file('/test/file2.ts')
                        ];
                        vscode.workspace.findFiles.mockResolvedValue(mockUris);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, workspaceManager.findFiles('**/*.ts', undefined, undefined)];
                    case 2:
                        files = _c.sent();
                        expect(files).toHaveLength(2);
                        expect((_a = files === null || files === void 0 ? void 0 : files[0]) === null || _a === void 0 ? void 0 : _a.fsPath).toContain('file1.ts');
                        expect((_b = files === null || files === void 0 ? void 0 : files[1]) === null || _b === void 0 ? void 0 : _b.fsPath).toContain('file2.ts');
                        expect(vscode.workspace.findFiles).toHaveBeenCalledWith('**/*.ts', undefined, undefined, undefined);
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _c.sent();
                        assert.fail("Test failed with error: ".concat(error_6));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('creates directory', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/newdir');
                        mockFs.createDirectory.mockResolvedValue(undefined);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, workspaceManager.createDirectory(uri)];
                    case 2:
                        _a.sent();
                        expect(mockFs.createDirectory).toHaveBeenCalledWith(uri);
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        assert.fail("Test failed with error: ".concat(error_7));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Error Handling', function () {
        test('handles file read errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, expectedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/nonexistent.ts');
                        expectedError = new vscode.FileSystemError('File not found');
                        mockFs.readFile.mockRejectedValue(expectedError);
                        return [4 /*yield*/, expect(workspaceManager.readFile(uri)).rejects.toThrow(expectedError)];
                    case 1:
                        _a.sent();
                        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error reading file'), expectedError);
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles file write errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, expectedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/readonly.ts');
                        expectedError = new vscode.FileSystemError('Permission denied');
                        mockFs.writeFile.mockRejectedValue(expectedError);
                        return [4 /*yield*/, expect(workspaceManager.writeFile(uri, 'content')).rejects.toThrow(expectedError)];
                    case 1:
                        _a.sent();
                        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error writing file'), expectedError);
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles invalid workspace folders', function () {
            Object.defineProperty(vscode.workspace, 'workspaceFolders', {
                value: undefined,
                writable: true,
                configurable: true
            });
            var folders = workspaceManager.getWorkspaceFolders();
            expect(folders).toHaveLength(0);
        });
        test('handles list directory errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, expectedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/nodir');
                        expectedError = new vscode.FileSystemError('Directory not found');
                        mockFs.readDirectory.mockRejectedValue(expectedError);
                        return [4 /*yield*/, expect(workspaceManager.listDirectory(uri)).rejects.toThrow(expectedError)];
                    case 1:
                        _a.sent();
                        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error listing directory'), expectedError);
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles find files errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expectedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expectedError = new Error('Search failed');
                        vscode.workspace.findFiles.mockRejectedValue(expectedError);
                        return [4 /*yield*/, expect(workspaceManager.findFiles('**/*.ts')).rejects.toThrow(expectedError)];
                    case 1:
                        _a.sent();
                        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error finding files'), expectedError);
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles create directory errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var uri, expectedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = vscode.Uri.file('/test/noperm');
                        expectedError = new vscode.FileSystemError('Permission denied');
                        mockFs.createDirectory.mockRejectedValue(expectedError);
                        return [4 /*yield*/, expect(workspaceManager.createDirectory(uri)).rejects.toThrow(expectedError)];
                    case 1:
                        _a.sent();
                        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error creating directory'), expectedError);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Configuration', function () {
        var mockConfig;
        beforeEach(function () {
            mockConfig = {
                get: jest.fn(),
                update: jest.fn().mockResolvedValue(undefined),
                has: jest.fn(),
                inspect: jest.fn()
            };
            vscode.workspace.getConfiguration.mockReturnValue(mockConfig);
        });
        test('gets workspace configuration', function () {
            var expectedValue = 'test-value';
            mockConfig.get.mockReturnValue(expectedValue);
            var value = workspaceManager.getConfiguration('section', 'key');
            expect(value).toBe(expectedValue);
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('section', undefined);
            expect(mockConfig.get).toHaveBeenCalledWith('key', undefined);
        });
        test('gets workspace configuration with default value', function () {
            var defaultValue = 'default';
            mockConfig.get.mockReturnValue(undefined);
            var value = workspaceManager.getConfiguration('section', 'key', defaultValue);
            expect(value).toBe(defaultValue);
            expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('section', undefined);
            expect(mockConfig.get).toHaveBeenCalledWith('key', defaultValue);
        });
        test('updates workspace configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var newValue, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newValue = 'new-value';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, workspaceManager.updateConfiguration('section', 'key', newValue)];
                    case 2:
                        _a.sent();
                        expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('section', undefined);
                        expect(mockConfig.update).toHaveBeenCalledWith('key', newValue, vscode.ConfigurationTarget.Workspace);
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        assert.fail("Test failed with error: ".concat(error_8));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('updates workspace configuration with target', function () { return __awaiter(void 0, void 0, void 0, function () {
            var newValue, target, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newValue = 'new-value-global';
                        target = vscode.ConfigurationTarget.Global;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, workspaceManager.updateConfiguration('section', 'key', newValue, target)];
                    case 2:
                        _a.sent();
                        expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('section', undefined);
                        expect(mockConfig.update).toHaveBeenCalledWith('key', newValue, target);
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        assert.fail("Test failed with error: ".concat(error_9));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('handles configuration update errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expectedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expectedError = new Error('Update failed');
                        mockConfig.update.mockRejectedValue(expectedError);
                        return [4 /*yield*/, expect(workspaceManager.updateConfiguration('section', 'key', 'value'))
                                .rejects.toThrow(expectedError)];
                    case 1:
                        _a.sent();
                        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error updating configuration'), expectedError);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
