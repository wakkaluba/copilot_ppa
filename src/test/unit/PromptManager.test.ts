import * as assert from 'assert';
import * as sinon from 'sinon';
import { PromptManager, PromptTemplate } from '../../services/PromptManager';

describe('PromptManager Tests', () => {
    let promptManager: PromptManager;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Reset the singleton instance to ensure tests are isolated
        (PromptManager as any).instance = undefined;
        
        // Create a fresh instance of PromptManager
        promptManager = PromptManager.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    it('getInstance should return singleton instance', () => {
        const instance1 = PromptManager.getInstance();
        const instance2 = PromptManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    it('addTemplate should add a new template', () => {
        const newTemplate: PromptTemplate = {
            name: 'test-template',
            template: 'This is a test template with {{parameter}}',
            description: 'Test description',
            parameters: ['parameter']
        };
        
        promptManager.addTemplate(newTemplate);
        
        const retrievedTemplate = promptManager.getTemplate('test-template');
        assert.deepStrictEqual(retrievedTemplate, newTemplate);
    });

    it('getTemplate should return undefined for non-existent template', () => {
        const template = promptManager.getTemplate('non-existent-template');
        assert.strictEqual(template, undefined);
    });

    it('listTemplates should return all templates', () => {
        // First check the default templates
        const defaultTemplates = promptManager.listTemplates();
        assert.ok(defaultTemplates.length >= 4); // At least the 4 default templates
        
        // Add a new template
        const newTemplate: PromptTemplate = {
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

    it('generatePrompt should fill in template parameters', () => {
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

    it('generatePrompt should throw error for non-existent template', () => {
        assert.throws(() => {
            promptManager.generatePrompt('non-existent-template', { param: 'value' });
        }, /Template 'non-existent-template' not found/);
    });

    it('default templates should be initialized properly', () => {
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
            assert.strictEqual(template!.name, name);
            assert.ok(template!.template.length > 0);
            assert.ok(template!.description.length > 0);
            assert.ok(Array.isArray(template!.parameters));
        }
    });

    it('generatePrompt should handle missing optional parameters', () => {
        // Create a template with optional parameters
        const templateWithOptionals: PromptTemplate = {
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

    it('generatePrompt should handle nested parameters', () => {
        // Create a template with nested parameters
        const nestedTemplate: PromptTemplate = {
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
