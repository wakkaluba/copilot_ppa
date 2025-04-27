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
exports.AgentToolManager = void 0;
var vscode = require("vscode");
var WorkspaceManager_1 = require("./WorkspaceManager");
var AgentToolManager = /** @class */ (function () {
    function AgentToolManager() {
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
    }
    AgentToolManager.getInstance = function () {
        if (!AgentToolManager.instance) {
            AgentToolManager.instance = new AgentToolManager();
        }
        return AgentToolManager.instance;
    };
    AgentToolManager.prototype.editFile = function (filePath, content, line) {
        return __awaiter(this, void 0, void 0, function () {
            var originalContent, newContent, approved, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.workspaceManager.readFile(filePath)];
                    case 1:
                        originalContent = _a.sent();
                        newContent = line !== undefined
                            ? this.replaceLineContent(originalContent, content, line)
                            : content;
                        return [4 /*yield*/, this.confirmChange(filePath, originalContent, newContent)];
                    case 2:
                        approved = _a.sent();
                        if (!approved) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.workspaceManager.writeFile(filePath, newContent)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.workspaceManager.formatDocumentAtPath(filePath)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to edit file: ".concat(error_1));
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AgentToolManager.prototype.createFile = function (filePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var approved, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.confirmChange(filePath, '', content)];
                    case 1:
                        approved = _a.sent();
                        if (!approved) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.workspaceManager.writeFile(filePath, content)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.workspaceManager.formatDocumentAtPath(filePath)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Failed to create file: ".concat(error_2));
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AgentToolManager.prototype.deleteFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, approved, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.workspaceManager.readFile(filePath)];
                    case 1:
                        content = _a.sent();
                        return [4 /*yield*/, this.confirmDelete(filePath, content)];
                    case 2:
                        approved = _a.sent();
                        if (!approved) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.workspaceManager.deleteFile(filePath)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_3 = _a.sent();
                        vscode.window.showErrorMessage("Failed to delete file: ".concat(error_3));
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AgentToolManager.prototype.explainFile = function (filePath, line) {
        return __awaiter(this, void 0, void 0, function () {
            var content, lines, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.workspaceManager.readFile(filePath)];
                    case 1:
                        content = _a.sent();
                        if (line !== undefined) {
                            lines = content.split('\n');
                            if (line > 0 && line <= lines.length) {
                                return [2 /*return*/, lines[line - 1]];
                            }
                        }
                        return [2 /*return*/, content];
                    case 2:
                        error_4 = _a.sent();
                        vscode.window.showErrorMessage("Failed to read file for explanation: ".concat(error_4));
                        return [2 /*return*/, ''];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AgentToolManager.prototype.searchWorkspace = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolder, files, results, _i, files_1, file, content, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        workspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0];
                        if (!workspaceFolder) {
                            throw new Error('No workspace folder found');
                        }
                        return [4 /*yield*/, vscode.workspace.findFiles('**/*', '**/node_modules/**')];
                    case 1:
                        files = _b.sent();
                        results = [];
                        _i = 0, files_1 = files;
                        _b.label = 2;
                    case 2:
                        if (!(_i < files_1.length)) return [3 /*break*/, 5];
                        file = files_1[_i];
                        return [4 /*yield*/, this.workspaceManager.readFile(file.fsPath)];
                    case 3:
                        content = _b.sent();
                        if (content.toLowerCase().includes(query.toLowerCase())) {
                            results.push(file.fsPath);
                        }
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, results];
                    case 6:
                        error_5 = _b.sent();
                        vscode.window.showErrorMessage("Search failed: ".concat(error_5));
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    AgentToolManager.prototype.confirmChange = function (filePath, oldContent, newContent) {
        return __awaiter(this, void 0, void 0, function () {
            var diff, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.commands.executeCommand('vscode.diff', vscode.Uri.parse('untitled:Original'), vscode.Uri.parse('untitled:Modified'), "Changes to ".concat(filePath), { preview: true })];
                    case 1:
                        diff = _a.sent();
                        return [4 /*yield*/, vscode.window.showWarningMessage("Do you want to apply these changes to ".concat(filePath, "?"), { modal: true }, 'Apply', 'Cancel')];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result === 'Apply'];
                }
            });
        });
    };
    AgentToolManager.prototype.confirmDelete = function (filePath, content) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.window.showWarningMessage("Are you sure you want to delete ".concat(filePath, "?"), { modal: true }, 'Delete', 'Cancel')];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result === 'Delete'];
                }
            });
        });
    };
    AgentToolManager.prototype.replaceLineContent = function (originalContent, newContent, line) {
        var lines = originalContent.split('\n');
        if (line > 0 && line <= lines.length) {
            lines[line - 1] = newContent;
        }
        return lines.join('\n');
    };
    return AgentToolManager;
}());
exports.AgentToolManager = AgentToolManager;
