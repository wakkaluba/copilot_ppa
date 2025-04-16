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
const CommandParser_1 = require("../../services/CommandParser");
const WorkspaceManager_1 = require("../../services/WorkspaceManager");
suite('CommandParser Tests', () => {
    let commandParser;
    let workspaceManagerStub;
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Create stub for WorkspaceManager
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        // Replace the getInstance method to return our stub
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        // Create a fresh instance of CommandParser for each test
        commandParser = CommandParser_1.CommandParser.getInstance();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('getInstance should return singleton instance', () => {
        const instance1 = CommandParser_1.CommandParser.getInstance();
        const instance2 = CommandParser_1.CommandParser.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    test('parseAndExecute should call correct handler for valid command', async () => {
        // Create spy for createFile command
        const createFileSpy = sandbox.spy(commandParser, 'createFile');
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
        await assert.rejects(() => commandParser.parseAndExecute('not a valid command'), /Invalid command format/);
    });
    test('parseAndExecute should throw error for unknown command', async () => {
        await assert.rejects(() => commandParser.parseAndExecute('#unknownCommand(arg="value")'), /Unknown command: unknownCommand/);
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
        const parseCommand = commandParser.parseCommand.bind(commandParser);
        const result = parseCommand('#testCommand(arg1="value1", arg2="value2")');
        assert.strictEqual(result.name, 'testCommand');
        assert.deepStrictEqual(result.args, {
            arg1: 'value1',
            arg2: 'value2'
        });
    });
    test('parseCommand should return null for invalid input', () => {
        // Access private method using type assertion
        const parseCommand = commandParser.parseCommand.bind(commandParser);
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
        const parseArgs = commandParser.parseArgs.bind(commandParser);
        const result = parseArgs('arg1="value1", arg2="value2", arg3="complex value with spaces"');
        assert.deepStrictEqual(result, {
            arg1: 'value1',
            arg2: 'value2',
            arg3: 'complex value with spaces'
        });
    });
    test('parseArgs should handle empty arguments list', () => {
        // Access private method using type assertion
        const parseArgs = commandParser.parseArgs.bind(commandParser);
        const result = parseArgs('');
        assert.deepStrictEqual(result, {});
    });
});
//# sourceMappingURL=CommandParser.test.js.map