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
var vscode = require("vscode");
var path = require("path");
var fs = require("fs");
var complexityAnalyzer_1 = require("../../src/codeTools/complexityAnalyzer");
jest.mock('child_process', function () { return ({
    execSync: jest.fn(function (command) {
        if (command.includes('radon cc')) {
            return JSON.stringify({
                'test.py': [
                    {
                        name: 'complex_function',
                        lineno: 2,
                        endline: 15,
                        complexity: 12
                    },
                    {
                        name: 'simple_function',
                        lineno: 17,
                        endline: 18,
                        complexity: 1
                    }
                ]
            });
        }
        else if (command.includes('radon mi')) {
            return JSON.stringify({
                'test.py': 65.4
            });
        }
        else if (command.includes('radon hal')) {
            return JSON.stringify({
                'test.py': {
                    h1: 10,
                    h2: 15,
                    N1: 50,
                    N2: 75,
                    vocabulary: 25,
                    length: 125,
                    volume: 200,
                    difficulty: 8,
                    effort: 1600,
                    time: 80,
                    bugs: 0.5
                }
            });
        }
        else if (command.includes('escomplex')) {
            return JSON.stringify({
                complexity: 10
            });
        }
        return '';
    })
}); });
jest.mock('vscode', function () { return ({
    window: {
        createOutputChannel: jest.fn(function () { return ({
            appendLine: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            dispose: jest.fn()
        }); }),
        showErrorMessage: jest.fn(),
        showWarningMessage: jest.fn()
    },
    workspace: {
        getWorkspaceFolder: jest.fn(function () { return ({ uri: { fsPath: '/test-workspace' } }); })
    },
    Uri: {
        file: jest.fn(function (path) { return ({ fsPath: path }); })
    }
}); });
describe('Code Analysis Integration', function () {
    var complexityAnalyzer;
    var testWorkspacePath;
    var pythonTestFile;
    var typescriptTestFile;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Create test workspace
            testWorkspacePath = path.join(__dirname, 'test-workspace');
            if (!fs.existsSync(testWorkspacePath)) {
                fs.mkdirSync(testWorkspacePath, { recursive: true });
            }
            // Create test files
            pythonTestFile = path.join(testWorkspacePath, 'test.py');
            fs.writeFileSync(pythonTestFile, "\ndef complex_function(x):\n    result = 0\n    for i in range(x):\n        if i % 2 == 0:\n            if i % 3 == 0:\n                result += i\n            else:\n                result -= i\n        elif i % 3 == 0:\n            while result > 0:\n                result -= 1\n        else:\n            result += i\n    return result\n\ndef simple_function(x):\n    return x + 1\n");
            typescriptTestFile = path.join(testWorkspacePath, 'test.ts');
            fs.writeFileSync(typescriptTestFile, "\nfunction complexFunction(input: number): number {\n    let result = 0;\n    for (let i = 0; i < input; i++) {\n        if (i % 2 === 0) {\n            if (i % 3 === 0) {\n                result += i;\n            } else {\n                result -= i;\n            }\n        } else if (i % 3 === 0) {\n            while (result > 0) {\n                result--;\n            }\n        } else {\n            result += i;\n        }\n    }\n    return result;\n}\n\nfunction simpleFunction(x: number): number {\n    return x + 1;\n}\n");
            // Initialize analyzer
            complexityAnalyzer = new complexityAnalyzer_1.ComplexityAnalyzer();
            return [2 /*return*/];
        });
    }); });
    afterAll(function () {
        // Clean up test files
        fs.rmSync(testWorkspacePath, { recursive: true, force: true });
        complexityAnalyzer.dispose();
    });
    describe('Python Code Analysis', function () {
        test('analyzes Python file complexity correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var outputChannel, complexFuncCall, simpleFuncCall;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock the active editor
                        vscode.window.activeTextEditor = {
                            document: {
                                uri: { fsPath: pythonTestFile },
                                save: jest.fn().mockResolvedValue(true)
                            }
                        };
                        return [4 /*yield*/, complexityAnalyzer.analyzeFile()];
                    case 1:
                        _a.sent();
                        outputChannel = vscode.window.createOutputChannel.mock.results[0].value;
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('complex_function'));
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('simple_function'));
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Cyclomatic Complexity'));
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Maintainability Index'));
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Halstead Metrics'));
                        complexFuncCall = outputChannel.appendLine.mock.calls.find(function (call) { return call[0].includes('complex_function'); });
                        simpleFuncCall = outputChannel.appendLine.mock.calls.find(function (call) { return call[0].includes('simple_function'); });
                        expect(complexFuncCall[0]).toMatch(/Complexity: 12/);
                        expect(simpleFuncCall[0]).toMatch(/Complexity: 1/);
                        return [2 /*return*/];
                }
            });
        }); });
        test('generates maintainability metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var outputChannel, ratingCall;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock the active editor
                        vscode.window.activeTextEditor = {
                            document: {
                                uri: { fsPath: pythonTestFile },
                                save: jest.fn().mockResolvedValue(true)
                            }
                        };
                        return [4 /*yield*/, complexityAnalyzer.analyzeFile()];
                    case 1:
                        _a.sent();
                        outputChannel = vscode.window.createOutputChannel.mock.results[0].value;
                        // Verify maintainability index
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('65.4'));
                        ratingCall = outputChannel.appendLine.mock.calls.find(function (call) { return call[0].includes('Rating:'); });
                        expect(ratingCall[0]).toMatch(/Rating: [ABC]/);
                        return [2 /*return*/];
                }
            });
        }); });
        test('generates Halstead metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var outputChannel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock the active editor
                        vscode.window.activeTextEditor = {
                            document: {
                                uri: { fsPath: pythonTestFile },
                                save: jest.fn().mockResolvedValue(true)
                            }
                        };
                        return [4 /*yield*/, complexityAnalyzer.analyzeFile()];
                    case 1:
                        _a.sent();
                        outputChannel = vscode.window.createOutputChannel.mock.results[0].value;
                        // Verify Halstead metrics
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Vocabulary: 25'));
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Volume: 200'));
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Difficulty: 8'));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('TypeScript Code Analysis', function () {
        test('analyzes TypeScript file complexity correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var outputChannel, cp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock the active editor
                        vscode.window.activeTextEditor = {
                            document: {
                                uri: { fsPath: typescriptTestFile },
                                save: jest.fn().mockResolvedValue(true)
                            }
                        };
                        return [4 /*yield*/, complexityAnalyzer.analyzeFile()];
                    case 1:
                        _a.sent();
                        outputChannel = vscode.window.createOutputChannel.mock.results[0].value;
                        // Basic TypeScript analysis should be logged
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('Analyzing complexity'));
                        expect(outputChannel.appendLine).toHaveBeenCalledWith(expect.stringContaining('test.ts'));
                        cp = require('child_process');
                        expect(cp.execSync).toHaveBeenCalledWith(expect.stringMatching(/(plato|escomplex|complexity-report)/));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
