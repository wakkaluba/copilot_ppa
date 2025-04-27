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
exports.CodeSearchService = void 0;
exports.initializeCodeSearchService = initializeCodeSearchService;
exports.getCodeSearchService = getCodeSearchService;
var vscode = require("vscode");
var manager_1 = require("./manager");
/**
 * Service for semantic code search functionality
 */
var CodeSearchService = /** @class */ (function () {
    function CodeSearchService(context) {
        this.context = context;
    }
    /**
     * Search for semantically similar code
     */
    CodeSearchService.prototype.semanticSearch = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, limit) {
            var manager;
            if (limit === void 0) { limit = 5; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager = (0, manager_1.getVectorDatabaseManager)();
                        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
                            throw new Error('Vector database is not enabled or no active provider');
                        }
                        return [4 /*yield*/, manager.search(query, { limit: limit })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get relevant code based on current context
     */
    CodeSearchService.prototype.getRelevantCode = function (context_1) {
        return __awaiter(this, arguments, void 0, function (context, limit) {
            var manager;
            if (limit === void 0) { limit = 3; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager = (0, manager_1.getVectorDatabaseManager)();
                        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
                            throw new Error('Vector database is not enabled or no active provider');
                        }
                        return [4 /*yield*/, manager.search(context, { limit: limit })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Index a single file
     */
    CodeSearchService.prototype.indexFile = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var manager, document_1, content, vectorDoc, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager = (0, manager_1.getVectorDatabaseManager)();
                        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, vscode.workspace.openTextDocument(file)];
                    case 2:
                        document_1 = _a.sent();
                        content = document_1.getText();
                        // Skip if empty or too large
                        if (!content || content.length > 100000) {
                            return [2 /*return*/, false];
                        }
                        vectorDoc = {
                            id: file.toString(),
                            content: content,
                            metadata: {
                                path: file.fsPath,
                                language: document_1.languageId,
                                lineCount: document_1.lineCount,
                                lastModified: new Date().toISOString()
                            }
                        };
                        return [4 /*yield*/, manager.addDocument(vectorDoc)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result !== null];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Failed to index file ".concat(file.fsPath, ":"), error_1);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Index multiple files
     */
    CodeSearchService.prototype.indexFiles = function (files) {
        return __awaiter(this, void 0, void 0, function () {
            var manager, successful, progressOptions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager = (0, manager_1.getVectorDatabaseManager)();
                        if (!manager.isVectorDatabaseEnabled() || !manager.getActiveProvider()) {
                            return [2 /*return*/, 0];
                        }
                        successful = 0;
                        progressOptions = {
                            location: vscode.ProgressLocation.Notification,
                            title: "Indexing files for semantic search",
                            cancellable: true
                        };
                        return [4 /*yield*/, vscode.window.withProgress(progressOptions, function (progress, token) { return __awaiter(_this, void 0, void 0, function () {
                                var total, batchSize, i, batch, documents, _i, batch_1, file, document_2, content, error_2, results;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            total = files.length;
                                            batchSize = 10;
                                            i = 0;
                                            _a.label = 1;
                                        case 1:
                                            if (!(i < total && !token.isCancellationRequested)) return [3 /*break*/, 11];
                                            batch = files.slice(i, i + batchSize);
                                            documents = [];
                                            _i = 0, batch_1 = batch;
                                            _a.label = 2;
                                        case 2:
                                            if (!(_i < batch_1.length)) return [3 /*break*/, 7];
                                            file = batch_1[_i];
                                            _a.label = 3;
                                        case 3:
                                            _a.trys.push([3, 5, , 6]);
                                            return [4 /*yield*/, vscode.workspace.openTextDocument(file)];
                                        case 4:
                                            document_2 = _a.sent();
                                            content = document_2.getText();
                                            // Skip if empty or too large
                                            if (!content || content.length > 100000) {
                                                return [3 /*break*/, 6];
                                            }
                                            documents.push({
                                                id: file.toString(),
                                                content: content,
                                                metadata: {
                                                    path: file.fsPath,
                                                    language: document_2.languageId,
                                                    lineCount: document_2.lineCount,
                                                    lastModified: new Date().toISOString()
                                                }
                                            });
                                            return [3 /*break*/, 6];
                                        case 5:
                                            error_2 = _a.sent();
                                            console.error("Failed to read file ".concat(file.fsPath, ":"), error_2);
                                            return [3 /*break*/, 6];
                                        case 6:
                                            _i++;
                                            return [3 /*break*/, 2];
                                        case 7:
                                            if (!(documents.length > 0)) return [3 /*break*/, 9];
                                            return [4 /*yield*/, manager.addDocuments(documents)];
                                        case 8:
                                            results = _a.sent();
                                            if (results) {
                                                successful += results.length;
                                            }
                                            _a.label = 9;
                                        case 9:
                                            // Update progress
                                            progress.report({
                                                message: "Indexed ".concat(successful, " files"),
                                                increment: (batch.length / total) * 100
                                            });
                                            _a.label = 10;
                                        case 10:
                                            i += batchSize;
                                            return [3 /*break*/, 1];
                                        case 11: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, successful];
                }
            });
        });
    };
    /**
     * Index the current workspace
     */
    CodeSearchService.prototype.indexWorkspace = function () {
        return __awaiter(this, arguments, void 0, function (includePattern, excludePattern) {
            var files;
            if (includePattern === void 0) { includePattern = '**/*.{js,ts,jsx,tsx,py,java,c,cpp,h,hpp,cs,go,rust}'; }
            if (excludePattern === void 0) { excludePattern = '**/node_modules/**,**/dist/**,**/build/**,**/.git/**'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.findFiles(includePattern, excludePattern)];
                    case 1:
                        files = _a.sent();
                        return [4 /*yield*/, this.indexFiles(files)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return CodeSearchService;
}());
exports.CodeSearchService = CodeSearchService;
// Singleton instance
var codeSearchService = null;
/**
 * Initialize the code search service
 */
function initializeCodeSearchService(context) {
    if (!codeSearchService) {
        codeSearchService = new CodeSearchService(context);
    }
    return codeSearchService;
}
/**
 * Get the code search service instance
 */
function getCodeSearchService() {
    if (!codeSearchService) {
        throw new Error('Code Search Service not initialized');
    }
    return codeSearchService;
}
