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
exports.LLMAutoConnector = void 0;
var vscode = require("vscode");
var LLMHostManager_1 = require("./LLMHostManager");
var LLMAutoConnector = /** @class */ (function () {
    function LLMAutoConnector() {
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxAttempts = 5;
        this.retryDelay = 2000;
    }
    LLMAutoConnector.getInstance = function () {
        if (!LLMAutoConnector.instance) {
            LLMAutoConnector.instance = new LLMAutoConnector();
        }
        return LLMAutoConnector.instance;
    };
    LLMAutoConnector.prototype.tryConnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hostManager, response, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isConnected) {
                            return [2 /*return*/, true];
                        }
                        hostManager = LLMHostManager_1.LLMHostManager.getInstance();
                        if (!!hostManager.isHostRunning()) return [3 /*break*/, 3];
                        return [4 /*yield*/, hostManager.startHost()];
                    case 1:
                        _a.sent();
                        // Wait for host to initialize
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 2:
                        // Wait for host to initialize
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!(this.connectionAttempts < this.maxAttempts)) return [3 /*break*/, 9];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 8]);
                        return [4 /*yield*/, fetch('http://localhost:11434/api/health')];
                    case 5:
                        response = _a.sent();
                        if (response.ok) {
                            this.isConnected = true;
                            vscode.window.showInformationMessage('Successfully connected to LLM host');
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 8];
                    case 6:
                        error_1 = _a.sent();
                        this.connectionAttempts++;
                        if (this.connectionAttempts >= this.maxAttempts) {
                            vscode.window.showErrorMessage('Failed to connect to LLM host after multiple attempts');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.retryDelay); })];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 3];
                    case 9: return [2 /*return*/, false];
                }
            });
        });
    };
    LLMAutoConnector.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.isConnected = false;
                this.connectionAttempts = 0;
                return [2 /*return*/];
            });
        });
    };
    LLMAutoConnector.prototype.isLLMConnected = function () {
        return this.isConnected;
    };
    return LLMAutoConnector;
}());
exports.LLMAutoConnector = LLMAutoConnector;
