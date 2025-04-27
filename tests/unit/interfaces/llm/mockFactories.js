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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockLLMPromptOptions = createMockLLMPromptOptions;
exports.createMockHardwareSpecs = createMockHardwareSpecs;
/**
 * Creates a mock LLMPromptOptions object with default or custom values
 */
function createMockLLMPromptOptions(overrides) {
    return __assign({ maxTokens: 100, temperature: 0.7, topP: 0.9, presencePenalty: 0.5, frequencyPenalty: 0.5, stopSequences: ['###', 'END'] }, overrides);
}
/**
 * Creates a mock HardwareSpecs object with default or custom values
 */
function createMockHardwareSpecs(overrides) {
    var defaultSpecs = {
        gpu: {
            available: true,
            name: 'NVIDIA GeForce RTX 3080',
            vram: 10240,
            cudaSupport: true
        },
        ram: {
            total: 32768,
            free: 16384
        },
        cpu: {
            cores: 8,
            model: 'Intel Core i7-10700K'
        }
    };
    if (!overrides) {
        return defaultSpecs;
    }
    return {
        gpu: __assign(__assign({}, defaultSpecs.gpu), (overrides.gpu || {})),
        ram: __assign(__assign({}, defaultSpecs.ram), (overrides.ram || {})),
        cpu: __assign(__assign({}, defaultSpecs.cpu), (overrides.cpu || {}))
    };
}
