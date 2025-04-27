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
var sinon = require("sinon");
var assert_1 = require("assert");
var staticAnalysis_1 = require("../../../src/services/staticAnalysis");
var types_1 = require("../../../src/services/types");
var mockHelpers_1 = require("../../helpers/mockHelpers");
suite('StaticAnalysisService Tests', function () {
    var service;
    var sandbox;
    var outputChannel;
    var context;
    var execSyncStub;
    setup(function () {
        sandbox = sinon.createSandbox();
        outputChannel = (0, mockHelpers_1.createMockOutputChannel)();
        context = (0, mockHelpers_1.createMockExtensionContext)();
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);
        sandbox.stub(vscode.workspace, 'getWorkspaceFolder').returns((0, mockHelpers_1.createMockWorkspaceFolder)());
        execSyncStub = sandbox.stub(require('child_process'), 'execSync');
        service = new staticAnalysis_1.StaticAnalysisService(context);
    });
    teardown(function () {
        sandbox.restore();
    });
    test('initialize should set up analysis tools', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, service.initialize()];
                case 1:
                    _a.sent();
                    assert_1.strict.ok(outputChannel.show.called);
                    assert_1.strict.ok(outputChannel.clear.called);
                    return [2 /*return*/];
            }
        });
    }); });
    test('runAnalysis should execute ESLint analysis correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = {
                        tool: types_1.StaticAnalysisTool.ESLint,
                        path: '/test/path',
                        config: { extends: 'standard' }
                    };
                    execSyncStub.returns(Buffer.from("\n            /test/file.js: line 10, col 5, error - Expected '===' and instead saw '==' (eqeqeq)\n            /test/file.js: line 15, col 3, warning - Unexpected console statement (no-console)\n        "));
                    return [4 /*yield*/, service.runAnalysis(request)];
                case 1:
                    result = _a.sent();
                    assert_1.strict.ok(result.success);
                    assert_1.strict.ok(result.analysis);
                    assert_1.strict.strictEqual(result.analysis.issues.length, 2);
                    assert_1.strict.ok(result.analysis.issues.some(function (i) { return i.message.includes('eqeqeq'); }));
                    assert_1.strict.ok(result.analysis.issues.some(function (i) { return i.message.includes('no-console'); }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('runAnalysis should execute Prettier analysis correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = {
                        tool: types_1.StaticAnalysisTool.Prettier,
                        path: '/test/path'
                    };
                    execSyncStub.returns(Buffer.from("\n            2 files would be reformatted:\n            /test/file1.js\n            /test/file2.js\n        "));
                    return [4 /*yield*/, service.runAnalysis(request)];
                case 1:
                    result = _a.sent();
                    assert_1.strict.ok(result.success);
                    assert_1.strict.ok(result.analysis);
                    assert_1.strict.strictEqual(result.analysis.issueCount, 2);
                    return [2 /*return*/];
            }
        });
    }); });
    test('runAnalysis should execute Stylelint analysis correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = {
                        tool: types_1.StaticAnalysisTool.Stylelint,
                        path: '/test/path'
                    };
                    execSyncStub.returns(Buffer.from("\n            test.css\n              10:5  \u2716  Expected indentation of 2 spaces (indentation)\n              15:3  \u2716  Expected double quotes (string-quotes)\n        "));
                    return [4 /*yield*/, service.runAnalysis(request)];
                case 1:
                    result = _a.sent();
                    assert_1.strict.ok(result.success);
                    assert_1.strict.ok(result.analysis);
                    assert_1.strict.strictEqual(result.analysis.issues.length, 2);
                    return [2 /*return*/];
            }
        });
    }); });
    test('runAnalysis should execute SonarQube analysis correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = {
                        tool: types_1.StaticAnalysisTool.SonarQube,
                        path: '/test/path'
                    };
                    execSyncStub.returns(Buffer.from(JSON.stringify({
                        issues: [
                            {
                                message: 'Remove unused variable',
                                component: '/test/file.js',
                                line: 10,
                                severity: 'MAJOR'
                            },
                            {
                                message: 'Add missing documentation',
                                component: '/test/file.js',
                                line: 15,
                                severity: 'MINOR'
                            }
                        ]
                    })));
                    return [4 /*yield*/, service.runAnalysis(request)];
                case 1:
                    result = _a.sent();
                    assert_1.strict.ok(result.success);
                    assert_1.strict.ok(result.analysis);
                    assert_1.strict.strictEqual(result.analysis.issues.length, 2);
                    assert_1.strict.ok(result.analysis.issues.some(function (i) { return i.severity === 'MAJOR'; }));
                    assert_1.strict.ok(result.analysis.issues.some(function (i) { return i.severity === 'MINOR'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('runAnalysis should handle tool execution errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, error, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = {
                        tool: types_1.StaticAnalysisTool.ESLint,
                        path: '/test/path'
                    };
                    error = new Error('Command failed');
                    execSyncStub.throws(error);
                    return [4 /*yield*/, service.runAnalysis(request)];
                case 1:
                    result = _a.sent();
                    assert_1.strict.strictEqual(result.success, false);
                    assert_1.strict.ok(result.error);
                    assert_1.strict.strictEqual(result.error.message, error.message);
                    return [2 /*return*/];
            }
        });
    }); });
    test('runAnalysis should handle invalid tool configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = {
                        tool: 'unknown',
                        path: '/test/path'
                    };
                    return [4 /*yield*/, service.runAnalysis(request)];
                case 1:
                    result = _a.sent();
                    assert_1.strict.strictEqual(result.success, false);
                    assert_1.strict.ok(result.message.includes('not supported'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('runAnalysis should handle empty output', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = {
                        tool: types_1.StaticAnalysisTool.ESLint,
                        path: '/test/path'
                    };
                    execSyncStub.returns(Buffer.from(''));
                    return [4 /*yield*/, service.runAnalysis(request)];
                case 1:
                    result = _a.sent();
                    assert_1.strict.ok(result.success);
                    assert_1.strict.ok(result.analysis);
                    assert_1.strict.strictEqual(result.analysis.issueCount, 0);
                    return [2 /*return*/];
            }
        });
    }); });
    test('analyzeWorkspace should run analysis on all supported files', function () { return __awaiter(void 0, void 0, void 0, function () {
        var workspaceFolder, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workspaceFolder = (0, mockHelpers_1.createMockWorkspaceFolder)();
                    sandbox.stub(vscode.workspace, 'findFiles').resolves([
                        vscode.Uri.file('/test/file1.js'),
                        vscode.Uri.file('/test/file2.ts'),
                        vscode.Uri.file('/test/style.css')
                    ]);
                    execSyncStub.returns(Buffer.from(''));
                    return [4 /*yield*/, service.analyzeWorkspace(workspaceFolder)];
                case 1:
                    results = _a.sent();
                    assert_1.strict.ok(Array.isArray(results));
                    assert_1.strict.ok(results.every(function (r) { return r.success; }));
                    assert_1.strict.strictEqual(results.length, 3);
                    return [2 /*return*/];
            }
        });
    }); });
    test('getToolConfig should return appropriate config for each tool', function () {
        var eslintConfig = service.getToolConfig(types_1.StaticAnalysisTool.ESLint);
        var prettierConfig = service.getToolConfig(types_1.StaticAnalysisTool.Prettier);
        var stylelintConfig = service.getToolConfig(types_1.StaticAnalysisTool.Stylelint);
        assert_1.strict.ok(eslintConfig.extends);
        assert_1.strict.ok(prettierConfig.printWidth);
        assert_1.strict.ok(stylelintConfig.rules);
    });
});
