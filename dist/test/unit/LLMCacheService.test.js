"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const path = __importStar(require("path"));
const llmCacheService_1 = require("../../services/cache/llmCacheService");
const CacheTestHelper_1 = require("../helpers/CacheTestHelper");
suite('LLMCacheService Tests', () => {
    let llmCacheService;
    let testHelper;
    setup(() => {
        testHelper = new CacheTestHelper_1.CacheTestHelper();
        llmCacheService = new llmCacheService_1.LLMCacheService();
    });
    teardown(() => {
        testHelper.dispose();
    });
    suite('Cache Construction', () => {
        // ...existing constructor tests...
    });
    suite('Cache Operations', () => {
        test('get should return null when cache is disabled', async () => {
            // Disable cache
            testHelper.workspaceConfigStub.returns({
                get: (key) => key === 'enabled' ? false : undefined
            });
            const service = new llmCacheService_1.LLMCacheService();
            const result = await service.get('prompt', 'model', {});
            assert.strictEqual(result, null);
        });
        test('get should handle expired cache entries', async () => {
            const cacheKey = generateCacheKey('prompt', 'model', {});
            const cacheFilePath = path.join('/fake/extension/path/cache', `${cacheKey}.json`);
            // Setup cache file
            testHelper.fsStubs.existsSync.withArgs(cacheFilePath).returns(true);
            testHelper.fsStubs.readFileSync.withArgs(cacheFilePath, 'utf8').returns(JSON.stringify({
                timestamp: Date.now() - (61 * 60 * 1000), // 61 minutes ago (expired)
                response: 'cached response'
            }));
            const result = await llmCacheService.get('prompt', 'model', {});
            assert.strictEqual(result, null);
            assert.ok(testHelper.fsStubs.unlinkSync.calledWith(cacheFilePath));
        });
        test('get should return valid cached response', async () => {
            const cacheKey = generateCacheKey('prompt', 'model', {});
            const cacheFilePath = path.join('/fake/extension/path/cache', `${cacheKey}.json`);
            // Setup cache file
            testHelper.fsStubs.existsSync.withArgs(cacheFilePath).returns(true);
            testHelper.fsStubs.readFileSync.withArgs(cacheFilePath, 'utf8').returns(JSON.stringify({
                timestamp: Date.now() - (30 * 60 * 1000), // 30 minutes ago (valid)
                response: 'cached response'
            }));
            const result = await llmCacheService.get('prompt', 'model', {});
            assert.strictEqual(result, 'cached response');
            assert.ok(!testHelper.fsStubs.unlinkSync.called);
        });
    });
    suite('Cache Maintenance', () => {
        test('clearCache should remove all cache files', () => {
            testHelper.fsStubs.readdirSync
                .withArgs('/fake/extension/path/cache')
                .returns(['file1.json', 'file2.json']);
            llmCacheService.clearCache();
            assert.strictEqual(testHelper.fsStubs.unlinkSync.callCount, 2);
        });
        test('clearExpiredCache should only remove expired entries', () => {
            testHelper.fsStubs.readdirSync
                .withArgs('/fake/extension/path/cache')
                .returns(['valid.json', 'expired.json', 'invalid.json']);
            // Setup cache files
            testHelper.fsStubs.readFileSync
                .withArgs(path.join('/fake/extension/path/cache', 'valid.json'), 'utf8')
                .returns(JSON.stringify({
                timestamp: Date.now() - (30 * 60 * 1000),
                response: 'valid'
            }));
            testHelper.fsStubs.readFileSync
                .withArgs(path.join('/fake/extension/path/cache', 'expired.json'), 'utf8')
                .returns(JSON.stringify({
                timestamp: Date.now() - (61 * 60 * 1000),
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
        const data = JSON.stringify({ prompt, model, params });
        const crypto = require('crypto');
        return crypto.createHash('md5').update(data).digest('hex');
    }
});
//# sourceMappingURL=LLMCacheService.test.js.map