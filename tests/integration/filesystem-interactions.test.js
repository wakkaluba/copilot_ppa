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
var fs = require("fs");
var path = require("path");
var ContextManager_1 = require("../../src/services/ContextManager");
var conversationManager_1 = require("../../src/services/conversationManager");
var WorkspaceManager_1 = require("../../src/services/WorkspaceManager");
var FileSystemService_1 = require("../../src/services/FileSystemService");
describe('Cross-Platform Filesystem Interactions', function () {
    var contextManager;
    var conversationManager;
    var workspaceManager;
    var fileSystemService;
    var testWorkspace;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Create test workspace directory with mixed path separators
                    testWorkspace = path.join(__dirname, '.test-workspace');
                    if (!fs.existsSync(testWorkspace)) {
                        fs.mkdirSync(testWorkspace, { recursive: true });
                    }
                    context = {
                        subscriptions: [],
                        workspaceState: new MockMemento(),
                        globalState: new MockMemento(),
                        extensionPath: testWorkspace,
                        storagePath: path.join(testWorkspace, 'storage')
                    };
                    // Initialize components
                    workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
                    fileSystemService = new FileSystemService_1.FileSystemService(workspaceManager);
                    contextManager = ContextManager_1.ContextManager.getInstance();
                    conversationManager = conversationManager_1.ConversationManager.getInstance();
                    // Set up test workspace structure
                    return [4 /*yield*/, setupTestWorkspace()];
                case 1:
                    // Set up test workspace structure
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () {
        if (fs.existsSync(testWorkspace)) {
            fs.rmSync(testWorkspace, { recursive: true, force: true });
        }
    });
    function setupTestWorkspace() {
        return __awaiter(this, void 0, void 0, function () {
            var dirs, _i, dirs_1, dir, fullPath, files, _a, _b, _c, filePath, content, fullPath;
            return __generator(this, function (_d) {
                dirs = [
                    'src/components',
                    'src\\utils',
                    'test/unit',
                    'test\\integration'
                ];
                for (_i = 0, dirs_1 = dirs; _i < dirs_1.length; _i++) {
                    dir = dirs_1[_i];
                    fullPath = path.join(testWorkspace, dir.replace(/[\\/]/g, path.sep));
                    fs.mkdirSync(fullPath, { recursive: true });
                }
                files = {
                    'src/components/test.tsx': 'export const Test = () => {\n  return <div>Test</div>;\n}',
                    'src\\utils\\helper.ts': 'export function helper() {\r\n  return true;\r\n}',
                    'test/unit/test.spec.ts': 'describe("test", () => {\n  it("works", () => {});\n});',
                    'test\\integration\\test.spec.ts': 'test("integration", async () => {\r\n});'
                };
                for (_a = 0, _b = Object.entries(files); _a < _b.length; _a++) {
                    _c = _b[_a], filePath = _c[0], content = _c[1];
                    fullPath = path.join(testWorkspace, filePath.replace(/[\\/]/g, path.sep));
                    fs.writeFileSync(fullPath, content);
                }
                return [2 /*return*/];
            });
        });
    }
    test('handles mixed path separators correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var paths, _i, paths_1, testPath, normalizedPath, exists, content;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    paths = [
                        'src/components/test.tsx',
                        'src\\utils\\helper.ts',
                        path.join('src', 'components', 'test.tsx'),
                        path.join('src', 'utils', 'helper.ts')
                    ];
                    _i = 0, paths_1 = paths;
                    _a.label = 1;
                case 1:
                    if (!(_i < paths_1.length)) return [3 /*break*/, 5];
                    testPath = paths_1[_i];
                    normalizedPath = path.join(testWorkspace, testPath.replace(/[\\/]/g, path.sep));
                    return [4 /*yield*/, fileSystemService.fileExists(normalizedPath)];
                case 2:
                    exists = _a.sent();
                    assert.ok(exists, "File ".concat(testPath, " should exist"));
                    return [4 /*yield*/, fileSystemService.readFile(normalizedPath)];
                case 3:
                    content = _a.sent();
                    assert.ok(content.length > 0, "File ".concat(testPath, " should have content"));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    test('preserves line endings when reading and writing files', function () { return __awaiter(void 0, void 0, void 0, function () {
        var files, originals, lfContent, crlfContent;
        var _a;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    files = {
                        lf: path.join(testWorkspace, 'src', 'components', 'test.tsx'),
                        crlf: path.join(testWorkspace, 'src', 'utils', 'helper.ts')
                    };
                    _a = {};
                    return [4 /*yield*/, fileSystemService.readFile(files.lf)];
                case 1:
                    _a.lf = _f.sent();
                    return [4 /*yield*/, fileSystemService.readFile(files.crlf)];
                case 2:
                    originals = (_a.crlf = _f.sent(),
                        _a);
                    // Write content back
                    return [4 /*yield*/, fileSystemService.writeFile(files.lf, originals.lf)];
                case 3:
                    // Write content back
                    _f.sent();
                    return [4 /*yield*/, fileSystemService.writeFile(files.crlf, originals.crlf)];
                case 4:
                    _f.sent();
                    return [4 /*yield*/, fileSystemService.readFile(files.lf)];
                case 5:
                    lfContent = _f.sent();
                    return [4 /*yield*/, fileSystemService.readFile(files.crlf)];
                case 6:
                    crlfContent = _f.sent();
                    assert.strictEqual((_b = lfContent.match(/\n/g)) === null || _b === void 0 ? void 0 : _b.length, (_c = originals.lf.match(/\n/g)) === null || _c === void 0 ? void 0 : _c.length);
                    assert.strictEqual((_d = crlfContent.match(/\r\n/g)) === null || _d === void 0 ? void 0 : _d.length, (_e = originals.crlf.match(/\r\n/g)) === null || _e === void 0 ? void 0 : _e.length);
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles concurrent file operations safely', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testFile, operations, concurrentWrites, content, lines, numbers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testFile = path.join(testWorkspace, 'concurrent-test.txt');
                    operations = 50;
                    concurrentWrites = Array(operations).fill(null).map(function (_, i) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fileSystemService.writeFile(testFile, "Line ".concat(i, "\n"), { flag: 'a' })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Perform concurrent writes
                    return [4 /*yield*/, Promise.all(concurrentWrites)];
                case 1:
                    // Perform concurrent writes
                    _a.sent();
                    return [4 /*yield*/, fileSystemService.readFile(testFile)];
                case 2:
                    content = _a.sent();
                    lines = content.split('\n').filter(function (line) { return line.trim(); });
                    assert.strictEqual(lines.length, operations);
                    numbers = new Set(lines.map(function (line) { return parseInt(line.split(' ')[1]); }));
                    assert.strictEqual(numbers.size, operations);
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles special characters in paths and filenames', function () { return __awaiter(void 0, void 0, void 0, function () {
        var specialPaths, _i, specialPaths_1, filePath, exists, _a, specialPaths_2, filePath, content;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    specialPaths = [
                        path.join(testWorkspace, 'test with spaces.ts'),
                        path.join(testWorkspace, 'test-with-дashes.ts'),
                        path.join(testWorkspace, '테스트.ts'),
                        path.join(testWorkspace, 'test_with_∆_symbols.ts')
                    ];
                    _i = 0, specialPaths_1 = specialPaths;
                    _b.label = 1;
                case 1:
                    if (!(_i < specialPaths_1.length)) return [3 /*break*/, 5];
                    filePath = specialPaths_1[_i];
                    return [4 /*yield*/, fileSystemService.writeFile(filePath, 'test content')];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, fileSystemService.fileExists(filePath)];
                case 3:
                    exists = _b.sent();
                    assert.ok(exists, "File ".concat(filePath, " should exist"));
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    _a = 0, specialPaths_2 = specialPaths;
                    _b.label = 6;
                case 6:
                    if (!(_a < specialPaths_2.length)) return [3 /*break*/, 9];
                    filePath = specialPaths_2[_a];
                    return [4 /*yield*/, fileSystemService.readFile(filePath)];
                case 7:
                    content = _b.sent();
                    assert.strictEqual(content, 'test content');
                    _b.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9: return [2 /*return*/];
            }
        });
    }); });
    test('recovers from partial writes and locks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testFile, content, tempHandle, writePromise, writtenContent, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testFile = path.join(testWorkspace, 'locked-file.txt');
                    content = 'Test content\n'.repeat(1000);
                    return [4 /*yield*/, fs.promises.open(testFile, 'w')];
                case 1:
                    tempHandle = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 5, 9]);
                    writePromise = fileSystemService.writeFile(testFile, content);
                    // Release lock after a delay
                    setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tempHandle.close()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 100);
                    // Wait for write to complete
                    return [4 /*yield*/, writePromise];
                case 3:
                    // Wait for write to complete
                    _a.sent();
                    return [4 /*yield*/, fileSystemService.readFile(testFile)];
                case 4:
                    writtenContent = _a.sent();
                    assert.strictEqual(writtenContent, content);
                    return [3 /*break*/, 9];
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, tempHandle.close()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_1 = _a.sent();
                    return [3 /*break*/, 8];
                case 8: return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); });
});
// Mock implementation of vscode.Memento for testing
var MockMemento = /** @class */ (function () {
    function MockMemento() {
        this.storage = new Map();
    }
    MockMemento.prototype.get = function (key, defaultValue) {
        return this.storage.has(key) ? this.storage.get(key) : defaultValue;
    };
    MockMemento.prototype.update = function (key, value) {
        this.storage.set(key, value);
        return Promise.resolve();
    };
    return MockMemento;
}());
