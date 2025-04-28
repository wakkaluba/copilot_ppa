import * as assert from 'assert';
import * as sinon from 'sinon';
import { CommandParser, Command } from '../../services/CommandParser';
import { WorkspaceManager } from '../../services/WorkspaceManager';

describe('CommandParser Tests', () => {
    let commandParser: CommandParser;
    let workspaceManagerStub: sinon.SinonStubbedInstance<WorkspaceManager>;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        
        // Reset the CommandParser instance before each test
        CommandParser.resetInstance();
        
        // Create stub for WorkspaceManager
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager);
        
        // Replace the getInstance method to return our stub
        sandbox.stub(WorkspaceManager, 'getInstance').returns(workspaceManagerStub as unknown as WorkspaceManager);
        
        // Create a fresh instance of CommandParser for each test
        commandParser = CommandParser.getInstance();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('getInstance should return singleton instance', () => {
        const instance1 = CommandParser.getInstance();
        const instance2 = CommandParser.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    it('parseAndExecute should call correct handler for valid command', async () => {
        // Create spy for createFile command
        const createFileSpy = sandbox.spy(commandParser as any, 'createFile');
        
        // Execute the command
        await commandParser.parseAndExecute('#createFile(path="test.txt", content="Hello World")');
        
        // Verify handler was called with correct arguments
        assert.strictEqual(createFileSpy.calledOnce, true);
        assert.deepStrictEqual(createFileSpy.firstCall.args[0], {
            path: 'test.txt',
            content: 'Hello World'
        });
    });

    it('parseAndExecute should return null for invalid command format', async () => {
        const result = await commandParser.parseAndExecute('not a valid command');
        assert.strictEqual(result, null);
    });

    it('parseAndExecute should throw error for unknown command', async () => {
        await assert.rejects(
            () => commandParser.parseAndExecute('#unknownCommand(arg="value")'),
            /Unknown command: unknownCommand/
        );
    });

    it('registerCommand should add custom command handler', async () => {
        // Create a custom command handler
        const customHandler = sinon.stub().resolves();
        
        // Register the command
        commandParser.registerCommand('customCommand', customHandler);
        
        // Execute the command
        await commandParser.parseAndExecute('#customCommand(key="value")');
        
        // Verify handler was called with correct arguments
        assert.strictEqual(customHandler.calledOnce, true);
        assert.deepStrictEqual(customHandler.firstCall.args[0], {
            key: 'value'
        });
    });

    it('createFile command should call workspaceManager.writeFile', async () => {
        workspaceManagerStub.writeFile.resolves();
        
        await commandParser.parseAndExecute('#createFile(path="test.txt", content="Hello World")');
        
        assert.strictEqual(workspaceManagerStub.writeFile.calledOnce, true);
        assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[0], 'test.txt');
        assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[1], 'Hello World');
    });

    it('modifyFile command should read and write file', async () => {
        workspaceManagerStub.readFile.resolves('Original content');
        workspaceManagerStub.writeFile.resolves();
        
        await commandParser.parseAndExecute('#modifyFile(path="test.txt", changes="New content")');
        
        // Should read the original file
        assert.strictEqual(workspaceManagerStub.readFile.calledOnce, true);
        assert.strictEqual(workspaceManagerStub.readFile.firstCall.args[0], 'test.txt');
        
        // Should write the new content
        assert.strictEqual(workspaceManagerStub.writeFile.calledOnce, true);
        assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[0], 'test.txt');
        assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[1], 'New content');
    });

    it('deleteFile command should call workspaceManager.deleteFile', async () => {
        workspaceManagerStub.deleteFile.resolves();
        
        await commandParser.parseAndExecute('#deleteFile(path="test.txt")');
        
        assert.strictEqual(workspaceManagerStub.deleteFile.calledOnce, true);
        assert.strictEqual(workspaceManagerStub.deleteFile.firstCall.args[0], 'test.txt');
    });

    it('parseCommand should extract command name and arguments correctly', () => {
        // Access private method using type assertion
        const parseCommand = (commandParser as any).parseCommand.bind(commandParser);
        
        const result = parseCommand('#testCommand(arg1="value1", arg2="value2")');
        
        assert.strictEqual(result.name, 'testCommand');
        assert.deepStrictEqual(result.args, {
            arg1: 'value1',
            arg2: 'value2'
        });
    });

    it('parseCommand should return null for invalid input', () => {
        // Access private method using type assertion
        const parseCommand = (commandParser as any).parseCommand.bind(commandParser);
        
        const invalidInputs = [
            'not a command',
            '#commandWithoutArgs',
            '#command(invalid)',
            'command(arg="value")',
        ];
        
        for (const input of invalidInputs) {
            const result = parseCommand(input);
            assert.strictEqual(result, null);
        }
    });

    it('parseArgs should handle multiple arguments', () => {
        // Access private method using type assertion
        const parseArgs = (commandParser as any).parseArgs.bind(commandParser);
        
        const result = parseArgs('arg1="value1", arg2="value2", arg3="complex value with spaces"');
        
        assert.deepStrictEqual(result, {
            arg1: 'value1',
            arg2: 'value2',
            arg3: 'complex value with spaces'
        });
    });

    it('parseArgs should handle empty arguments list', () => {
        // Access private method using type assertion
        const parseArgs = (commandParser as any).parseArgs.bind(commandParser);
        
        const result = parseArgs('');
        
        assert.deepStrictEqual(result, {});
    });

    it('parseAndExecute should handle @agent commands', async () => {
        // Create a stub for the continueIteration method
        const continueIterationStub = sandbox.stub().resolves();
        
        // Override the continueIteration method
        (commandParser as any).continueIteration = continueIterationStub;
        
        // Execute the @agent Continue command
        await commandParser.parseAndExecute('@agent Continue');
        
        // Verify handler was called with the correct arguments
        assert.strictEqual(continueIterationStub.calledOnce, true);
        assert.deepStrictEqual(continueIterationStub.firstCall.args[0], {});
    });

    it('parseAndExecute should handle @agent commands with message', async () => {
        // Create a stub for the continueIteration method
        const continueIterationStub = sandbox.stub().resolves();
        
        // Override the continueIteration method
        (commandParser as any).continueIteration = continueIterationStub;
        
        // Execute the @agent Continue command with a message
        await commandParser.parseAndExecute('@agent Continue: "Custom message"');
        
        // Verify handler was called with the correct arguments
        assert.strictEqual(continueIterationStub.calledOnce, true);
        assert.deepStrictEqual(continueIterationStub.firstCall.args[0], {
            message: 'Custom message'
        });
    });
    
    it('parseAgentCommand should parse @agent commands correctly', () => {
        // Access private method using type assertion
        const parseAgentCommand = (commandParser as any).parseAgentCommand.bind(commandParser);
        
        // Test simple agent command
        const result1 = parseAgentCommand('@agent Continue');
        assert.strictEqual(result1.name, 'continue');
        assert.deepStrictEqual(result1.args, {});
        
        // Test agent command with message
        const result2 = parseAgentCommand('@agent Continue: "Hello world"');
        assert.strictEqual(result2.name, 'continue');
        assert.deepStrictEqual(result2.args, { message: 'Hello world' });
        
        // Test agent command with regular arguments
        const result3 = parseAgentCommand('@agent Continue(delay=true)');
        assert.strictEqual(result3.name, 'continue');
        assert.deepStrictEqual(result3.args, { delay: true });
    });
});