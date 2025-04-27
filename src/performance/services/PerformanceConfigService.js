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
exports.PerformanceConfigService = void 0;
var vscode = require("vscode");
var PerformanceConfigService = /** @class */ (function () {
    function PerformanceConfigService() {
        this.configSection = 'performance';
        this.config = vscode.workspace.getConfiguration(this.configSection);
    }
    PerformanceConfigService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.config = vscode.workspace.getConfiguration(this.configSection);
                return [2 /*return*/];
            });
        });
    };
    PerformanceConfigService.prototype.isProfilingEnabled = function () {
        return this.config.get('profilingEnabled', false);
    };
    PerformanceConfigService.prototype.isBottleneckDetectionEnabled = function () {
        return this.config.get('bottleneckDetectionEnabled', false);
    };
    PerformanceConfigService.prototype.getCachingOptions = function () {
        return {
            enabled: this.config.get('caching.enabled', true),
            maxSize: this.config.get('caching.maxSize', 100),
            ttlMinutes: this.config.get('caching.ttlMinutes', 60)
        };
    };
    PerformanceConfigService.prototype.getAsyncOptions = function () {
        return {
            batchSize: this.config.get('async.batchSize', 10),
            concurrencyLimit: this.config.get('async.concurrencyLimit', 5),
            timeoutMs: this.config.get('async.timeoutMs', 30000)
        };
    };
    PerformanceConfigService.prototype.getAnalyzerOptions = function () {
        return {
            maxFileSize: this.config.get('maxFileSize', 1024 * 1024),
            excludePatterns: this.config.get('excludePatterns', ['**/node_modules/**']),
            includeTests: this.config.get('includeTests', false),
            thresholds: {
                cyclomaticComplexity: this.config.get('thresholds.cyclomaticComplexity', [10, 20]),
                nestedBlockDepth: this.config.get('thresholds.nestedBlockDepth', [3, 5]),
                functionLength: this.config.get('thresholds.functionLength', [50, 100]),
                parameterCount: this.config.get('thresholds.parameterCount', [4, 7]),
                maintainabilityIndex: this.config.get('thresholds.maintainabilityIndex', [65, 85]),
                commentRatio: this.config.get('thresholds.commentRatio', [10, 20])
            }
        };
    };
    return PerformanceConfigService;
}());
exports.PerformanceConfigService = PerformanceConfigService;
