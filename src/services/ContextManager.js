"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ContextManager = void 0;
var vscode = require("vscode");
var ConversationService_1 = require("./conversation/ConversationService");
var FileStorageService_1 = require("./storage/FileStorageService");
var WorkspaceStateService_1 = require("./workspace/WorkspaceStateService");
/**
 * Manages context across the application with proper state management and persistence
 */
var ContextManager = /** @class */ (function () {
    function ContextManager(context, options) {
        if (options === void 0) { options = {}; }
        this.context = context;
        this.options = options;
        this.contextCache = new Map();
        this.eventEmitter = new vscode.EventEmitter();
        this.onDidChangeContext = this.eventEmitter.event;
        this.conversationService = new ConversationService_1.ConversationService(context);
        this.fileStorage = new FileStorageService_1.FileStorageService(context);
        this.workspaceState = new WorkspaceStateService_1.WorkspaceStateService(context);
        this.setupEventHandlers();
    }
    ContextManager.getInstance = function (context, options) {
        if (!ContextManager.instance && context) {
            ContextManager.instance = new ContextManager(context, options);
        }
        return ContextManager.instance;
    };
    ContextManager.prototype.setupEventHandlers = function () {
        var _this = this;
        vscode.workspace.onDidChangeWorkspaceFolders(function () { return _this.handleWorkspaceChange(); });
        vscode.window.onDidChangeActiveTextEditor(function () { return _this.handleActiveFileChange(); });
    };
    ContextManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                this.conversationService.initialize(),
                                this.fileStorage.initialize(),
                                this.workspaceState.initialize()
                            ])];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.loadPersistedContext()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to initialize ContextManager:', error_1);
                        throw new Error('Context initialization failed');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.getContext = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var persisted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.contextCache.has(id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fileStorage.loadContext(id)];
                    case 1:
                        persisted = _a.sent();
                        if (persisted) {
                            this.contextCache.set(id, persisted);
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.contextCache.get(id)];
                }
            });
        });
    };
    ContextManager.prototype.updateContext = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getContext(id)];
                    case 1:
                        existing = (_a.sent()) || {};
                        updated = __assign(__assign(__assign({}, existing), data), { updatedAt: Date.now() });
                        this.contextCache.set(id, updated);
                        return [4 /*yield*/, this.fileStorage.saveContext(id, updated)];
                    case 2:
                        _a.sent();
                        this.eventEmitter.fire(updated);
                        return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.getWorkspaceContext = function (workspaceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.workspaceState.getWorkspaceContext(workspaceId)];
            });
        });
    };
    ContextManager.prototype.updateWorkspaceContext = function (workspaceId, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.workspaceState.updateWorkspaceContext(workspaceId, context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.handleWorkspaceChange = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaces;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workspaces = vscode.workspace.workspaceFolders || [];
                        return [4 /*yield*/, Promise.all(workspaces.map(function (workspace) {
                                return _this.workspaceState.initializeWorkspace(workspace.uri.toString());
                            }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.handleActiveFileChange = function () {
        return __awaiter(this, void 0, void 0, function () {
            var editor, fileContext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        editor = vscode.window.activeTextEditor;
                        if (!editor) return [3 /*break*/, 2];
                        fileContext = {
                            path: editor.document.uri.toString(),
                            language: editor.document.languageId,
                            lastAccessed: Date.now()
                        };
                        return [4 /*yield*/, this.workspaceState.updateActiveFile(fileContext)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.loadPersistedContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            var contexts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fileStorage.loadAllContexts()];
                    case 1:
                        contexts = _a.sent();
                        contexts.forEach(function (_a) {
                            var id = _a.id, data = _a.data;
                            return _this.contextCache.set(id, data);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.getAllContextMetadata = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.contextCache.entries()).map(function (_a) {
                        var id = _a[0], data = _a[1];
                        return ({
                            id: id,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt,
                            type: data.type
                        });
                    })];
            });
        });
    };
    ContextManager.prototype.clearContext = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.contextCache.delete(id);
                        return [4 /*yield*/, this.fileStorage.deleteContext(id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.clearAllContexts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.contextCache.clear();
                        return [4 /*yield*/, this.fileStorage.clearAllContexts()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.workspaceState.clearAllWorkspaces()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContextManager.prototype.dispose = function () {
        this.eventEmitter.dispose();
        this.conversationService.dispose();
        this.fileStorage.dispose();
        this.workspaceState.dispose();
    };
    return ContextManager;
}());
exports.ContextManager = ContextManager;
