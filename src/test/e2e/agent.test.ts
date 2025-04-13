import * as vscode from 'vscode';
import * as assert from 'assert';
import { Agent } from '../../agent/agent';
import { TestWorkspace } from '../helpers/testWorkspace';

suite('Agent E2E Test Suite', () => {
    let agent: Agent;
    let testWorkspace: TestWorkspace;

    suiteSetup(async () => {
        agent = new Agent();
        testWorkspace = new TestWorkspace();
        await testWorkspace.setup();
    });

    suiteTeardown(async () => {
        await testWorkspace.cleanup();
    });

    test('Complete Code Generation Workflow', async () => {
        const prompt = 'Create a simple function that adds two numbers';
        const response = await agent.processRequest(prompt);
        assert.ok(response.includes('function add'));
        assert.ok(await testWorkspace.fileWasCreated('add.ts'));
    });

    test('Code Review Workflow', async () => {
        const testFile = await testWorkspace.createFile('test.ts', 'function test() { return true; }');
        const response = await agent.reviewCode(testFile);
        assert.ok(response.includes('review'));
        assert.ok(response.includes('suggestions'));
    });

    test('Documentation Generation', async () => {
        const testCode = `
            class Example {
                constructor() {}
                method() {}
            }
        `;
        const testFile = await testWorkspace.createFile('example.ts', testCode);
        const docs = await agent.generateDocs(testFile);
        assert.ok(docs.includes('Example class'));
        assert.ok(docs.includes('method'));
    });

    test('Context Awareness', async () => {
        const file1 = await testWorkspace.createFile('context1.ts', 'const x = 1;');
        const file2 = await testWorkspace.createFile('context2.ts', 'const y = 2;');
        const response = await agent.processRequestWithContext('How are x and y used?', [file1, file2]);
        assert.ok(response.includes('x') && response.includes('y'));
    });

    test('Error Handling Workflow', async () => {
        const invalidCode = 'function broken {';
        const testFile = await testWorkspace.createFile('broken.ts', invalidCode);
        const fixes = await agent.suggestFixes(testFile);
        assert.ok(fixes.includes('syntax error'));
        assert.ok(fixes.includes('suggestion'));
    });
});
