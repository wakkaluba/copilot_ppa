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
var vscode = require("vscode");
var manager_1 = require("../../../../src/services/vectordb/manager");
jest.mock('vscode');
describe('VectorDatabaseManager', function () {
    var manager;
    var mockContext;
    var mockProvider1;
    var mockProvider2;
    beforeEach(function () {
        // Setup mock context
        mockContext = {
            subscriptions: []
        };
        // Setup mock providers
        mockProvider1 = {
            name: 'provider1',
            initialize: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined),
            addDocument: jest.fn().mockResolvedValue('doc1'),
            addDocuments: jest.fn().mockResolvedValue(['doc1', 'doc2']),
            search: jest.fn().mockResolvedValue([
                { document: { id: 'doc1', content: 'test1' }, score: 0.9 }
            ]),
            getEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3])
        };
        mockProvider2 = {
            name: 'provider2',
            initialize: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined),
            addDocument: jest.fn().mockResolvedValue('doc2'),
            addDocuments: jest.fn().mockResolvedValue(['doc3', 'doc4']),
            search: jest.fn().mockResolvedValue([
                { document: { id: 'doc2', content: 'test2' }, score: 0.8 }
            ]),
            getEmbedding: jest.fn().mockResolvedValue([0.4, 0.5, 0.6])
        };
        // Create manager instance
        manager = new manager_1.VectorDatabaseManager(mockContext);
    });
    describe('Provider Management', function () {
        test('should register providers', function () {
            manager.registerProvider(mockProvider1);
            manager.registerProvider(mockProvider2);
            var providers = manager.getProviders();
            expect(providers).toHaveLength(2);
            expect(providers).toContain(mockProvider1);
            expect(providers).toContain(mockProvider2);
        });
        test('should get provider by name', function () {
            manager.registerProvider(mockProvider1);
            manager.registerProvider(mockProvider2);
            var provider1 = manager.getProvider('provider1');
            var provider2 = manager.getProvider('provider2');
            var nonexistent = manager.getProvider('nonexistent');
            expect(provider1).toBe(mockProvider1);
            expect(provider2).toBe(mockProvider2);
            expect(nonexistent).toBeUndefined();
        });
        test('should set active provider', function () { return __awaiter(void 0, void 0, void 0, function () {
            var options, success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager.registerProvider(mockProvider1);
                        manager.registerProvider(mockProvider2);
                        options = {
                            dimensions: 768,
                            metric: 'cosine'
                        };
                        return [4 /*yield*/, manager.setActiveProvider('provider1', options)];
                    case 1:
                        success = _a.sent();
                        expect(success).toBe(true);
                        expect(mockProvider1.initialize).toHaveBeenCalledWith(options);
                        expect(manager.getActiveProvider()).toBe(mockProvider1);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle provider initialization failure', function () { return __awaiter(void 0, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager.registerProvider(mockProvider1);
                        mockProvider1.initialize.mockRejectedValue(new Error('Init failed'));
                        return [4 /*yield*/, manager.setActiveProvider('provider1')];
                    case 1:
                        success = _a.sent();
                        expect(success).toBe(false);
                        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to initialize provider1'));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Document Management', function () {
        beforeEach(function () {
            manager.registerProvider(mockProvider1);
            manager.setEnabled(true);
            manager.setActiveProvider('provider1');
        });
        test('should add single document', function () { return __awaiter(void 0, void 0, void 0, function () {
            var doc, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doc = {
                            id: 'doc1',
                            content: 'test content',
                            metadata: { type: 'test' }
                        };
                        return [4 /*yield*/, manager.addDocument(doc)];
                    case 1:
                        id = _a.sent();
                        expect(id).toBe('doc1');
                        expect(mockProvider1.addDocument).toHaveBeenCalledWith(doc);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should add multiple documents', function () { return __awaiter(void 0, void 0, void 0, function () {
            var docs, ids;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        docs = [
                            { id: 'doc1', content: 'test1' },
                            { id: 'doc2', content: 'test2' }
                        ];
                        return [4 /*yield*/, manager.addDocuments(docs)];
                    case 1:
                        ids = _a.sent();
                        expect(ids).toEqual(['doc1', 'doc2']);
                        expect(mockProvider1.addDocuments).toHaveBeenCalledWith(docs);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle document addition errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockProvider1.addDocument.mockRejectedValue(new Error('Add failed'));
                        return [4 /*yield*/, manager.addDocument({ id: 'doc1', content: 'test' })];
                    case 1:
                        id = _a.sent();
                        expect(id).toBeNull();
                        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to add document'));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Search Functionality', function () {
        beforeEach(function () {
            manager.registerProvider(mockProvider1);
            manager.setEnabled(true);
            manager.setActiveProvider('provider1');
        });
        test('should search with text query', function () { return __awaiter(void 0, void 0, void 0, function () {
            var query, options, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = 'test query';
                        options = {
                            limit: 10,
                            minScore: 0.5
                        };
                        return [4 /*yield*/, manager.search(query, options)];
                    case 1:
                        results = _a.sent();
                        expect(results).toHaveLength(1);
                        expect(mockProvider1.search).toHaveBeenCalledWith(query, options);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should search with vector query', function () { return __awaiter(void 0, void 0, void 0, function () {
            var query, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = [0.1, 0.2, 0.3];
                        return [4 /*yield*/, manager.search(query)];
                    case 1:
                        results = _a.sent();
                        expect(results).toHaveLength(1);
                        expect(mockProvider1.search).toHaveBeenCalledWith(query, undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle search errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockProvider1.search.mockRejectedValue(new Error('Search failed'));
                        return [4 /*yield*/, manager.search('test')];
                    case 1:
                        results = _a.sent();
                        expect(results).toEqual([]);
                        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Search failed'));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Embedding Generation', function () {
        beforeEach(function () {
            manager.registerProvider(mockProvider1);
            manager.setEnabled(true);
            manager.setActiveProvider('provider1');
        });
        test('should generate embeddings', function () { return __awaiter(void 0, void 0, void 0, function () {
            var text, embedding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        text = 'test text';
                        return [4 /*yield*/, manager.getEmbedding(text)];
                    case 1:
                        embedding = _a.sent();
                        expect(embedding).toEqual([0.1, 0.2, 0.3]);
                        expect(mockProvider1.getEmbedding).toHaveBeenCalledWith(text);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle embedding errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var embedding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockProvider1.getEmbedding.mockRejectedValue(new Error('Embedding failed'));
                        return [4 /*yield*/, manager.getEmbedding('test')];
                    case 1:
                        embedding = _a.sent();
                        expect(embedding).toBeNull();
                        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to generate embedding'));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Enable/Disable Functionality', function () {
        beforeEach(function () {
            manager.registerProvider(mockProvider1);
        });
        test('should handle disabled state', function () { return __awaiter(void 0, void 0, void 0, function () {
            var searchResults, embedding, docId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager.setEnabled(false);
                        return [4 /*yield*/, manager.setActiveProvider('provider1')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, manager.search('test')];
                    case 2:
                        searchResults = _a.sent();
                        return [4 /*yield*/, manager.getEmbedding('test')];
                    case 3:
                        embedding = _a.sent();
                        return [4 /*yield*/, manager.addDocument({ id: 'doc1', content: 'test' })];
                    case 4:
                        docId = _a.sent();
                        expect(searchResults).toEqual([]);
                        expect(embedding).toBeNull();
                        expect(docId).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should enable/disable functionality', function () {
            manager.setEnabled(true);
            expect(manager.isVectorDatabaseEnabled()).toBe(true);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('setContext', 'copilotPPA.vectorDatabaseEnabled', true);
            manager.setEnabled(false);
            expect(manager.isVectorDatabaseEnabled()).toBe(false);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('setContext', 'copilotPPA.vectorDatabaseEnabled', false);
        });
    });
    describe('Cleanup', function () {
        test('should close active provider', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        manager.registerProvider(mockProvider1);
                        return [4 /*yield*/, manager.setActiveProvider('provider1')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, manager.close()];
                    case 2:
                        _a.sent();
                        expect(mockProvider1.close).toHaveBeenCalled();
                        expect(manager.getActiveProvider()).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
