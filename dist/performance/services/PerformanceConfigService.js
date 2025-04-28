"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceConfigService = void 0;
const vscode = __importStar(require("vscode"));
class PerformanceConfigService {
    constructor() {
        this.configSection = 'performance';
        this.config = vscode.workspace.getConfiguration(this.configSection);
    }
    async initialize() {
        this.config = vscode.workspace.getConfiguration(this.configSection);
    }
    isProfilingEnabled() {
        return this.config.get('profilingEnabled', false);
    }
    isBottleneckDetectionEnabled() {
        return this.config.get('bottleneckDetectionEnabled', false);
    }
    getCachingOptions() {
        return {
            enabled: this.config.get('caching.enabled', true),
            maxSize: this.config.get('caching.maxSize', 100),
            ttlMinutes: this.config.get('caching.ttlMinutes', 60)
        };
    }
    getAsyncOptions() {
        return {
            batchSize: this.config.get('async.batchSize', 10),
            concurrencyLimit: this.config.get('async.concurrencyLimit', 5),
            timeoutMs: this.config.get('async.timeoutMs', 30000)
        };
    }
    getAnalyzerOptions() {
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
    }
}
exports.PerformanceConfigService = PerformanceConfigService;
//# sourceMappingURL=PerformanceConfigService.js.map