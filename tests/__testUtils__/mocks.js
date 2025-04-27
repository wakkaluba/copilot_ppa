"use strict";
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var _a;
var _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockHardwareSpecs = exports.mockContext = void 0;
var vscode = require("vscode");
// Define ExtensionMode values if not available in test environment
var ExtensionMode;
(function (ExtensionMode) {
    ExtensionMode[ExtensionMode["Production"] = 1] = "Production";
    ExtensionMode[ExtensionMode["Development"] = 2] = "Development";
    ExtensionMode[ExtensionMode["Test"] = 3] = "Test";
})(ExtensionMode || (ExtensionMode = {}));
exports.mockContext = {
    subscriptions: [],
    extensionPath: '/test/path',
    extensionUri: vscode.Uri.parse('file:///test/path'),
    storageUri: vscode.Uri.parse('file:///test/storage'),
    globalStorageUri: vscode.Uri.parse('file:///test/globalStorage'),
    logUri: vscode.Uri.parse('file:///test/log'),
    asAbsolutePath: function (p) { return "/test/path/".concat(p); },
    storagePath: '/test/storagePath',
    globalStoragePath: '/test/globalStoragePath',
    logPath: '/test/logPath',
    extensionMode: (((_b = vscode.ExtensionMode) === null || _b === void 0 ? void 0 : _b.Development) || ExtensionMode.Development),
    globalState: {
        keys: function () { return []; },
        get: function (key) { return undefined; },
        update: function (key, value) { return Promise.resolve(); },
        setKeysForSync: function (keys) { }
    },
    workspaceState: {
        keys: function () { return []; },
        get: function (key) { return undefined; },
        update: function (key, value) { return Promise.resolve(); }
    },
    secrets: {
        get: function (key) { return Promise.resolve(undefined); },
        store: function (key, value) { return Promise.resolve(); },
        delete: function (key) { return Promise.resolve(); },
        onDidChange: new vscode.EventEmitter().event
    },
    environmentVariableCollection: (_a = {
            persistent: true,
            description: undefined,
            replace: function (variable, value) { },
            append: function (variable, value) { },
            prepend: function (variable, value) { },
            get: function (variable) { return undefined; },
            forEach: function (callback, thisArg) { },
            delete: function (variable) { },
            clear: function () { },
            getScoped: function (scope) {
                var _a;
                return (_a = {
                        persistent: true,
                        description: undefined,
                        replace: function () { },
                        append: function () { },
                        prepend: function () { },
                        get: function () { return undefined; },
                        forEach: function () { },
                        delete: function () { },
                        clear: function () { }
                    },
                    _a[Symbol.iterator] = function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [5 /*yield**/, __values([])];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    }); },
                    _a);
            }
        },
        _a[Symbol.iterator] = function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [5 /*yield**/, __values([])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        }); },
        _a),
    extension: {
        id: 'test-extension',
        extensionUri: vscode.Uri.parse('file:///test/path'),
        extensionPath: '/test/path',
        isActive: true,
        packageJSON: {},
        exports: undefined,
        activate: function () { return Promise.resolve(); },
        extensionKind: vscode.ExtensionKind.Workspace
    },
    languageModelAccessInformation: {
        onDidChange: new vscode.EventEmitter().event,
        canSendRequest: function (chat) { return true; }
    }
};
exports.mockHardwareSpecs = {
    gpu: {
        available: true,
        name: 'Test GPU',
        vram: 4096,
        cudaSupport: true
    },
    ram: {
        total: 16384,
        free: 8192
    },
    cpu: {
        cores: 8,
        model: 'Test CPU'
    }
};
