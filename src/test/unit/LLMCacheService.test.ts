import * as assert from 'assert';
import * as path from 'path';
import { LLMCacheService } from '../../services/cache/llmCacheService';
import { CacheTestHelper } from '../helpers/CacheTestHelper';

describe('LLMCacheService Tests', () => {
    let llmCacheService: LLMCacheService;
    let testHelper: CacheTestHelper;

    setup(() => {
        testHelper = new CacheTestHelper();
        llmCacheService = new LLMCacheService();
    });

    teardown(() => {
        testHelper.dispose();
    });

    describe('Cache Construction', () => {
        // ...existing constructor tests...
    });

    describe('Cache Operations', () => {
        it('get should return null when cache is disabled', async () => {
            // Disable cache
            testHelper.workspaceConfigStub.returns({
                get: (key: string) => key === 'enabled' ? false : undefined
            });

            const service = new LLMCacheService();
            const result = await service.get('prompt', 'model', {});
            assert.strictEqual(result, null);
        });

        it('get should handle expired cache entries', async () => {
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

        it('get should return valid cached response', async () => {
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

    describe('Cache Maintenance', () => {
        it('clearCache should remove all cache files', () => {
            testHelper.fsStubs.readdirSync
                .withArgs('/fake/extension/path/cache')
                .returns(['file1.json', 'file2.json']);

            llmCacheService.clearCache();

            assert.strictEqual(testHelper.fsStubs.unlinkSync.callCount, 2);
        });

        it('clearExpiredCache should only remove expired entries', () => {
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
    function generateCacheKey(prompt: string, model: string, params: any): string {
        const data = JSON.stringify({ prompt, model, params });
        const crypto = require('crypto');
        return crypto.createHash('md5').update(data).digest('hex');
    }
});