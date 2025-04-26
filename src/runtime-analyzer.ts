import * as vscode from 'vscode';
import { PerformanceManager } from './performance/performanceManager';

/**
 * @deprecated Use PerformanceManager from './performance/performanceManager' instead.
 * This class will be removed in a future version.
 */
export class RuntimeAnalyzer {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly logger: any;
    private isRecording: boolean;

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
    public startRecording(): void {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        this.outputChannel.show();
        
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = PerformanceManager.getInstance(extensionContext);
            const profiler = manager.getProfiler();
            profiler.startRecording();
            this.isRecording = true;
        } catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * @deprecated Use PerformanceManager.stopProfiling() instead
     */
    public stopRecording(): void {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = PerformanceManager.getInstance(extensionContext);
            const profiler = manager.getProfiler();
            profiler.stopRecording();
            
            // Generate a report
            manager.generatePerformanceReport();
            this.isRecording = false;
        } catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * @deprecated Use PerformanceManager.getProfiler().startOperation() instead
     */
    public markStart(markerId: string): void {
        if (!this.isRecording) {
            return;
        }
        
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = PerformanceManager.getInstance(extensionContext);
            const profiler = manager.getProfiler();
            profiler.startOperation(markerId);
        } catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * @deprecated Use PerformanceManager.getProfiler().endOperation() instead
     */
    public markEnd(markerId: string): void {
        if (!this.isRecording) {
            return;
        }
        
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = PerformanceManager.getInstance(extensionContext);
            const profiler = manager.getProfiler();
            profiler.endOperation(markerId);
        } catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * @deprecated Use PerformanceManager.generatePerformanceReport() instead
     */
    public generatePerformanceReport(): void {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = PerformanceManager.getInstance(extensionContext);
            manager.generatePerformanceReport();
        } catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * @deprecated Use PerformanceManager.analyzeCurrentFile() instead
     */
    public analyzeResults(): void {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = PerformanceManager.getInstance(extensionContext);
            manager.analyzeCurrentFile().catch(error => {
                this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
            });
        } catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * @deprecated Use PerformanceManager.analyzeWorkspace() instead
     */
    public async generateVisualReport(): Promise<vscode.Uri | undefined> {
        this.outputChannel.appendLine('⚠️ This API is deprecated. Using PerformanceManager instead.');
        
        try {
            // Forward to new PerformanceManager
            const extensionContext = require('./extension').getExtensionContext();
            const manager = PerformanceManager.getInstance(extensionContext);
            await manager.analyzeWorkspace();
            return undefined; // No longer returns a visual report URI
        } catch (error) {
            this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
            return undefined;
        }
    }
}

// Export singleton instance
export const runtimeAnalyzer = new RuntimeAnalyzer();
