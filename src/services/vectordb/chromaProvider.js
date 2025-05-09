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
exports.ChromaProvider = void 0;
var vscode = require("vscode");
var ChromaClientService_1 = require("./services/ChromaClientService");
var ChromaEmbeddingService_1 = require("./services/ChromaEmbeddingService");
var ChromaDocumentService_1 = require("./services/ChromaDocumentService");
var ChromaProvider = /** @class */ (function () {
    function ChromaProvider(context) {
        this.name = 'Chroma';
        this.clientService = new ChromaClientService_1.ChromaClientService(context);
        this.embeddingService = new ChromaEmbeddingService_1.ChromaEmbeddingService();
        this.documentService = new ChromaDocumentService_1.ChromaDocumentService();
    }
    Object.defineProperty(ChromaProvider.prototype, "isAvailable", {
        get: function () {
            return this.clientService.isAvailable;
        },
        enumerable: false,
        configurable: true
    });
    ChromaProvider.prototype.initialize = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.clientService.initialize()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.embeddingService.initialize()];
                    case 2:
                        _a.sent();
                        this.documentService.setCollection(this.clientService.getCollection());
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to initialize Chroma: ".concat(error_1.message));
                        console.error('Chroma initialization error:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ChromaProvider.prototype.addDocument = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var embedding, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isAvailable) {
                            throw new Error('Chroma is not initialized');
                        }
                        _a = document.embedding;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getEmbedding(document.content)];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        embedding = _a;
                        return [2 /*return*/, this.documentService.addDocument(__assign(__assign({}, document), { embedding: embedding }))];
                }
            });
        });
    };
    ChromaProvider.prototype.addDocuments = function (documents) {
        return __awaiter(this, void 0, void 0, function () {
            var processedDocs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isAvailable) {
                            throw new Error('Chroma is not initialized');
                        }
                        return [4 /*yield*/, Promise.all(documents.map(function (doc) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                var _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _a = [__assign({}, doc)];
                                            _c = {};
                                            _b = doc.embedding;
                                            if (_b) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.getEmbedding(doc.content)];
                                        case 1:
                                            _b = (_d.sent());
                                            _d.label = 2;
                                        case 2: return [2 /*return*/, (__assign.apply(void 0, _a.concat([(_c.embedding = _b, _c)])))];
                                    }
                                });
                            }); }))];
                    case 1:
                        processedDocs = _a.sent();
                        return [2 /*return*/, this.documentService.addDocuments(processedDocs)];
                }
            });
        });
    };
    ChromaProvider.prototype.getDocument = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.isAvailable) {
                    throw new Error('Chroma is not initialized');
                }
                return [2 /*return*/, this.documentService.getDocument(id)];
            });
        });
    };
    ChromaProvider.prototype.updateDocument = function (id, document) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isAvailable) {
                            throw new Error('Chroma is not initialized');
                        }
                        if (!(document.content && !document.embedding)) return [3 /*break*/, 2];
                        _a = document;
                        return [4 /*yield*/, this.getEmbedding(document.content)];
                    case 1:
                        _a.embedding = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.documentService.updateDocument(id, document)];
                }
            });
        });
    };
    ChromaProvider.prototype.deleteDocument = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.isAvailable) {
                    throw new Error('Chroma is not initialized');
                }
                return [2 /*return*/, this.documentService.deleteDocument(id)];
            });
        });
    };
    ChromaProvider.prototype.deleteAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isAvailable) {
                            throw new Error('Chroma is not initialized');
                        }
                        return [4 /*yield*/, this.documentService.deleteAll()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ChromaProvider.prototype.search = function (query, options) {
        return __awaiter(this, void 0, void 0, function () {
            var queryEmbedding, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.isAvailable) {
                            throw new Error('Chroma is not initialized');
                        }
                        if (!Array.isArray(query)) return [3 /*break*/, 1];
                        _a = query;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getEmbedding(query)];
                    case 2:
                        _a = _b.sent();
                        _b.label = 3;
                    case 3:
                        queryEmbedding = _a;
                        return [2 /*return*/, this.documentService.search(queryEmbedding, options)];
                }
            });
        });
    };
    ChromaProvider.prototype.getEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.embeddingService.generateEmbedding(text)];
            });
        });
    };
    ChromaProvider.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.clientService.close()];
                    case 1:
                        _a.sent();
                        this.documentService.reset();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ChromaProvider;
}());
exports.ChromaProvider = ChromaProvider;
