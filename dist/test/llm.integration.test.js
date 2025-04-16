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
const ollamaProvider_1 = require("../llm/ollamaProvider");
const lmStudioProvider_1 = require("../llm/lmStudioProvider");
suite('LLM Integration Test Suite', () => {
    test('Ollama Provider Connection Test', async () => {
        const provider = new ollamaProvider_1.OllamaProvider();
        const result = await provider.testConnection();
        assert.strictEqual(result.success, true);
    });
    test('LM Studio Provider Connection Test', async () => {
        const provider = new lmStudioProvider_1.LMStudioProvider();
        const result = await provider.testConnection();
        assert.strictEqual(result.success, true);
    });
    test('Message Exchange Test', async () => {
        const provider = new ollamaProvider_1.OllamaProvider();
        const response = await provider.sendMessage('test message');
        assert.ok(response !== null);
        assert.ok(response.length > 0);
    });
    test('Model Loading Test', async () => {
        const provider = new ollamaProvider_1.OllamaProvider();
        const models = await provider.getAvailableModels();
        assert.ok(Array.isArray(models));
        assert.ok(models.length > 0);
    });
    test('Error Handling Test', async () => {
        const provider = new ollamaProvider_1.OllamaProvider();
        try {
            await provider.sendMessage('');
            assert.fail('Should throw error for empty message');
        }
        catch (error) {
            assert.ok(error instanceof Error);
        }
    });
    test('Context Management Test', async () => {
        const provider = new ollamaProvider_1.OllamaProvider();
        const context = 'test context';
        await provider.setContext(context);
        const response = await provider.sendMessage('test with context');
        assert.ok(response.includes(context));
    });
});
//# sourceMappingURL=llm.integration.test.js.map