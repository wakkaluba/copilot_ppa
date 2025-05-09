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
exports.CodeExecutorService = void 0;
var vscode = require("vscode");
var os = require("os");
var path = require("path");
var CodeExecutorService = /** @class */ (function () {
    function CodeExecutorService() {
    }
    /**
     * Executes selected code in the active editor
     */
    CodeExecutorService.prototype.executeSelectedCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, selection, selectedText, language, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) {
                            vscode.window.showErrorMessage('No active editor found');
                            return [2 /*return*/];
                        }
                        selection = editor.selection;
                        if (selection.isEmpty) {
                            vscode.window.showErrorMessage('No code selected');
                            return [2 /*return*/];
                        }
                        selectedText = editor.document.getText(selection);
                        language = editor.document.languageId;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.executeInTerminal(selectedText, language)];
                    case 2:
                        _a.sent();
                        vscode.window.showInformationMessage('Code executed successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to execute code: ".concat(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes code in the appropriate terminal based on language
     */
    CodeExecutorService.prototype.executeInTerminal = function (code, language) {
        return __awaiter(this, void 0, void 0, function () {
            var terminal, command, tempFile, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Code Execution');
                        terminal.show();
                        command = '';
                        tempFile = '';
                        _a = language;
                        switch (_a) {
                            case 'javascript': return [3 /*break*/, 1];
                            case 'typescript': return [3 /*break*/, 1];
                            case 'python': return [3 /*break*/, 3];
                            case 'shellscript': return [3 /*break*/, 5];
                            case 'bash': return [3 /*break*/, 5];
                            case 'powershell': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.createTempFile(code, '.js')];
                    case 2:
                        tempFile = _b.sent();
                        command = "node \"".concat(tempFile, "\"");
                        return [3 /*break*/, 10];
                    case 3: return [4 /*yield*/, this.createTempFile(code, '.py')];
                    case 4:
                        tempFile = _b.sent();
                        command = "python \"".concat(tempFile, "\"");
                        return [3 /*break*/, 10];
                    case 5: return [4 /*yield*/, this.createTempFile(code, '.sh')];
                    case 6:
                        tempFile = _b.sent();
                        command = "bash \"".concat(tempFile, "\"");
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.createTempFile(code, '.ps1')];
                    case 8:
                        tempFile = _b.sent();
                        command = "powershell -File \"".concat(tempFile, "\"");
                        return [3 /*break*/, 10];
                    case 9: throw new Error("Unsupported language: ".concat(language));
                    case 10:
                        terminal.sendText(command);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a temporary file with the given code
     */
    CodeExecutorService.prototype.createTempFile = function (content, extension) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, tempDir, fileName, filePath, uri, uint8Array;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fs = vscode.workspace.fs;
                        tempDir = os.tmpdir();
                        fileName = "vscode-exec-".concat(Date.now()).concat(extension);
                        filePath = path.join(tempDir, fileName);
                        uri = vscode.Uri.file(filePath);
                        uint8Array = new TextEncoder().encode(content);
                        // Track this temporary file for cleanup
                        this.trackTempFile(filePath);
                        return [4 /*yield*/, fs.writeFile(uri, uint8Array)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, filePath];
                }
            });
        });
    };
    /**
     * Keeps track of temporary files for later cleanup
     */
    CodeExecutorService.prototype.trackTempFile = function (filePath) {
        if (!this.tempFiles) {
            this.tempFiles = [];
            // Initialize cleanup mechanism if this is the first temp file
            this.setupTempFileCleanup();
        }
        this.tempFiles.push({
            path: filePath,
            created: Date.now()
        });
    };
    /**
     * Sets up periodic cleanup of temporary files
     */
    CodeExecutorService.prototype.setupTempFileCleanup = function () {
        var _this = this;
        // Clean up temp files when VS Code is about to close
        this.disposables.push(vscode.workspace.onDidChangeWorkspaceFolders(function() {
            _this.cleanupTempFiles();
        }));

        // Also clean up periodically (every hour)
        this.cleanupInterval = setInterval(function() {
            _this.cleanupTempFiles(3600000); // 1 hour in milliseconds
        }, 3600000);

        // Make sure the interval is cleared when the extension is deactivated
        this.disposables.push({ dispose: function() {
            if (_this.cleanupInterval) {
                clearInterval(_this.cleanupInterval);
                _this.cleanupInterval = undefined;
            }
            _this.cleanupTempFiles();
        }});
    };
    /**
     * Cleans up temporary files
     * @param {number} maxAge Optional maximum age in milliseconds
     */
    CodeExecutorService.prototype.cleanupTempFiles = function (maxAge) {
        var _this = this;
        if (!this.tempFiles || this.tempFiles.length === 0) {
            return;
        }

        var now = Date.now();
        var fs = vscode.workspace.fs;

        // Keep track of which files were successfully deleted
        var remainingFiles = this.tempFiles.filter(function(file) {
            // Skip files that aren't old enough to delete
            if (maxAge && (now - file.created) < maxAge) {
                return true;
            }

            try {
                // Try to delete the file
                fs.delete(vscode.Uri.file(file.path), { useTrash: false });
                return false; // File deleted successfully
            } catch (error) {
                // If deletion fails, keep the file in our tracking list
                return true;
            }
        });

        this.tempFiles = remainingFiles;
    };
    // Add to dispose method
    var originalDispose = CodeExecutorService.prototype.dispose;
    CodeExecutorService.prototype.dispose = function () {
        if (originalDispose) {
            originalDispose.call(this);
        }

        // Clean up all temp files on dispose
        this.cleanupTempFiles();

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    };
    // Initialize disposables array in constructor if it doesn't exist
    var originalConstructor = CodeExecutorService;
    CodeExecutorService = function () {
        originalConstructor.apply(this, arguments);
        if (!this.disposables) {
            this.disposables = [];
        }
    };
    CodeExecutorService.prototype = originalConstructor.prototype;
    return CodeExecutorService;
}());
exports.CodeExecutorService = CodeExecutorService;
