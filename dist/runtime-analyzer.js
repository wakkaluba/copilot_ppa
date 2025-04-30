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
exports.runtimeAnalyzer = exports.RuntimeAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const performanceManager_1 = require("./performance/performanceManager");
/**
 * @deprecated Use PerformanceManager from './performance/performanceManager' instead.
 * This class will be removed in a future version.
 */
class RuntimeAnalyzer {
    outputChannel;
    logger;
    isRecording;
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Runtime Analysis');
        this.isRecording = false;
        this.outputChannel.appendLine('⚠️ RuntimeAnalyzer is deprecated. Use PerformanceManager instead.');
        // Log a warning message
        console.warn('RuntimeAnalyzer is deprecated. Use PerformanceManager instead.');
    }
    /**
     * @deprecated Use PerformanceManager.startProfiling() instead
     */
    startRecording() {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        this.outputChannel.show();
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            const profiler = manager.getProfiler();
            profiler.startRecording();
            this.isRecording = true;
        }
        catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * @deprecated Use PerformanceManager.stopProfiling() instead
     */
    stopRecording() {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            const profiler = manager.getProfiler();
            profiler.stopRecording();
            // Generate a report
            manager.generatePerformanceReport();
            this.isRecording = false;
        }
        catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * @deprecated Use PerformanceManager.getProfiler().startOperation() instead
     */
    markStart(markerId) {
        if (!this.isRecording) {
            return;
        }
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            const profiler = manager.getProfiler();
            profiler.startOperation(markerId);
        }
        catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * @deprecated Use PerformanceManager.getProfiler().endOperation() instead
     */
    markEnd(markerId) {
        if (!this.isRecording) {
            return;
        }
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            const profiler = manager.getProfiler();
            profiler.endOperation(markerId);
        }
        catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * @deprecated Use PerformanceManager.generatePerformanceReport() instead
     */
    generatePerformanceReport() {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            manager.generatePerformanceReport();
        }
        catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * @deprecated Use PerformanceManager.analyzeCurrentFile() instead
     */
    analyzeResults() {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            manager.analyzeCurrentFile().catch(error => {
                this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
            });
        }
        catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * @deprecated Use PerformanceManager.analyzeWorkspace() instead
     */
    async generateVisualReport() {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = performanceManager_1.PerformanceManager.getInstance(extensionContext);
            await manager.analyzeWorkspace();
            return undefined; // No longer returns a visual report URI
        }
        catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
            return undefined;
        }
    }
}
exports.RuntimeAnalyzer = RuntimeAnalyzer;
// Export singleton instance
exports.runtimeAnalyzer = new RuntimeAnalyzer();
//# sourceMappingURL=runtime-analyzer.js.map