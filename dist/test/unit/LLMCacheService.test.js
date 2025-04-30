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
var path = require("path");
var llmCacheService_1 = require("../../services/cache/llmCacheService");
var CacheTestHelper_1 = require("../helpers/CacheTestHelper");
suite('LLMCacheService Tests', function () {
    var llmCacheService;
    var testHelper;
    setup(function () {
        testHelper = new CacheTestHelper_1.CacheTestHelper();
        llmCacheService = new llmCacheService_1.LLMCacheService();
    });
    teardown(function () {
        testHelper.dispose();
    });
    suite('Cache Construction', function () {
        // ...existing constructor tests...
    });
    suite('Cache Operations', function () {
        test('get should return null when cache is disabled', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var service, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Disable cache
                            testHelper.workspaceConfigStub.returns({
                                get: function (key) { return key === 'enabled' ? false : undefined; }
                            });
                            service = new llmCacheService_1.LLMCacheService();
                            return [4 /*yield*/, service.get('prompt', 'model', {})];
                        case 1:
                            result = _a.sent();
                            assert.strictEqual(result, null);
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('get should handle expired cache entries', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var cacheKey, cacheFilePath, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheKey = generateCacheKey('prompt', 'model', {});
                            cacheFilePath = path.join('/fake/extension/path/cache', "".concat(cacheKey, ".json"));
                            // Setup cache file
                            testHelper.fsStubs.existsSync.withArgs(cacheFilePath).returns(true);
                            testHelper.fsStubs.readFileSync.withArgs(cacheFilePath, 'utf8').returns(JSON.stringify({
                                timestamp: new Date() - (61 * 60 * 1000), // 61 minutes ago (expired)
                                response: 'cached response'
                            }));
                            return [4 /*yield*/, llmCacheService.get('prompt', 'model', {})];
                        case 1:
                            result = _a.sent();
                            assert.strictEqual(result, null);
                            assert.ok(testHelper.fsStubs.unlinkSync.calledWith(cacheFilePath));
                            return [2 /*return*/];
                    }
                });
            });
        });
        test('get should return valid cached response', function () {
            return __awaiter(void 0, void 0, void 0, function () {
                var cacheKey, cacheFilePath, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            cacheKey = generateCacheKey('prompt', 'model', {});
                            cacheFilePath = path.join('/fake/extension/path/cache', "".concat(cacheKey, ".json"));
                            // Setup cache file
                            testHelper.fsStubs.existsSync.withArgs(cacheFilePath).returns(true);
                            testHelper.fsStubs.readFileSync.withArgs(cacheFilePath, 'utf8').returns(JSON.stringify({
                                timestamp: new Date() - (30 * 60 * 1000), // 30 minutes ago (valid)
                                response: 'cached response'
                            }));
                            return [4 /*yield*/, llmCacheService.get('prompt', 'model', {})];
                        case 1:
                            result = _a.sent();
                            assert.strictEqual(result, 'cached response');
                            assert.ok(!testHelper.fsStubs.unlinkSync.called);
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    suite('Cache Maintenance', function () {
        test('clearCache should remove all cache files', function () {
            testHelper.fsStubs.readdirSync
                .withArgs('/fake/extension/path/cache')
                .returns(['file1.json', 'file2.json']);
            llmCacheService.clearCache();
            assert.strictEqual(testHelper.fsStubs.unlinkSync.callCount, 2);
        });
        test('clearExpiredCache should only remove expired entries', function () {
            testHelper.fsStubs.readdirSync
                .withArgs('/fake/extension/path/cache')
                .returns(['valid.json', 'expired.json', 'invalid.json']);
            // Setup cache files
            testHelper.fsStubs.readFileSync
                .withArgs(path.join('/fake/extension/path/cache', 'valid.json'), 'utf8')
                .returns(JSON.stringify({
                timestamp: new Date() - (30 * 60 * 1000),
                response: 'valid'
            }));
            testHelper.fsStubs.readFileSync
                .withArgs(path.join('/fake/extension/path/cache', 'expired.json'), 'utf8')
                .returns(JSON.stringify({
                timestamp: new Date() - (61 * 60 * 1000),
                response: 'expired'
            }));
            testHelper.fsStubs.readFileSync
                .withArgs(path.join('/fake/extension/path/cache', 'invalid.json'), 'utf8')
                .returns('invalid json');
            llmCacheService.clearExpiredCache();
            assert.strictEqual(testHelper.fsStubs.unlinkSync.callCount, 2);
            assert.ok(testHelper.fsStubs.unlinkSync.calledWith(path.join('/fake/extension/path/cache', 'expired.json')));
            assert.ok(testHelper.fsStubs.unlinkSync.calledWith(path.join('/fake/extension/path/cache', 'invalid.json')));
        });
    });
    // Helper function to match cache key generation
    function generateCacheKey(prompt, model, params) {
        var data = JSON.stringify({ prompt: prompt, model: model, params: params });
        var crypto = require('crypto');
        return crypto.createHash('md5').update(data).digest('hex');
    }
});
//# sourceMappingURL=LLMCacheService.test.js.map