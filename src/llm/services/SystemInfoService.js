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
exports.SystemInfoService = void 0;
var os = require("os");
var vscode = require("vscode");
var child_process_1 = require("child_process");
var util_1 = require("util");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var SystemInfoService = /** @class */ (function () {
    function SystemInfoService() {
        this.cachedInfo = null;
        this.outputChannel = vscode.window.createOutputChannel('System Info');
    }
    SystemInfoService.prototype.getSystemInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalMemoryGB, freeDiskSpaceGB, cudaInfo, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.cachedInfo) {
                            return [2 /*return*/, this.cachedInfo];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        totalMemoryGB = Math.floor(os.totalmem() / (1024 * 1024 * 1024));
                        return [4 /*yield*/, this.getFreeDiskSpace()];
                    case 2:
                        freeDiskSpaceGB = _a.sent();
                        return [4 /*yield*/, this.getCUDAInfo()];
                    case 3:
                        cudaInfo = _a.sent();
                        this.cachedInfo = {
                            totalMemoryGB: totalMemoryGB,
                            freeDiskSpaceGB: freeDiskSpaceGB,
                            cpuCores: os.cpus().length,
                            cudaAvailable: cudaInfo.available,
                            cudaVersion: cudaInfo.version
                        };
                        this.outputChannel.appendLine("System info collected: ".concat(JSON.stringify(this.cachedInfo, null, 2)));
                        return [2 /*return*/, this.cachedInfo];
                    case 4:
                        error_1 = _a.sent();
                        this.outputChannel.appendLine("Error collecting system info: ".concat(error_1));
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SystemInfoService.prototype.getFreeDiskSpace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, lines, totalFreeSpace, stdout, lines, parts, free, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                        return [4 /*yield*/, execAsync('wmic logicaldisk get freespace,caption')];
                    case 1:
                        stdout = (_b.sent()).stdout;
                        lines = stdout.trim().split('\n').slice(1);
                        totalFreeSpace = lines.reduce(function (acc, line) {
                            var parts = line.trim().split(/\s+/);
                            var freeSpace = parts[1];
                            return acc + (freeSpace ? parseInt(freeSpace, 10) : 0);
                        }, 0);
                        return [2 /*return*/, Math.round(totalFreeSpace / (1024 * 1024 * 1024))]; // Convert to GB
                    case 2: return [4 /*yield*/, execAsync('df -k /')];
                    case 3:
                        stdout = (_b.sent()).stdout;
                        lines = stdout.split('\n');
                        if (lines.length < 2) {
                            return [2 /*return*/, 50]; // Fallback
                        }
                        parts = lines[1].split(/\s+/);
                        free = parts[3];
                        return [2 /*return*/, Math.round((free ? parseInt(free, 10) : 0) / (1024 * 1024))]; // Convert KB to GB
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _a = _b.sent();
                        // Fallback to a reasonable default
                        return [2 /*return*/, 50]; // Assume 50GB free space
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SystemInfoService.prototype.getCUDAInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, stdout, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                        return [4 /*yield*/, execAsync('nvidia-smi --query-gpu=driver_version --format=csv,noheader')];
                    case 1:
                        stdout = (_b.sent()).stdout;
                        return [2 /*return*/, { available: true, version: stdout.trim() }];
                    case 2:
                        if (!(process.platform === 'linux')) return [3 /*break*/, 4];
                        return [4 /*yield*/, execAsync('nvidia-smi --query-gpu=driver_version --format=csv,noheader')];
                    case 3:
                        stdout = (_b.sent()).stdout;
                        return [2 /*return*/, { available: true, version: stdout.trim() }];
                    case 4:
                        if (process.platform === 'darwin') {
                            // macOS doesn't support CUDA
                            return [2 /*return*/, { available: false, version: null }];
                        }
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        _a = _b.sent();
                        // nvidia-smi not available or failed
                        return [2 /*return*/, { available: false, version: null }];
                    case 7: return [2 /*return*/, { available: false, version: null }];
                }
            });
        });
    };
    SystemInfoService.prototype.clearCache = function () {
        this.cachedInfo = null;
    };
    SystemInfoService.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.cachedInfo = null;
    };
    return SystemInfoService;
}());
exports.SystemInfoService = SystemInfoService;
