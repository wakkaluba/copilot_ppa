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
exports.WorkspaceManager = void 0;
var vscode = require("vscode");
var logger_1 = require("../utils/logger"); // Fixed lowercase import
/**
 * Manages workspace-related operations such as file reading/writing
 * and directory listing.
 */
var WorkspaceManager = /** @class */ (function () {
    function WorkspaceManager() {
        this.logger = logger_1.Logger.getInstance();
    }
    /**
     * Gets the singleton instance of WorkspaceManager
     */
    WorkspaceManager.getInstance = function () {
        if (!WorkspaceManager.instance) {
            WorkspaceManager.instance = new WorkspaceManager();
        }
        return WorkspaceManager.instance;
    };
    /**
     * Set logger for testing purposes
     * @param logger Logger instance
     */
    WorkspaceManager.prototype.setLogger = function (logger) {
        this.logger = logger;
    };
    /**
     * Read file content as string
     * @param uri The URI of the file to read
     * @returns Contents of the file as string
     */
    WorkspaceManager.prototype.readFile = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var content, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.workspace.fs.readFile(uri)];
                    case 1:
                        content = _a.sent();
                        return [2 /*return*/, new TextDecoder().decode(content)];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error("Failed to read file ".concat(uri.fsPath, ":"), error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Write content to a file
     * @param uri The URI of the file to write to
     * @param content Content to write
     */
    WorkspaceManager.prototype.writeFile = function (uri, content) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.workspace.fs.writeFile(uri, Buffer.from(content))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error("Failed to write file ".concat(uri.fsPath, ":"), error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * List the contents of a directory
     * @param uri The URI of the directory
     * @returns Array of directory entries
     */
    WorkspaceManager.prototype.listDirectory = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.workspace.fs.readDirectory(uri)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error("Failed to list directory ".concat(uri.fsPath, ":"), error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if a file exists
     * @param uri The URI of the file to check
     * @returns true if the file exists
     */
    WorkspaceManager.prototype.fileExists = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.workspace.fs.stat(uri)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get workspace folders
     * @returns Array of workspace folders
     */
    WorkspaceManager.prototype.getWorkspaceFolders = function () {
        return vscode.workspace.workspaceFolders;
    };
    /**
     * Find files in the workspace matching a pattern
     * @param include glob pattern to match files
     * @param exclude glob pattern to exclude files
     * @param maxResults max number of results
     * @returns Array of found file URIs
     */
    WorkspaceManager.prototype.findFiles = function (include, exclude, maxResults) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.workspace.findFiles(include, exclude, maxResults)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.error("Error finding files with pattern ".concat(include, ":"), error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a directory
     * @param uri The URI of the directory to create
     */
    WorkspaceManager.prototype.createDirectory = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.workspace.fs.createDirectory(uri)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        this.logger.error("Error creating directory ".concat(uri.fsPath, ":"), error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WorkspaceManager.prototype.getConfiguration = function (section, key, defaultValue) {
        var config = vscode.workspace.getConfiguration(section);
        return config.get(key, defaultValue);
    };
    /**
     * Update configuration value
     * @param section Configuration section
     * @param key Configuration key
     * @param value New value
     * @param target Configuration target (default: Workspace)
     */
    WorkspaceManager.prototype.updateConfiguration = function (section_1, key_1, value_1) {
        return __awaiter(this, arguments, void 0, function (section, key, value, target) {
            var config, error_6;
            if (target === void 0) { target = vscode.ConfigurationTarget.Workspace; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        config = vscode.workspace.getConfiguration(section);
                        return [4 /*yield*/, config.update(key, value, target)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        this.logger.error("Error updating configuration ".concat(section, ".").concat(key, ":"), error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a file
     * @param uri The URI of the file to delete
     */
    WorkspaceManager.prototype.deleteFile = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.workspace.fs.delete(uri)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        this.logger.error("Failed to delete file ".concat(uri.fsPath, ":"), error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * List files in a directory
     * @param directoryPath The path of the directory to list files from
     * @returns Array of file paths
     */
    WorkspaceManager.prototype.listFiles = function (directoryPath) {
        return __awaiter(this, void 0, void 0, function () {
            var uri, entries, error_8;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        uri = vscode.Uri.joinPath(((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri) || vscode.Uri.file('.'), directoryPath);
                        return [4 /*yield*/, this.listDirectory(uri)];
                    case 1:
                        entries = _b.sent();
                        return [2 /*return*/, entries
                                .filter(function (_a) {
                                var _ = _a[0], type = _a[1];
                                return type === vscode.FileType.File;
                            })
                                .map(function (_a) {
                                var name = _a[0], _ = _a[1];
                                return "".concat(directoryPath, "/").concat(name);
                            })];
                    case 2:
                        error_8 = _b.sent();
                        this.logger.error("Failed to list files in ".concat(directoryPath, ":"), error_8);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return WorkspaceManager;
}());
exports.WorkspaceManager = WorkspaceManager;
