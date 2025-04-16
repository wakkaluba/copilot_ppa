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
const sinon = __importStar(require("sinon"));
const PromptManager_1 = require("../../services/PromptManager");
suite('PromptManager Tests', () => {
    let promptManager;
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Reset the singleton instance to ensure tests are isolated
        PromptManager_1.PromptManager.instance = undefined;
        // Create a fresh instance of PromptManager
        promptManager = PromptManager_1.PromptManager.getInstance();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('getInstance should return singleton instance', () => {
        const instance1 = PromptManager_1.PromptManager.getInstance();
        const instance2 = PromptManager_1.PromptManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    test('addTemplate should add a new template', () => {
        const newTemplate = {
            name: 'test-template',
            template: 'This is a test template with {{parameter}}',
            description: 'Test description',
            parameters: ['parameter']
        };
        promptManager.addTemplate(newTemplate);
        const retrievedTemplate = promptManager.getTemplate('test-template');
        assert.deepStrictEqual(retrievedTemplate, newTemplate);
    });
    test('getTemplate should return undefined for non-existent template', () => {
        const template = promptManager.getTemplate('non-existent-template');
        assert.strictEqual(template, undefined);
    });
    test('listTemplates should return all templates', () => {
        // First check the default templates
        const defaultTemplates = promptManager.listTemplates();
        assert.ok(defaultTemplates.length >= 4); // At least the 4 default templates
        // Add a new template
        const newTemplate = {
            name: 'another-template',
            template: 'Another template',
            description: 'Another description',
            parameters: []
        };
        promptManager.addTemplate(newTemplate);
        // Check the updated list
        const updatedTemplates = promptManager.listTemplates();
        assert.strictEqual(updatedTemplates.length, defaultTemplates.length + 1);
        // Verify the new template is in the list
        const foundTemplate = updatedTemplates.find(t => t.name === 'another-template');
        assert.ok(foundTemplate);
        assert.deepStrictEqual(foundTemplate, newTemplate);
    });
    test('generatePrompt should fill in template parameters', () => {
        const parameters = {
            code: 'function add(a, b) { return a + b; }',
            problem: 'Function always returns NaN',
            error: 'TypeError: a is not a number'
        };
        const prompt = promptManager.generatePrompt('debug-issue', parameters);
        // Check that each parameter was properly inserted
        assert.ok(prompt.includes(parameters.code));
        assert.ok(prompt.includes(parameters.problem));
        assert.ok(prompt.includes(parameters.error));
        assert.ok(!prompt.includes('{{code}}'));
        assert.ok(!prompt.includes('{{problem}}'));
        assert.ok(!prompt.includes('{{error}}'));
    });
    test('generatePrompt should throw error for non-existent template', () => {
        assert.throws(() => {
            promptManager.generatePrompt('non-existent-template', { param: 'value' });
        }, /Template 'non-existent-template' not found/);
    });
    test('default templates should be initialized properly', () => {
        // Check that all default templates exist
        const defaultTemplateNames = [
            'explain-code',
            'suggest-improvements',
            'implement-feature',
            'debug-issue'
        ];
        for (const name of defaultTemplateNames) {
            const template = promptManager.getTemplate(name);
            assert.ok(template, `Template ${name} should exist`);
            assert.strictEqual(template.name, name);
            assert.ok(template.template.length > 0);
            assert.ok(template.description.length > 0);
            assert.ok(Array.isArray(template.parameters));
        }
    });
    test('generatePrompt should handle missing optional parameters', () => {
        // Create a template with optional parameters
        const templateWithOptionals = {
            name: 'template-with-optionals',
            template: 'Required: {{required}}, Optional: {{optional}}',
            description: 'Test template with optional parameters',
            parameters: ['required', 'optional']
        };
        promptManager.addTemplate(templateWithOptionals);
        // Generate with only required parameters
        const prompt = promptManager.generatePrompt('template-with-optionals', {
            required: 'value'
        });
        // The optional parameter should remain as {{optional}}
        assert.strictEqual(prompt, 'Required: value, Optional: {{optional}}');
    });
    test('generatePrompt should handle nested parameters', () => {
        // Create a template with nested parameters
        const nestedTemplate = {
            name: 'nested-template',
            template: 'Outer {{outer}} contains {{inner}}',
            description: 'Test nested parameter template',
            parameters: ['outer', 'inner']
        };
        promptManager.addTemplate(nestedTemplate);
        // Generate with nested values
        const prompt = promptManager.generatePrompt('nested-template', {
            outer: 'parameter with {{inner}} placeholder',
            inner: 'nested value'
        });
        // The inner parameter in the outer text should not be replaced
        assert.strictEqual(prompt, 'Outer parameter with {{inner}} placeholder contains nested value');
    });
});
//# sourceMappingURL=PromptManager.test.js.map