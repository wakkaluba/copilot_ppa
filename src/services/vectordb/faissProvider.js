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
exports.FaissProvider = void 0;
var LoggerService_1 = require("../LoggerService");
var FaissProviderService_1 = require("./services/FaissProviderService");
/**
 * Provides FAISS vector database functionality with comprehensive error handling
 */
var FaissProvider = /** @class */ (function () {
    function FaissProvider(context) {
        this.name = 'FAISS';
        this.disposed = false;
        this.service = new FaissProviderService_1.FaissProviderService(context);
        this.logger = LoggerService_1.LoggerService.getInstance();
    }
    Object.defineProperty(FaissProvider.prototype, "isAvailable", {
        get: function () {
            try {
                return this.service.isAvailable;
            }
            catch (error) {
                this.handleError('Failed to check availability', error);
                return false;
            }
        },
        enumerable: false,
        configurable: true
    });
    FaissProvider.prototype.initialize = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.validateInitialization();
                        return [4 /*yield*/, this.service.initialize(options)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError('Failed to initialize FAISS provider', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.addDocument = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.validateDocument(document);
                        return [4 /*yield*/, this.service.addDocument(document)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError('Failed to add document', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.addDocuments = function (documents) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        documents.forEach(this.validateDocument.bind(this));
                        return [4 /*yield*/, this.service.addDocuments(documents)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        this.handleError('Failed to add multiple documents', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.getDocument = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.validateId(id);
                        return [4 /*yield*/, this.service.getDocument(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        this.handleError("Failed to get document: ".concat(id), error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.updateDocument = function (id, document) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.validateId(id);
                        this.validatePartialDocument(document);
                        return [4 /*yield*/, this.service.updateDocument(id, document)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        this.handleError("Failed to update document: ".concat(id), error_5);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.deleteDocument = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.validateId(id);
                        return [4 /*yield*/, this.service.deleteDocument(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        this.handleError("Failed to delete document: ".concat(id), error_6);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.deleteAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.service.deleteAll()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        this.handleError('Failed to delete all documents', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.search = function (query, options) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.validateQuery(query);
                        return [4 /*yield*/, this.service.search(query, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_8 = _a.sent();
                        this.handleError('Failed to execute search', error_8);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.getEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.validateText(text);
                        return [4 /*yield*/, this.service.getEmbedding(text)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_9 = _a.sent();
                        this.handleError('Failed to get embedding', error_9);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.service.close()];
                    case 1:
                        _a.sent();
                        this.disposed = true;
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        this.handleError('Failed to close FAISS provider', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FaissProvider.prototype.validateInitialization = function () {
        if (this.disposed) {
            throw new Error('FAISS provider has been disposed');
        }
    };
    FaissProvider.prototype.validateDocument = function (document) {
        if (!document || typeof document !== 'object') {
            throw new Error('Invalid document format');
        }
    };
    FaissProvider.prototype.validatePartialDocument = function (document) {
        if (!document || typeof document !== 'object') {
            throw new Error('Invalid partial document format');
        }
    };
    FaissProvider.prototype.validateId = function (id) {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid document ID');
        }
    };
    FaissProvider.prototype.validateQuery = function (query) {
        if (typeof query !== 'string' && !Array.isArray(query)) {
            throw new Error('Invalid query format');
        }
        if (Array.isArray(query) && !query.every(function (n) { return typeof n === 'number'; })) {
            throw new Error('Query vector must contain only numbers');
        }
    };
    FaissProvider.prototype.validateText = function (text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text input');
        }
    };
    FaissProvider.prototype.handleError = function (message, error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error("FaissProvider: ".concat(message), errorMessage);
        // Don't throw here - let the calling method decide how to handle the error
    };
    return FaissProvider;
}());
exports.FaissProvider = FaissProvider;
