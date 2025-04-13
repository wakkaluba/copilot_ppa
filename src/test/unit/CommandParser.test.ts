import * as assert from 'assert';
import * as sinon from 'sinon';
import { CommandParser, Command } from '../../services/CommandParser';
import { WorkspaceManager } from '../../services/WorkspaceManager';

suite('CommandParser Tests', () => {
    let commandParser: CommandParser;
    let workspaceManagerStub: sinon.SinonStubbedInstance<WorkspaceManager>;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Create stub for WorkspaceManager
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager);
        
        // Replace the getInstance method to return our stub
        sandbox.stub(WorkspaceManager, 'getInstance').returns(workspaceManagerStub as unknown as WorkspaceManager);
        
        // Create a fresh instance of CommandParser for each test
        commandParser = CommandParser.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return singleton instance', () => {
        const instance1 = CommandParser.getInstance();
        const instance2 = CommandParser.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('parseAndExecute should call correct handler for valid command', async () => {
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

    test('parseAndExecute should throw error for invalid command format', async () => {
        await assert.rejects(
            () => commandParser.parseAndExecute('not a valid command'),
            /Invalid command format/
        );
    });

    test('parseAndExecute should throw error for unknown command', async () => {
        await assert.rejects(
            () => commandParser.parseAndExecute('#unknownCommand(arg="value")'),
            /Unknown command: unknownCommand/
        );
    });

    test('registerCommand should add custom command handler', async () => {
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

    test('createFile command should call workspaceManager.writeFile', async () => {
        workspaceManagerStub.writeFile.resolves();
        
        await commandParser.parseAndExecute('#createFile(path="test.txt", content="Hello World")');
        
        assert.strictEqual(workspaceManagerStub.writeFile.calledOnce, true);
        assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[0], 'test.txt');
        assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[1], 'Hello World');
    });

    test('modifyFile command should read and write file', async () => {
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

    test('deleteFile command should call workspaceManager.deleteFile', async () => {
        workspaceManagerStub.deleteFile.resolves();
        
        await commandParser.parseAndExecute('#deleteFile(path="test.txt")');
        
        assert.strictEqual(workspaceManagerStub.deleteFile.calledOnce, true);
        assert.strictEqual(workspaceManagerStub.deleteFile.firstCall.args[0], 'test.txt');
    });

    test('parseCommand should extract command name and arguments correctly', () => {
        // Access private method using type assertion
        const parseCommand = (commandParser as any).parseCommand.bind(commandParser);
        
        const result = parseCommand('#testCommand(arg1="value1", arg2="value2")');
        
        assert.strictEqual(result.name, 'testCommand');
        assert.deepStrictEqual(result.args, {
            arg1: 'value1',
            arg2: 'value2'
        });
    });

    test('parseCommand should return null for invalid input', () => {
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

    test('parseArgs should handle multiple arguments', () => {
        // Access private method using type assertion
        const parseArgs = (commandParser as any).parseArgs.bind(commandParser);
        
        const result = parseArgs('arg1="value1", arg2="value2", arg3="complex value with spaces"');
        
        assert.deepStrictEqual(result, {
            arg1: 'value1',
            arg2: 'value2',
            arg3: 'complex value with spaces'
        });
    });

    test('parseArgs should handle empty arguments list', () => {
        // Access private method using type assertion
        const parseArgs = (commandParser as any).parseArgs.bind(commandParser);
        
        const result = parseArgs('');
        
        assert.deepStrictEqual(result, {});
    });
});