import * as assert from 'assert';
import { PromptManager } from '../../services/PromptManager';

suite('PromptManager Tests', () => {
    let promptManager: PromptManager;

    setup(() => {
        promptManager = PromptManager.getInstance();
    });

    test('should generate prompt from template', () => {
        promptManager.addTemplate({
            name: 'test',
            template: 'Hello {{name}}!',
            description: 'Test template',
            parameters: ['name']
        });

        const result = promptManager.generatePrompt('test', { name: 'World' });
        assert.strictEqual(result, 'Hello World!');
    });

    test('should list all templates', () => {
        const templates = promptManager.listTemplates();
        assert(Array.isArray(templates));
        assert(templates.length > 0);
    });
});
