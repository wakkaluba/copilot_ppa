/**
 * Tests for LLMModelInfoService
 * Source: src\services\llm\services\LLMModelInfoService.ts
 */
import * as assert from 'assert';
import { LLMModelInfoService } from '../../../src/services/llm/services/LLMModelInfoService.js';

describe('LLMModelInfoService', () => {
    let service: LLMModelInfoService;
    beforeEach(() => {
        // Use dummy dependencies for logger, cacheManager, validator
        const dummyLogger = { info: () => {}, error: () => {}, warn: () => {} };
        const dummyCacheManager = { on: () => {}, getModelInfo: async () => ({ id: 'test', name: 'Test', provider: 'dummy', maxContextLength: 1, parameters: {}, features: [] }) };
        const dummyValidator = { on: () => {} };
        service = new LLMModelInfoService(dummyLogger as any, dummyCacheManager as any, dummyValidator as any);
    });

    it('should construct without error', () => {
        assert.ok(service);
    });

    it('should get model info (from dummy cache)', async () => {
        const info = await service.getModelInfo('test');
        assert.strictEqual(info.id, 'test');
        assert.strictEqual(info.name, 'Test');
    });
});
