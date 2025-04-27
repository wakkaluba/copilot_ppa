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
exports.createTestPromptOptions = createTestPromptOptions;
describe('LLMPromptOptions interface', function () {
    it('should create a valid empty options object', function () {
        var options = {};
        expect(options).toBeDefined();
    });
    it('should create a valid options object with temperature', function () {
        var options = {
            temperature: 0.8
        };
        expect(options).toBeDefined();
        expect(options.temperature).toBe(0.8);
    });
    it('should create a valid options object with maxTokens', function () {
        var options = {
            maxTokens: 1500
        };
        expect(options).toBeDefined();
        expect(options.maxTokens).toBe(1500);
    });
    it('should create a valid options object with all properties', function () {
        var options = {
            temperature: 0.6,
            maxTokens: 2500
        };
        expect(options).toBeDefined();
        expect(options.temperature).toBe(0.6);
        expect(options.maxTokens).toBe(2500);
    });
    it('should work with the enhanced prompt function', function () {
        // This is a simulation of how LLMPromptOptions would be used with the enhancePromptWithLanguage function
        var mockEnhancePrompt = function (prompt, targetLanguage, options) {
            // Simulate enhancing the prompt based on options
            var enhancedPrompt = prompt;
            if (targetLanguage) {
                enhancedPrompt += " (Lang: ".concat(targetLanguage, ")");
            }
            if (options === null || options === void 0 ? void 0 : options.temperature) {
                enhancedPrompt += " (Temperature: ".concat(options.temperature, ")");
            }
            if (options === null || options === void 0 ? void 0 : options.maxTokens) {
                enhancedPrompt += " (Max Tokens: ".concat(options.maxTokens, ")");
            }
            return enhancedPrompt;
        };
        var prompt = 'Translate this text';
        var options = {
            temperature: 0.7,
            maxTokens: 1000
        };
        var enhancedPrompt = mockEnhancePrompt(prompt, i18n_1.SupportedLanguage.German, options);
        expect(enhancedPrompt).toBe('Translate this text (Lang: de) (Temperature: 0.7) (Max Tokens: 1000)');
    });
});
// Helper function to create prompt options for testing
function createTestPromptOptions(overrides) {
    var defaultOptions = {
        temperature: 0.7,
        maxTokens: 2000
    };
    return __assign(__assign({}, defaultOptions), overrides);
}
