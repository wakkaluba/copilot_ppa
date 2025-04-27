"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var PromptManager_1 = require("../../services/PromptManager");
suite('PromptManager Tests', function () {
    var promptManager;
    var sandbox;
    setup(function () {
        sandbox = sinon.createSandbox();
        // Reset the singleton instance to ensure tests are isolated
        PromptManager_1.PromptManager.instance = undefined;
        // Create a fresh instance of PromptManager
        promptManager = PromptManager_1.PromptManager.getInstance();
    });
    teardown(function () {
        sandbox.restore();
    });
    test('getInstance should return singleton instance', function () {
        var instance1 = PromptManager_1.PromptManager.getInstance();
        var instance2 = PromptManager_1.PromptManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    test('addTemplate should add a new template', function () {
        var newTemplate = {
            name: 'test-template',
            template: 'This is a test template with {{parameter}}',
            description: 'Test description',
            parameters: ['parameter']
        };
        promptManager.addTemplate(newTemplate);
        var retrievedTemplate = promptManager.getTemplate('test-template');
        assert.deepStrictEqual(retrievedTemplate, newTemplate);
    });
    test('getTemplate should return undefined for non-existent template', function () {
        var template = promptManager.getTemplate('non-existent-template');
        assert.strictEqual(template, undefined);
    });
    test('listTemplates should return all templates', function () {
        // First check the default templates
        var defaultTemplates = promptManager.listTemplates();
        assert.ok(defaultTemplates.length >= 4); // At least the 4 default templates
        // Add a new template
        var newTemplate = {
            name: 'another-template',
            template: 'Another template',
            description: 'Another description',
            parameters: []
        };
        promptManager.addTemplate(newTemplate);
        // Check the updated list
        var updatedTemplates = promptManager.listTemplates();
        assert.strictEqual(updatedTemplates.length, defaultTemplates.length + 1);
        // Verify the new template is in the list
        var foundTemplate = updatedTemplates.find(function (t) { return t.name === 'another-template'; });
        assert.ok(foundTemplate);
        assert.deepStrictEqual(foundTemplate, newTemplate);
    });
    test('generatePrompt should fill in template parameters', function () {
        var parameters = {
            code: 'function add(a, b) { return a + b; }',
            problem: 'Function always returns NaN',
            error: 'TypeError: a is not a number'
        };
        var prompt = promptManager.generatePrompt('debug-issue', parameters);
        // Check that each parameter was properly inserted
        assert.ok(prompt.includes(parameters.code));
        assert.ok(prompt.includes(parameters.problem));
        assert.ok(prompt.includes(parameters.error));
        assert.ok(!prompt.includes('{{code}}'));
        assert.ok(!prompt.includes('{{problem}}'));
        assert.ok(!prompt.includes('{{error}}'));
    });
    test('generatePrompt should throw error for non-existent template', function () {
        assert.throws(function () {
            promptManager.generatePrompt('non-existent-template', { param: 'value' });
        }, /Template 'non-existent-template' not found/);
    });
    test('default templates should be initialized properly', function () {
        // Check that all default templates exist
        var defaultTemplateNames = [
            'explain-code',
            'suggest-improvements',
            'implement-feature',
            'debug-issue'
        ];
        for (var _i = 0, defaultTemplateNames_1 = defaultTemplateNames; _i < defaultTemplateNames_1.length; _i++) {
            var name_1 = defaultTemplateNames_1[_i];
            var template = promptManager.getTemplate(name_1);
            assert.ok(template, "Template ".concat(name_1, " should exist"));
            assert.strictEqual(template.name, name_1);
            assert.ok(template.template.length > 0);
            assert.ok(template.description.length > 0);
            assert.ok(Array.isArray(template.parameters));
        }
    });
    test('generatePrompt should handle missing optional parameters', function () {
        // Create a template with optional parameters
        var templateWithOptionals = {
            name: 'template-with-optionals',
            template: 'Required: {{required}}, Optional: {{optional}}',
            description: 'Test template with optional parameters',
            parameters: ['required', 'optional']
        };
        promptManager.addTemplate(templateWithOptionals);
        // Generate with only required parameters
        var prompt = promptManager.generatePrompt('template-with-optionals', {
            required: 'value'
        });
        // The optional parameter should remain as {{optional}}
        assert.strictEqual(prompt, 'Required: value, Optional: {{optional}}');
    });
    test('generatePrompt should handle nested parameters', function () {
        // Create a template with nested parameters
        var nestedTemplate = {
            name: 'nested-template',
            template: 'Outer {{outer}} contains {{inner}}',
            description: 'Test nested parameter template',
            parameters: ['outer', 'inner']
        };
        promptManager.addTemplate(nestedTemplate);
        // Generate with nested values
        var prompt = promptManager.generatePrompt('nested-template', {
            outer: 'parameter with {{inner}} placeholder',
            inner: 'nested value'
        });
        // The inner parameter in the outer text should not be replaced
        assert.strictEqual(prompt, 'Outer parameter with {{inner}} placeholder contains nested value');
    });
});
