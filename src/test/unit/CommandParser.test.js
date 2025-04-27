"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var CommandParser_1 = require("../../services/CommandParser");
var WorkspaceManager_1 = require("../../services/WorkspaceManager");
describe('CommandParser Tests', function () {
    var commandParser;
    var workspaceManagerStub;
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        // Create stub for WorkspaceManager
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        // Replace the getInstance method to return our stub
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        // Create a fresh instance of CommandParser for each test
        commandParser = CommandParser_1.CommandParser.getInstance();
    });
    afterEach(function () {
        sandbox.restore();
    });
    it('getInstance should return singleton instance', function () {
        var instance1 = CommandParser_1.CommandParser.getInstance();
        var instance2 = CommandParser_1.CommandParser.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    it('parseAndExecute should call correct handler for valid command', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createFileSpy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createFileSpy = sandbox.spy(commandParser, 'createFile');
                    // Execute the command
                    return [4 /*yield*/, commandParser.parseAndExecute('#createFile(path="test.txt", content="Hello World")')];
                case 1:
                    // Execute the command
                    _a.sent();
                    // Verify handler was called with correct arguments
                    assert.strictEqual(createFileSpy.calledOnce, true);
                    assert.deepStrictEqual(createFileSpy.firstCall.args[0], {
                        path: 'test.txt',
                        content: 'Hello World'
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('parseAndExecute should throw error for invalid command format', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, assert.rejects(function () { return commandParser.parseAndExecute('not a valid command'); }, /Invalid command format/)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('parseAndExecute should throw error for unknown command', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, assert.rejects(function () { return commandParser.parseAndExecute('#unknownCommand(arg="value")'); }, /Unknown command: unknownCommand/)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('registerCommand should add custom command handler', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customHandler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    customHandler = sinon.stub().resolves();
                    // Register the command
                    commandParser.registerCommand('customCommand', customHandler);
                    // Execute the command
                    return [4 /*yield*/, commandParser.parseAndExecute('#customCommand(key="value")')];
                case 1:
                    // Execute the command
                    _a.sent();
                    // Verify handler was called with correct arguments
                    assert.strictEqual(customHandler.calledOnce, true);
                    assert.deepStrictEqual(customHandler.firstCall.args[0], {
                        key: 'value'
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('createFile command should call workspaceManager.writeFile', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workspaceManagerStub.writeFile.resolves();
                    return [4 /*yield*/, commandParser.parseAndExecute('#createFile(path="test.txt", content="Hello World")')];
                case 1:
                    _a.sent();
                    assert.strictEqual(workspaceManagerStub.writeFile.calledOnce, true);
                    assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[0], 'test.txt');
                    assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[1], 'Hello World');
                    return [2 /*return*/];
            }
        });
    }); });
    it('modifyFile command should read and write file', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workspaceManagerStub.readFile.resolves('Original content');
                    workspaceManagerStub.writeFile.resolves();
                    return [4 /*yield*/, commandParser.parseAndExecute('#modifyFile(path="test.txt", changes="New content")')];
                case 1:
                    _a.sent();
                    // Should read the original file
                    assert.strictEqual(workspaceManagerStub.readFile.calledOnce, true);
                    assert.strictEqual(workspaceManagerStub.readFile.firstCall.args[0], 'test.txt');
                    // Should write the new content
                    assert.strictEqual(workspaceManagerStub.writeFile.calledOnce, true);
                    assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[0], 'test.txt');
                    assert.strictEqual(workspaceManagerStub.writeFile.firstCall.args[1], 'New content');
                    return [2 /*return*/];
            }
        });
    }); });
    it('deleteFile command should call workspaceManager.deleteFile', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workspaceManagerStub.deleteFile.resolves();
                    return [4 /*yield*/, commandParser.parseAndExecute('#deleteFile(path="test.txt")')];
                case 1:
                    _a.sent();
                    assert.strictEqual(workspaceManagerStub.deleteFile.calledOnce, true);
                    assert.strictEqual(workspaceManagerStub.deleteFile.firstCall.args[0], 'test.txt');
                    return [2 /*return*/];
            }
        });
    }); });
    it('parseCommand should extract command name and arguments correctly', function () {
        // Access private method using type assertion
        var parseCommand = commandParser.parseCommand.bind(commandParser);
        var result = parseCommand('#testCommand(arg1="value1", arg2="value2")');
        assert.strictEqual(result.name, 'testCommand');
        assert.deepStrictEqual(result.args, {
            arg1: 'value1',
            arg2: 'value2'
        });
    });
    it('parseCommand should return null for invalid input', function () {
        // Access private method using type assertion
        var parseCommand = commandParser.parseCommand.bind(commandParser);
        var invalidInputs = [
            'not a command',
            '#commandWithoutArgs',
            '#command(invalid)',
            'command(arg="value")',
        ];
        for (var _i = 0, invalidInputs_1 = invalidInputs; _i < invalidInputs_1.length; _i++) {
            var input = invalidInputs_1[_i];
            var result = parseCommand(input);
            assert.strictEqual(result, null);
        }
    });
    it('parseArgs should handle multiple arguments', function () {
        // Access private method using type assertion
        var parseArgs = commandParser.parseArgs.bind(commandParser);
        var result = parseArgs('arg1="value1", arg2="value2", arg3="complex value with spaces"');
        assert.deepStrictEqual(result, {
            arg1: 'value1',
            arg2: 'value2',
            arg3: 'complex value with spaces'
        });
    });
    it('parseArgs should handle empty arguments list', function () {
        // Access private method using type assertion
        var parseArgs = commandParser.parseArgs.bind(commandParser);
        var result = parseArgs('');
        assert.deepStrictEqual(result, {});
    });
});
