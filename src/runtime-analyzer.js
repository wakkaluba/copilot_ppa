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
exports.runtimeAnalyzer = exports.RuntimeAnalyzer = void 0;
var vscode = require("vscode");
var performanceManager_1 = require("./performance/performanceManager");
/**
 * @deprecated Use PerformanceManager from './performance/performanceManager' instead.
 * This class will be removed in a future version.
 */
var RuntimeAnalyzer = /** @class */ (function () {
    function RuntimeAnalyzer() {
        this.outputChannel = vscode.window.createOutputChannel('Runtime Analysis');
        this.isRecording = false;
        this.outputChannel.appendLine('⚠️ RuntimeAnalyzer is deprecated. Use PerformanceManager instead.');
        // Log a warning message
        console.warn('RuntimeAnalyzer is deprecated. Use PerformanceManager instead.');
    }
    /**
     * @deprecated Use PerformanceManager.startProfiling() instead
     */
    RuntimeAnalyzer.prototype.startRecording = function () {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        this.outputChannel.show();
        try {
            // Forward to new PerformanceManager
            var extensionContext = require('./extension').getExtensionContext();
            var manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            var profiler = manager.getProfiler();
            profiler.startRecording();
            this.isRecording = true;
        }
        catch (error) {
            this.outputChannel.appendLine("Error: ".concat(error instanceof Error ? error.message : String(error)));
        }
    };
    /**
     * @deprecated Use PerformanceManager.stopProfiling() instead
     */
    RuntimeAnalyzer.prototype.stopRecording = function () {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        try {
            // Forward to new PerformanceManager
            var extensionContext = require('./extension').getExtensionContext();
            var manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            var profiler = manager.getProfiler();
            profiler.stopRecording();
            // Generate a report
            manager.generatePerformanceReport();
            this.isRecording = false;
        }
        catch (error) {
            this.outputChannel.appendLine("Error: ".concat(error instanceof Error ? error.message : String(error)));
        }
    };
    /**
     * @deprecated Use PerformanceManager.getProfiler().startOperation() instead
     */
    RuntimeAnalyzer.prototype.markStart = function (markerId) {
        if (!this.isRecording) {
            return;
        }
        try {
            // Forward to new PerformanceManager
            var extensionContext = require('./extension').getExtensionContext();
            var manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            var profiler = manager.getProfiler();
            profiler.startOperation(markerId);
        }
        catch (error) {
            this.outputChannel.appendLine("Error: ".concat(error instanceof Error ? error.message : String(error)));
        }
    };
    /**
     * @deprecated Use PerformanceManager.getProfiler().endOperation() instead
     */
    RuntimeAnalyzer.prototype.markEnd = function (markerId) {
        if (!this.isRecording) {
            return;
        }
        try {
            // Forward to new PerformanceManager
            var extensionContext = require('./extension').getExtensionContext();
            var manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            var profiler = manager.getProfiler();
            profiler.endOperation(markerId);
        }
        catch (error) {
            this.outputChannel.appendLine("Error: ".concat(error instanceof Error ? error.message : String(error)));
        }
    };
    /**
     * @deprecated Use PerformanceManager.generatePerformanceReport() instead
     */
    RuntimeAnalyzer.prototype.generatePerformanceReport = function () {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        try {
            // Forward to new PerformanceManager
            var extensionContext = require('./extension').getExtensionContext();
            var manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            manager.generatePerformanceReport();
        }
        catch (error) {
            this.outputChannel.appendLine("Error: ".concat(error instanceof Error ? error.message : String(error)));
        }
    };
    /**
     * @deprecated Use PerformanceManager.analyzeCurrentFile() instead
     */
    RuntimeAnalyzer.prototype.analyzeResults = function () {
        var _this = this;
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        try {
            // Forward to new PerformanceManager
            var extensionContext = require('./extension').getExtensionContext();
            var manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            manager.analyzeCurrentFile().catch(function (error) {
                _this.outputChannel.appendLine("Error: ".concat(error instanceof Error ? error.message : String(error)));
            });
        }
        catch (error) {
            this.outputChannel.appendLine("Error: ".concat(error instanceof Error ? error.message : String(error)));
        }
    };
    /**
     * @deprecated Use PerformanceManager.analyzeWorkspace() instead
     */
    RuntimeAnalyzer.prototype.generateVisualReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var extensionContext, manager, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        extensionContext = require('./extension').getExtensionContext();
                        manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
                        return [4 /*yield*/, manager.analyzeWorkspace()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, undefined]; // No longer returns a visual report URI
                    case 3:
                        error_1 = _a.sent();
                        this.outputChannel.appendLine("Error: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                        return [2 /*return*/, undefined];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return RuntimeAnalyzer;
}());
exports.RuntimeAnalyzer = RuntimeAnalyzer;
// Export singleton instance
exports.runtimeAnalyzer = new RuntimeAnalyzer();
