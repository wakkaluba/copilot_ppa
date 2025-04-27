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
exports.LLMHostManager = void 0;
var vscode = require("vscode");
var child_process = require("child_process");
var LLMHostManager = /** @class */ (function () {
    function LLMHostManager() {
        this.process = null;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.updateStatus('stopped');
    }
    LLMHostManager.getInstance = function () {
        if (!this.instance) {
            this.instance = new LLMHostManager();
        }
        return this.instance;
    };
    LLMHostManager.prototype.startHost = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, hostPath, modelPath;
            var _this = this;
            return __generator(this, function (_a) {
                config = vscode.workspace.getConfiguration('copilot-ppa');
                hostPath = config.get('llmHostPath');
                modelPath = config.get('modelPath');
                if (!hostPath || !modelPath) {
                    throw new Error('LLM host path or model path not configured');
                }
                this.process = child_process.spawn(hostPath, ['--model', modelPath]);
                this.updateStatus('starting');
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a, _b, _c, _d, _e, _f;
                        (_b = (_a = _this.process) === null || _a === void 0 ? void 0 : _a.stdout) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
                            if (data.toString().includes('Model loaded')) {
                                _this.updateStatus('running');
                                resolve();
                            }
                        });
                        (_d = (_c = _this.process) === null || _c === void 0 ? void 0 : _c.stderr) === null || _d === void 0 ? void 0 : _d.on('data', function (data) {
                            console.error("LLM Host Error: ".concat(data));
                        });
                        (_e = _this.process) === null || _e === void 0 ? void 0 : _e.on('error', function (error) {
                            _this.updateStatus('error');
                            reject(error);
                        });
                        (_f = _this.process) === null || _f === void 0 ? void 0 : _f.on('exit', function (code) {
                            _this.updateStatus('stopped');
                            if (code !== 0) {
                                reject(new Error("Host process exited with code ".concat(code)));
                            }
                        });
                    })];
            });
        });
    };
    LLMHostManager.prototype.stopHost = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.process) {
                    this.process.kill();
                    this.process = null;
                    this.updateStatus('stopped');
                }
                return [2 /*return*/];
            });
        });
    };
    LLMHostManager.prototype.updateStatus = function (status) {
        var icons = {
            stopped: '$(debug-stop)',
            starting: '$(sync~spin)',
            running: '$(check)',
            error: '$(error)'
        };
        this.statusBarItem.text = "".concat(icons[status], " LLM Host: ").concat(status);
        this.statusBarItem.show();
    };
    LLMHostManager.prototype.dispose = function () {
        this.stopHost();
        this.statusBarItem.dispose();
    };
    return LLMHostManager;
}());
exports.LLMHostManager = LLMHostManager;
