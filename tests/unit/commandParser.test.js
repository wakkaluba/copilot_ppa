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
// Remove unused import: vscode
// import * as vscode from 'vscode';
var commandParser_1 = require("../../../src/services/commandParser");
var globals_1 = require("@jest/globals");
// Mocks
var mockWorkspaceManager = {
    createFile: globals_1.jest.fn().mockResolvedValue(undefined), // Fix mock return type
    modifyFile: globals_1.jest.fn().mockResolvedValue(undefined), // Fix mock return type
    deleteFile: globals_1.jest.fn().mockResolvedValue(undefined), // Fix mock return type
    readFile: globals_1.jest.fn().mockResolvedValue('File content'), // Fix mock return type
    fileExists: globals_1.jest.fn().mockResolvedValue(true), // Fix mock return type
    listDirectory: globals_1.jest.fn().mockResolvedValue(['file1.txt', 'subdir/']),
}; // Use jest.Mocked for type safety
var mockLogger = {
    info: globals_1.jest.fn(),
    warn: globals_1.jest.fn(),
    error: globals_1.jest.fn(),
    debug: globals_1.jest.fn(),
    setLogLevel: globals_1.jest.fn(),
    getLogs: globals_1.jest.fn().mockReturnValue([]),
    log: globals_1.jest.fn(), // Keep if used, otherwise remove
}; // Use jest.Mocked
(0, globals_1.describe)('CommandParser', function () {
    var commandParser;
    (0, globals_1.beforeEach)(function () {
        globals_1.jest.clearAllMocks();
        // Assuming CommandParser takes WorkspaceManager and Logger
        commandParser = new commandParser_1.CommandParser(mockWorkspaceManager, mockLogger);
    });
    (0, globals_1.test)('should register and execute a command with arguments', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockHandler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockHandler = globals_1.jest.fn().mockResolvedValue(undefined);
                    commandParser.registerCommand('testCommand', mockHandler);
                    return [4 /*yield*/, commandParser.parseAndExecute('/testCommand arg1 "arg 2"')];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(mockHandler).toHaveBeenCalledWith({ arg1: true, 'arg 2': true });
                    (0, globals_1.expect)(mockLogger.info).toHaveBeenCalledWith("Executing command: testCommand with args:", { arg1: true, 'arg 2': true });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('should register and execute a command without arguments', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockHandler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockHandler = globals_1.jest.fn().mockResolvedValue(undefined);
                    commandParser.registerCommand('noArgs', mockHandler);
                    return [4 /*yield*/, commandParser.parseAndExecute('/noArgs')];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(mockHandler).toHaveBeenCalledWith({});
                    (0, globals_1.expect)(mockLogger.info).toHaveBeenCalledWith("Executing command: noArgs with args:", {});
                    return [2 /*return*/];
            }
        });
    }); });
    // ... other tests ...
    (0, globals_1.test)('should parse and execute /create_file command', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, commandParser.parseAndExecute('/create_file path/to/new_file.txt "Initial content"')];
                case 1:
                    _a.sent();
                    // Check if the correct WorkspaceManager method was called
                    (0, globals_1.expect)(mockWorkspaceManager.createFile).toHaveBeenCalledWith('path/to/new_file.txt', 'Initial content');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('should parse and execute /modify_file command', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, commandParser.parseAndExecute('/modify_file path/to/existing_file.txt "New content"')];
                case 1:
                    _a.sent();
                    // Check if the correct WorkspaceManager method was called (assuming modifyFile exists)
                    (0, globals_1.expect)(mockWorkspaceManager.modifyFile).toHaveBeenCalledWith('path/to/existing_file.txt', 'New content');
                    return [2 /*return*/];
            }
        });
    }); });
    // ... rest of the tests ...
});
