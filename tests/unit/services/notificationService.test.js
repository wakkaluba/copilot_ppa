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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var sinon = require("sinon");
var assert = require("assert");
var notificationService_1 = require("../../../src/services/notificationService");
suite('NotificationService Tests', function () {
    var notificationService;
    var sandbox;
    var showInformationMessageStub;
    var showWarningMessageStub;
    var showErrorMessageStub;
    var withProgressStub;
    setup(function () {
        sandbox = sinon.createSandbox();
        // Stub VS Code window notification methods
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
        showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage');
        showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
        withProgressStub = sandbox.stub(vscode.window, 'withProgress');
        notificationService = notificationService_1.NotificationService.getInstance();
    });
    teardown(function () {
        sandbox.restore();
    });
    test('getInstance should return the same instance', function () {
        var instance1 = notificationService_1.NotificationService.getInstance();
        var instance2 = notificationService_1.NotificationService.getInstance();
        assert.strictEqual(instance1, instance2);
    });
    test('showInformation should show information message', function () { return __awaiter(void 0, void 0, void 0, function () {
        var message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = 'Test information message';
                    showInformationMessageStub.resolves();
                    return [4 /*yield*/, notificationService.showInformation(message)];
                case 1:
                    _a.sent();
                    assert(showInformationMessageStub.calledOnce);
                    assert(showInformationMessageStub.calledWith(message));
                    return [2 /*return*/];
            }
        });
    }); });
    test('showWarning should show warning message', function () { return __awaiter(void 0, void 0, void 0, function () {
        var message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = 'Test warning message';
                    showWarningMessageStub.resolves();
                    return [4 /*yield*/, notificationService.showWarning(message)];
                case 1:
                    _a.sent();
                    assert(showWarningMessageStub.calledOnce);
                    assert(showWarningMessageStub.calledWith(message));
                    return [2 /*return*/];
            }
        });
    }); });
    test('showError should show error message', function () { return __awaiter(void 0, void 0, void 0, function () {
        var message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = 'Test error message';
                    showErrorMessageStub.resolves();
                    return [4 /*yield*/, notificationService.showError(message)];
                case 1:
                    _a.sent();
                    assert(showErrorMessageStub.calledOnce);
                    assert(showErrorMessageStub.calledWith(message));
                    return [2 /*return*/];
            }
        });
    }); });
    test('showProgress should show progress notification', function () { return __awaiter(void 0, void 0, void 0, function () {
        var title, task, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    title = 'Test Progress';
                    task = sinon.stub().resolves('test result');
                    withProgressStub.resolves('test result');
                    return [4 /*yield*/, notificationService.showProgress(title, task)];
                case 1:
                    result = _a.sent();
                    assert(withProgressStub.calledOnce);
                    assert.strictEqual(result, 'test result');
                    assert(withProgressStub.firstCall.args[0].title === title);
                    assert(withProgressStub.firstCall.args[0].location === vscode.ProgressLocation.Notification);
                    return [2 /*return*/];
            }
        });
    }); });
    test('showError should include error details when error object provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = 'Test error message';
                    error = new Error('Detailed error info');
                    showErrorMessageStub.resolves();
                    return [4 /*yield*/, notificationService.showError(message, error)];
                case 1:
                    _a.sent();
                    assert(showErrorMessageStub.calledOnce);
                    assert(showErrorMessageStub.calledWith("".concat(message, ": ").concat(error.message)));
                    return [2 /*return*/];
            }
        });
    }); });
    test('showInformation with items should show items and handle selection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var message, items, callback;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = 'Select an option';
                    items = ['Option 1', 'Option 2'];
                    callback = sinon.stub();
                    showInformationMessageStub.resolves('Option 1');
                    return [4 /*yield*/, notificationService.showInformation(message, items, callback)];
                case 1:
                    _a.sent();
                    assert(showInformationMessageStub.calledOnce);
                    assert(showInformationMessageStub.calledWith.apply(showInformationMessageStub, __spreadArray([message], items, false)));
                    assert(callback.calledOnce);
                    assert(callback.calledWith('Option 1'));
                    return [2 /*return*/];
            }
        });
    }); });
});
