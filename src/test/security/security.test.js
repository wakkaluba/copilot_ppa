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
var vscode = require("vscode");
var agent_1 = require("../../agent/agent");
var securityScanner_1 = require("./securityScanner");
suite('Security Test Suite', function () {
    var agent;
    var scanner;
    suiteSetup(function () {
        agent = new agent_1.Agent();
        scanner = new securityScanner_1.SecurityScanner();
    });
    test('Workspace Trust Check', function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTrusted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.workspace.isTrusted];
                case 1:
                    isTrusted = _a.sent();
                    assert.strictEqual(isTrusted, true, 'Workspace must be trusted');
                    return [2 /*return*/];
            }
        });
    }); });
    test('File Permission Check', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, scanner.checkFilePermissions()];
                case 1:
                    result = _a.sent();
                    assert.ok(result.success, 'File permissions should be properly set');
                    return [2 /*return*/];
            }
        });
    }); });
    test('Data Encryption Test', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testData, encrypted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testData = 'sensitive data';
                    return [4 /*yield*/, scanner.checkDataEncryption(testData)];
                case 1:
                    encrypted = _a.sent();
                    assert.ok(encrypted !== testData, 'Data should be encrypted');
                    return [2 /*return*/];
            }
        });
    }); });
    test('API Security Check', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, scanner.checkAPIEndpoints()];
                case 1:
                    result = _a.sent();
                    assert.ok(result.usesHTTPS, 'API endpoints should use HTTPS');
                    assert.ok(result.hasAuthentication, 'API endpoints should require authentication');
                    return [2 /*return*/];
            }
        });
    }); });
    test('Input Validation Test', function () { return __awaiter(void 0, void 0, void 0, function () {
        var maliciousInput, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    maliciousInput = '<script>alert("xss")</script>';
                    return [4 /*yield*/, scanner.validateInput(maliciousInput)];
                case 1:
                    result = _a.sent();
                    assert.ok(!result.hasSecurityRisks, 'Should detect and prevent malicious input');
                    return [2 /*return*/];
            }
        });
    }); });
    test('Resource Access Control', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, scanner.checkResourceAccess()];
                case 1:
                    result = _a.sent();
                    assert.ok(result.hasProperIsolation, 'Resources should be properly isolated');
                    return [2 /*return*/];
            }
        });
    }); });
});
