"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var ConversationMetadata_1 = require("../../services/ConversationMetadata");
var WorkspaceManager_1 = require("../../services/WorkspaceManager");
suite('ConversationMetadata Tests', function () {
    var conversationMetadata;
    var workspaceManagerStub;
    var sandbox;
    var TEST_METADATA_PATH = '.conversation-metadata.json';
    setup(function () {
        sandbox = sinon.createSandbox();
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        conversationMetadata = new ConversationMetadata_1.ConversationMetadata();
    });
    teardown(function () {
        sandbox.restore();
    });
    test('should track conversation duration', function () {
        var conversationId = 'test-duration';
        var startTime = Date.now();
        conversationMetadata.startConversation(conversationId, startTime);
        var duration = conversationMetadata.getConversationDuration(conversationId);
        assert.ok(duration >= 0);
        assert.ok(duration < 1000); // Should be very small in test
    });
    test('should maintain conversation statistics', function () {
        var stats = {
            messageCount: 10,
            userMessages: 5,
            assistantMessages: 5,
            averageResponseTime: 1000,
            topicsDiscussed: ['typescript', 'testing']
        };
        conversationMetadata.updateStatistics('test-stats', stats);
        var retrieved = conversationMetadata.getStatistics('test-stats');
        assert.deepStrictEqual(retrieved, stats);
    });
    test('should persist metadata changes', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var metadata, loaded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        metadata = {
                            id: 'test-persist',
                            statistics: { messageCount: 5 },
                            duration: 1000,
                            lastAccessed: Date.now()
                        };
                        workspaceManagerStub.writeFile.resolves();
                        return [4 /*yield*/, conversationMetadata.saveMetadata(metadata)];
                    case 1:
                        _a.sent();
                        workspaceManagerStub.readFile.resolves(JSON.stringify(metadata));
                        return [4 /*yield*/, conversationMetadata.loadMetadata('test-persist')];
                    case 2:
                        loaded = _a.sent();
                        assert.deepStrictEqual(loaded, metadata);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('should handle metadata versioning', function () {
        var v1Metadata = {
            version: '1.0',
            data: { simple: 'format' }
        };
        var v2Metadata = conversationMetadata.migrateMetadata(v1Metadata);
        assert.strictEqual(v2Metadata.version, '2.0');
        assert.ok(v2Metadata.data);
    });
    test('should track conversation relationships', function () {
        var parent = 'parent-convo';
        var child = 'child-convo';
        conversationMetadata.addRelationship(parent, child, 'continuation');
        var relationships = conversationMetadata.getRelationships(parent);
        assert.strictEqual(relationships.length, 1);
        assert.strictEqual(relationships[0].childId, child);
        assert.strictEqual(relationships[0].type, 'continuation');
    });
    test('should manage conversation tags', function () {
        var conversationId = 'tagged-convo';
        var tags = ['important', 'typescript', 'bug-fix'];
        conversationMetadata.addTags(conversationId, tags);
        var retrievedTags = conversationMetadata.getTags(conversationId);
        assert.deepStrictEqual(retrievedTags, tags);
        conversationMetadata.removeTag(conversationId, 'bug-fix');
        var updatedTags = conversationMetadata.getTags(conversationId);
        assert.strictEqual(updatedTags.length, 2);
        assert.ok(!updatedTags.includes('bug-fix'));
    });
    test('should track file associations', function () {
        var conversationId = 'file-associations';
        var files = [
            { path: '/src/test.ts', changes: 5 },
            { path: '/src/impl.ts', changes: 3 }
        ];
        conversationMetadata.addFileAssociations(conversationId, files);
        var associations = conversationMetadata.getFileAssociations(conversationId);
        assert.strictEqual(associations.length, 2);
        assert.strictEqual(associations[0].changes, 5);
    });
    test('should handle metadata cleanup', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var oldMetadata, savedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oldMetadata = {
                            id: 'old-convo',
                            lastAccessed: Date.now() - (31 * 24 * 60 * 60 * 1000) // 31 days old
                        };
                        workspaceManagerStub.readFile.resolves(JSON.stringify([oldMetadata]));
                        return [4 /*yield*/, conversationMetadata.cleanupOldMetadata(30)];
                    case 1:
                        _a.sent(); // 30 days retention
                        assert.ok(workspaceManagerStub.writeFile.calledOnce);
                        savedData = JSON.parse(workspaceManagerStub.writeFile.firstCall.args[1]);
                        assert.strictEqual(savedData.length, 0);
                        return [2 /*return*/];
                }
            });
        });
    });
    test('should calculate metadata storage usage', function () {
        return __awaiter(void 0, void 0, void 0, function () {
            var sampleMetadata, usage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sampleMetadata = Array(10).fill(null).map(function (_, i) {
                            return ({
                                id: "convo-".concat(i),
                                data: 'A'.repeat(1000) // 1KB per metadata
                            });
                        });
                        workspaceManagerStub.readFile.resolves(JSON.stringify(sampleMetadata));
                        return [4 /*yield*/, conversationMetadata.getStorageUsage()];
                    case 1:
                        usage = _a.sent();
                        assert.ok(usage.totalSize > 0);
                        assert.strictEqual(usage.conversationCount, 10);
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=ConversationMetadata.test.js.map