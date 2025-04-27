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
var bestPracticesChecker_1 = require("../../../../src/services/codeQuality/bestPracticesChecker");
var mockHelpers_1 = require("../../../helpers/mockHelpers");
suite('BestPracticesChecker Tests', function () {
    var checker;
    var sandbox;
    var outputChannel;
    var context;
    setup(function () {
        sandbox = sinon.createSandbox();
        outputChannel = (0, mockHelpers_1.createMockOutputChannel)();
        context = (0, mockHelpers_1.createMockExtensionContext)();
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);
        checker = new bestPracticesChecker_1.BestPracticesChecker(context);
    });
    teardown(function () {
        sandbox.restore();
    });
    test('checkCodeStyle should detect var usage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function test() {\n                var x = 1;\n                return x;\n            }\n        ");
                    return [4 /*yield*/, checker.checkCodeStyle(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('var'); }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'convention'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('checkCodeStyle should detect console.log usage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function debug() {\n                console.log('debugging');\n                console.error('error');\n            }\n        ");
                    return [4 /*yield*/, checker.checkCodeStyle(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('console.log'); }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'debugging'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('checkTypes should detect missing type annotations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function add(a, b) {\n                return a + b;\n            }\n        ");
                    return [4 /*yield*/, checker.checkTypes(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('type annotation'); }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'typing'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('checkVariables should detect magic numbers', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function calculateDiscount(price) {\n                return price * 0.15;\n            }\n        ");
                    return [4 /*yield*/, checker.checkVariables(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('magic number'); }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'maintainability'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('checkFunctionLength should detect long functions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function processData() {\n                let result = 0;\n                // ... 30 lines of code ...\n                for (let i = 0; i < 10; i++) {\n                    for (let j = 0; j < 10; j++) {\n                        result += i * j;\n                    }\n                }\n                // ... more lines of code ...\n                return result;\n            }\n        ");
                    return [4 /*yield*/, checker.checkFunctionLength(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('function length'); }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'complexity'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('checkSingleResponsibility should detect multiple responsibility functions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function processAndValidateAndSaveData(data) {\n                // Validation\n                if (!data.id) throw new Error('No ID');\n                \n                // Processing\n                const processed = transform(data);\n                \n                // Saving\n                saveToDatabase(processed);\n                \n                return processed;\n            }\n        ");
                    return [4 /*yield*/, checker.checkSingleResponsibility(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('single responsibility'); }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'design'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('checkNaming should detect inconsistent naming conventions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            class userManager {\n                GetUser(userId) {\n                    return this._fetch_user_data(userId);\n                }\n                \n                _fetch_user_data(id) {\n                    return { id };\n                }\n            }\n        ");
                    return [4 /*yield*/, checker.checkNaming(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('naming convention'); }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'convention'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('checkDocumentation should check documentation completeness', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            class UserService {\n                processUserData(data) {\n                    if (!this.validateData(data)) {\n                        throw new Error('Invalid data');\n                    }\n                    return this.transformData(data);\n                }\n            }\n        ");
                    return [4 /*yield*/, checker.checkDocumentation(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('documentation'); }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'documentation'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('checkErrorHandling should detect missing error handling', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            async function fetchData() {\n                const response = await fetch('api/data');\n                const data = await response.json();\n                return data;\n            }\n        ");
                    return [4 /*yield*/, checker.checkErrorHandling(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.message.includes('error handling'); }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'reliability'; }));
                    return [2 /*return*/];
            }
        });
    }); });
    test('checkAll should run all checks', function () { return __awaiter(void 0, void 0, void 0, function () {
        var document, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    document = (0, mockHelpers_1.createMockDocument)("\n            function problematicFunction() {\n                var result = 0;\n                console.log('debug');\n                return result * 0.15;\n            }\n        ");
                    return [4 /*yield*/, checker.checkAll(document)];
                case 1:
                    issues = _a.sent();
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'convention'; }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'debugging'; }));
                    assert_1.strict.ok(issues.some(function (i) { return i.type === 'maintainability'; }));
                    return [2 /*return*/];
            }
        });
    }); });
});
