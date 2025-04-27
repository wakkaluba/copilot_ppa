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
var globals_1 = require("@jest/globals");
var CommandParser_1 = require("../../../src/services/CommandParser");
var WorkspaceManager_1 = require("../../../src/services/WorkspaceManager");
// Mock the WorkspaceManager
globals_1.jest.mock('../../../src/services/WorkspaceManager');
(0, globals_1.describe)('CommandParser', function () {
    var commandParser;
    var mockWorkspaceManager;
    (0, globals_1.beforeEach)(function () {
        // Reset mocks
        globals_1.jest.clearAllMocks();
        // Create a mock WorkspaceManager
        mockWorkspaceManager = {
            getInstance: globals_1.jest.fn().mockReturnValue(mockWorkspaceManager),
            createFile: globals_1.jest.fn().mockResolvedValue(undefined),
            modifyFile: globals_1.jest.fn().mockResolvedValue(undefined),
            deleteFile: globals_1.jest.fn().mockResolvedValue(undefined),
            readFile: globals_1.jest.fn().mockResolvedValue('File content'),
            fileExists: globals_1.jest.fn().mockResolvedValue(true),
            // Add other methods as needed
        };
        // Mock the WorkspaceManager.getInstance method
        WorkspaceManager_1.WorkspaceManager.getInstance.mockReturnValue(mockWorkspaceManager);
        // Get the CommandParser instance
        commandParser = CommandParser_1.CommandParser.getInstance();
    });
    (0, globals_1.afterEach)(function () {
        globals_1.jest.resetAllMocks();
    });
    (0, globals_1.test)('getInstance should return singleton instance', function () {
        var instance1 = CommandParser_1.CommandParser.getInstance();
        var instance2 = CommandParser_1.CommandParser.getInstance();
        (0, globals_1.expect)(instance1).toBe(instance2);
    });
    (0, globals_1.test)('registerCommand should add a new command handler', function () {
        var mockHandler = globals_1.jest.fn();
        commandParser.registerCommand('testCommand', mockHandler);
        // Use private property access to check if command was registered
        var commands = commandParser.commands;
        (0, globals_1.expect)(commands.has('testCommand')).toBe(true);
        (0, globals_1.expect)(commands.get('testCommand')).toBe(mockHandler);
    });
    (0, globals_1.test)('parseAndExecute should execute a valid command', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockHandler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockHandler = globals_1.jest.fn().mockResolvedValue(undefined);
                    commandParser.registerCommand('testCommand', mockHandler);
                    // Call parseAndExecute with a valid command
                    return [4 /*yield*/, commandParser.parseAndExecute('/testCommand path="test/file.txt"')];
                case 1:
                    // Call parseAndExecute with a valid command
                    _a.sent();
                    // Check if the handler was called with the correct arguments
                    (0, globals_1.expect)(mockHandler).toHaveBeenCalledWith({ path: 'test/file.txt' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('parseAndExecute should handle commands without arguments', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockHandler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockHandler = globals_1.jest.fn().mockResolvedValue(undefined);
                    commandParser.registerCommand('noArgs', mockHandler);
                    // Call parseAndExecute with a command that has no arguments
                    return [4 /*yield*/, commandParser.parseAndExecute('/noArgs')];
                case 1:
                    // Call parseAndExecute with a command that has no arguments
                    _a.sent();
                    // Check if the handler was called with an empty object
                    (0, globals_1.expect)(mockHandler).toHaveBeenCalledWith({});
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('parseAndExecute should return null for invalid commands', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, commandParser.parseAndExecute('not a command')];
                case 1:
                    result = _a.sent();
                    // Check that no command was executed
                    (0, globals_1.expect)(result).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('parseAndExecute should throw for unknown commands', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Call parseAndExecute with a command that isn't registered
                return [4 /*yield*/, (0, globals_1.expect)(commandParser.parseAndExecute('/unknownCommand')).rejects.toThrow('Unknown command')];
                case 1:
                    // Call parseAndExecute with a command that isn't registered
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('parseCommand should correctly parse command name and arguments', function () {
        // Call the private parseCommand method
        var commandObj = commandParser.parseCommand('/testCommand arg1="value1" arg2="value2"');
        // Check that the command was parsed correctly
        (0, globals_1.expect)(commandObj).toEqual({
            name: 'testCommand',
            args: 'arg1="value1" arg2="value2"'
        });
    });
    (0, globals_1.test)('parseArgs should correctly parse string arguments', function () {
        // Call the private parseArgs method
        var args = commandParser.parseArgs('key1="value1" key2="value2"');
        // Check that the arguments were parsed correctly
        (0, globals_1.expect)(args).toEqual({
            key1: 'value1',
            key2: 'value2'
        });
    });
    (0, globals_1.test)('parseArgs should correctly parse numeric arguments', function () {
        // Call the private parseArgs method
        var args = commandParser.parseArgs('num1=123 num2=456.78');
        // Check that the arguments were parsed correctly
        (0, globals_1.expect)(args).toEqual({
            num1: 123,
            num2: 456.78
        });
    });
    (0, globals_1.test)('parseArgs should correctly parse boolean arguments', function () {
        // Call the private parseArgs method
        var args = commandParser.parseArgs('bool1=true bool2=false');
        // Check that the arguments were parsed correctly
        (0, globals_1.expect)(args).toEqual({
            bool1: true,
            bool2: false
        });
    });
    (0, globals_1.test)('createFile should call workspaceManager.createFile', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Call the private createFile method
                return [4 /*yield*/, commandParser.createFile({
                        path: 'test/file.txt',
                        content: 'File content'
                    })];
                case 1:
                    // Call the private createFile method
                    _a.sent();
                    // Check that workspaceManager.createFile was called with the correct arguments
                    (0, globals_1.expect)(mockWorkspaceManager.createFile).toHaveBeenCalledWith('test/file.txt', 'File content');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('modifyFile should call workspaceManager.modifyFile', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Call the private modifyFile method
                return [4 /*yield*/, commandParser.modifyFile({
                        path: 'test/file.txt',
                        changes: 'New content'
                    })];
                case 1:
                    // Call the private modifyFile method
                    _a.sent();
                    // Check that workspaceManager.modifyFile was called with the correct arguments
                    (0, globals_1.expect)(mockWorkspaceManager.modifyFile).toHaveBeenCalledWith('test/file.txt', 'New content');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('deleteFile should call workspaceManager.deleteFile', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Call the private deleteFile method
                return [4 /*yield*/, commandParser.deleteFile({
                        path: 'test/file.txt'
                    })];
                case 1:
                    // Call the private deleteFile method
                    _a.sent();
                    // Check that workspaceManager.deleteFile was called with the correct arguments
                    (0, globals_1.expect)(mockWorkspaceManager.deleteFile).toHaveBeenCalledWith('test/file.txt');
                    return [2 /*return*/];
            }
        });
    }); });
});
