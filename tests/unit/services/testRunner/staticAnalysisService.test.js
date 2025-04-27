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
var sinon = require("sinon");
var assert = require("assert");
var staticAnalysisService_1 = require("../../../../src/services/testRunner/staticAnalysisService");
suite('StaticAnalysisService Tests', function () {
    var service;
    var sandbox;
    var execSyncStub;
    setup(function () {
        sandbox = sinon.createSandbox();
        execSyncStub = sandbox.stub(require('child_process'), 'execSync');
        service = new staticAnalysisService_1.StaticAnalysisService();
    });
    teardown(function () {
        sandbox.restore();
    });
    test('processAnalysisResult should handle ESLint output', function () {
        var result = {
            success: true,
            stdout: "\n                /test/file.js: line 10, col 5, error - Expected '===' and instead saw '==' (eqeqeq)\n                /test/file.js: line 15, col 3, warning - Unexpected console statement (no-console)\n            ",
            stderr: ''
        };
        var processed = service.processAnalysisResult('eslint', result);
        assert.ok(processed.staticAnalysis);
        assert.ok(processed.staticAnalysis.issues);
        assert.strictEqual(processed.staticAnalysis.issues.length, 2);
        assert.ok(processed.staticAnalysis.issues.some(function (i) { return i.message.includes('eqeqeq'); }));
        assert.ok(processed.staticAnalysis.issues.some(function (i) { return i.message.includes('no-console'); }));
    });
    test('processAnalysisResult should handle Prettier output', function () {
        var result = {
            success: true,
            stdout: "\n                2 files would be reformatted.\n                /test/file1.js\n                /test/file2.js\n            ",
            stderr: ''
        };
        var processed = service.processAnalysisResult('prettier', result);
        assert.ok(processed.staticAnalysis);
        assert.strictEqual(processed.staticAnalysis.issueCount, 2);
        assert.strictEqual(processed.message, 'Found 2 issues that need to be fixed');
    });
    test('processAnalysisResult should handle Stylelint output', function () {
        var result = {
            success: true,
            stdout: "\n                /test/style.css\n                  10:5  \u2716  Expected indentation of 2 spaces (indentation)\n                  15:3  \u2716  Expected double quotes (string-quotes)\n            ",
            stderr: ''
        };
        var processed = service.processAnalysisResult('stylelint', result);
        assert.ok(processed.staticAnalysis);
        assert.strictEqual(processed.staticAnalysis.issueCount, 2);
        assert.ok(processed.message.includes('2 issues'));
    });
    test('processAnalysisResult should handle SonarQube output', function () {
        var result = {
            success: true,
            stdout: JSON.stringify({
                issues: [
                    {
                        message: 'Remove this unused variable',
                        component: '/test/file.js',
                        line: 10,
                        severity: 'MAJOR'
                    },
                    {
                        message: 'Add a nested comment explaining why this function is empty',
                        component: '/test/file.js',
                        line: 15,
                        severity: 'MINOR'
                    }
                ]
            }),
            stderr: ''
        };
        var processed = service.processAnalysisResult('sonarqube', result);
        assert.ok(processed.staticAnalysis);
        assert.strictEqual(processed.staticAnalysis.issues.length, 2);
        assert.ok(processed.staticAnalysis.issues.some(function (i) { return i.severity === 'MAJOR'; }));
        assert.ok(processed.staticAnalysis.issues.some(function (i) { return i.severity === 'MINOR'; }));
    });
    test('runAnalysis should execute correct tool command', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    execSyncStub.returns('No issues found');
                    return [4 /*yield*/, service.runAnalysis({
                            tool: 'eslint',
                            path: '/test/path',
                            config: { extends: 'standard' }
                        })];
                case 1:
                    _a.sent();
                    assert.ok(execSyncStub.calledOnce);
                    assert.ok(execSyncStub.firstCall.args[0].includes('eslint'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('runAnalysis should handle tool execution errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var error, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    error = new Error('Command failed');
                    execSyncStub.throws(error);
                    return [4 /*yield*/, service.runAnalysis({
                            tool: 'eslint',
                            path: '/test/path'
                        })];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result.success, false);
                    assert.ok(result.error);
                    assert.strictEqual(result.error.message, error.message);
                    return [2 /*return*/];
            }
        });
    }); });
    test('runAnalysis should handle missing tool configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, service.runAnalysis({
                        tool: 'unknown-tool',
                        path: '/test/path'
                    })];
                case 1:
                    result = _a.sent();
                    assert.strictEqual(result.success, false);
                    assert.ok(result.message.includes('not supported'));
                    return [2 /*return*/];
            }
        });
    }); });
});
