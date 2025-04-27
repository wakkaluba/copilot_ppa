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
exports.TestWorkspace = void 0;
var vscode = require("vscode");
var path = require("path");
var os = require("os");
var fs = require("fs/promises");
/**
 * TestWorkspace provides a temporary workspace for testing
 * with utility methods for file operations
 */
var TestWorkspace = /** @class */ (function () {
    function TestWorkspace() {
        this.workspacePath = '';
    }
    /**
     * Sets up a temporary workspace for testing
     */
    TestWorkspace.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tmpDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.mkdtemp(path.join(os.tmpdir(), 'copilot-ppa-test-'))];
                    case 1:
                        tmpDir = _a.sent();
                        this.workspacePath = tmpDir;
                        // Create basic workspace structure
                        return [4 /*yield*/, fs.mkdir(path.join(this.workspacePath, 'src'))];
                    case 2:
                        // Create basic workspace structure
                        _a.sent();
                        return [4 /*yield*/, fs.mkdir(path.join(this.workspacePath, 'test'))];
                    case 3:
                        _a.sent();
                        // Create a basic package.json
                        return [4 /*yield*/, this.writeFile('package.json', JSON.stringify({
                                name: 'test-workspace',
                                version: '1.0.0',
                                private: true
                            }, null, 2))];
                    case 4:
                        // Create a basic package.json
                        _a.sent();
                        // Create tsconfig.json
                        return [4 /*yield*/, this.writeFile('tsconfig.json', JSON.stringify({
                                compilerOptions: {
                                    target: "ES2020",
                                    module: "commonjs",
                                    strict: true,
                                    esModuleInterop: true,
                                    skipLibCheck: true,
                                    forceConsistentCasingInFileNames: true
                                }
                            }, null, 2))];
                    case 5:
                        // Create tsconfig.json
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cleans up the temporary workspace
     */
    TestWorkspace.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.workspacePath) return [3 /*break*/, 2];
                        return [4 /*yield*/, fs.rm(this.workspacePath, { recursive: true, force: true })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new file in the workspace
     */
    TestWorkspace.prototype.createFile = function (relativePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = path.join(this.workspacePath, relativePath);
                        return [4 /*yield*/, fs.mkdir(path.dirname(fullPath), { recursive: true })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fs.writeFile(fullPath, content, 'utf8')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Writes content to a file in the workspace
     */
    TestWorkspace.prototype.writeFile = function (relativePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = path.join(this.workspacePath, relativePath);
                        return [4 /*yield*/, fs.mkdir(path.dirname(fullPath), { recursive: true })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fs.writeFile(fullPath, content, 'utf8')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reads the content of a file in the workspace
     */
    TestWorkspace.prototype.fileContent = function (relativePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = path.join(this.workspacePath, relativePath);
                        return [4 /*yield*/, fs.readFile(fullPath, 'utf8')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Checks if a file exists in the workspace
     */
    TestWorkspace.prototype.fileExists = function (relativePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fullPath = path.join(this.workspacePath, relativePath);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.access(fullPath)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lists files in a directory in the workspace
     */
    TestWorkspace.prototype.listFiles = function () {
        return __awaiter(this, arguments, void 0, function (relativePath) {
            var fullPath, files;
            if (relativePath === void 0) { relativePath = '.'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = path.join(this.workspacePath, relativePath);
                        return [4 /*yield*/, fs.readdir(fullPath)];
                    case 1:
                        files = _a.sent();
                        return [2 /*return*/, files.filter(function (f) { return !f.startsWith('.'); })];
                }
            });
        });
    };
    /**
     * Gets the absolute path of a file in the workspace
     */
    TestWorkspace.prototype.getFilePath = function (relativePath) {
        return path.join(this.workspacePath, relativePath);
    };
    /**
     * Gets the workspace path
     */
    TestWorkspace.prototype.getWorkspacePath = function () {
        return this.workspacePath;
    };
    /**
     * Gets a VS Code URI for a file in the workspace
     */
    TestWorkspace.prototype.getFileUri = function (relativePath) {
        return vscode.Uri.file(this.getFilePath(relativePath));
    };
    /**
     * Deletes a file from the workspace
     */
    TestWorkspace.prototype.deleteFile = function (relativePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = path.join(this.workspacePath, relativePath);
                        return [4 /*yield*/, fs.unlink(fullPath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return TestWorkspace;
}());
exports.TestWorkspace = TestWorkspace;
