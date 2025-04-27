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
exports.VectorDatabaseManager = void 0;
exports.initializeVectorDatabaseManager = initializeVectorDatabaseManager;
exports.getVectorDatabaseManager = getVectorDatabaseManager;
var vscode = require("vscode");
var chromaProvider_1 = require("./chromaProvider");
var faissProvider_1 = require("./faissProvider");
/**
 * Manager for vector database providers
 */
var VectorDatabaseManager = /** @class */ (function () {
    function VectorDatabaseManager(context) {
        this.context = context;
        this.providers = new Map();
        this.activeProvider = null;
        this.isEnabled = false;
        // Register providers
        this.registerProvider(new chromaProvider_1.ChromaProvider(context));
        this.registerProvider(new faissProvider_1.FaissProvider(context));
    }
    /**
     * Register a provider
     */
    VectorDatabaseManager.prototype.registerProvider = function (provider) {
        this.providers.set(provider.name.toLowerCase(), provider);
    };
    /**
     * Get a list of available providers
     */
    VectorDatabaseManager.prototype.getProviders = function () {
        return Array.from(this.providers.values());
    };
    /**
     * Get a provider by name
     */
    VectorDatabaseManager.prototype.getProvider = function (name) {
        return this.providers.get(name.toLowerCase());
    };
    /**
     * Get the active provider
     */
    VectorDatabaseManager.prototype.getActiveProvider = function () {
        return this.activeProvider;
    };
    /**
     * Set the active provider
     */
    VectorDatabaseManager.prototype.setActiveProvider = function (name, options) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.activeProvider) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.activeProvider.close()];
                    case 1:
                        _a.sent();
                        this.activeProvider = null;
                        _a.label = 2;
                    case 2:
                        provider = this.getProvider(name);
                        if (!provider) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        // Initialize the provider
                        return [4 /*yield*/, provider.initialize(options)];
                    case 4:
                        // Initialize the provider
                        _a.sent();
                        this.activeProvider = provider;
                        return [2 /*return*/, true];
                    case 5:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to initialize ".concat(name, " provider: ").concat(error_1.message));
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enable/disable vector database functionality
     */
    VectorDatabaseManager.prototype.setEnabled = function (enabled) {
        this.isEnabled = enabled;
        vscode.commands.executeCommand('setContext', 'copilotPPA.vectorDatabaseEnabled', enabled);
    };
    /**
     * Check if vector database functionality is enabled
     */
    VectorDatabaseManager.prototype.isVectorDatabaseEnabled = function () {
        return this.isEnabled;
    };
    /**
     * Add a document to the database
     */
    VectorDatabaseManager.prototype.addDocument = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isEnabled || !this.activeProvider) {
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.activeProvider.addDocument(document)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Failed to add document: ".concat(error_2.message));
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add multiple documents to the database
     */
    VectorDatabaseManager.prototype.addDocuments = function (documents) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isEnabled || !this.activeProvider) {
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.activeProvider.addDocuments(documents)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_3 = _a.sent();
                        vscode.window.showErrorMessage("Failed to add documents: ".concat(error_3.message));
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search for similar documents
     */
    VectorDatabaseManager.prototype.search = function (query, options) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isEnabled || !this.activeProvider) {
                            return [2 /*return*/, []];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.activeProvider.search(query, options)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_4 = _a.sent();
                        vscode.window.showErrorMessage("Search failed: ".concat(error_4.message));
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get embedding for text
     */
    VectorDatabaseManager.prototype.getEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isEnabled || !this.activeProvider) {
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.activeProvider.getEmbedding(text)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_5 = _a.sent();
                        vscode.window.showErrorMessage("Failed to generate embedding: ".concat(error_5.message));
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close all providers
     */
    VectorDatabaseManager.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.activeProvider) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.activeProvider.close()];
                    case 1:
                        _a.sent();
                        this.activeProvider = null;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return VectorDatabaseManager;
}());
exports.VectorDatabaseManager = VectorDatabaseManager;
// Singleton instance
var vectorDatabaseManager = null;
/**
 * Initialize the vector database manager
 */
function initializeVectorDatabaseManager(context) {
    if (!vectorDatabaseManager) {
        vectorDatabaseManager = new VectorDatabaseManager(context);
    }
    return vectorDatabaseManager;
}
/**
 * Get the vector database manager instance
 */
function getVectorDatabaseManager() {
    if (!vectorDatabaseManager) {
        throw new Error('Vector Database Manager not initialized');
    }
    return vectorDatabaseManager;
}
