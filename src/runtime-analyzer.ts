import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

/**
 * Runtime analyzer for the VS Code Local LLM Agent extension.
 * Provides tools for measuring and analyzing code performance during execution.
 */
export class RuntimeAnalyzer {
    private perfMarkers: Map<string, number> = new Map();
    private executionTimes: Map<string, number[]> = new Map();
    private memorySnapshots: Map<string, number[]> = new Map();
    private analysisResults: Map<string, AnalysisResult> = new Map();
    private isRecording: boolean = false;
    private outputChannel: vscode.OutputChannel;
    private cpuUsageSnapshots: Map<string, number[]> = new Map();
    private asyncOperations: Map<string, AsyncOperationTracker[]> = new Map();
    private recordingStartTime: number = 0;
    private performanceTrends: Map<string, PerformanceTrendPoint[]> = new Map();

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Runtime Analyzer');
    }

    /**
     * Start recording performance metrics
     */
    public startRecording(): void {
        this.isRecording = true;
        this.recordingStartTime = performance.now();
        this.outputChannel.appendLine('🔍 Runtime analysis recording started');
        this.outputChannel.show();
    }

    /**
     * Stop recording performance metrics
     */
    public stopRecording(): void {
        this.isRecording = false;
        this.outputChannel.appendLine('⏹️ Runtime analysis recording stopped');
        this.analyzeResults();
    }

    /**
     * Mark the start of a code section for performance measurement
     * @param markerId Unique identifier for the section being measured
     */
    public markStart(markerId: string): void {
        if (!this.isRecording) {
            return;
        }
        this.perfMarkers.set(markerId, performance.now());
        
        // Take memory snapshot if available
        if (global.gc) {
            // Force garbage collection before measuring
            global.gc();
            this.captureMemoryUsage(markerId, 'start');
        }
        
        // Capture CPU usage
        this.captureCpuUsage(markerId, 'start');
    }

    /**
     * Mark the end of a code section and record the execution time
     * @param markerId Unique identifier for the section being measured
     */
    public markEnd(markerId: string): void {
        if (!this.isRecording || !this.perfMarkers.has(markerId)) {
            return;
        }
        
        const startTime = this.perfMarkers.get(markerId)!;
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        if (!this.executionTimes.has(markerId)) {
            this.executionTimes.set(markerId, []);
        }
        this.executionTimes.get(markerId)!.push(executionTime);
        
        // Record performance trend point
        this.recordPerformanceTrendPoint(markerId, executionTime);
        
        // Take memory snapshot after execution if available
        if (global.gc) {
            this.captureMemoryUsage(markerId, 'end');
        }
        
        // Capture CPU usage
        this.captureCpuUsage(markerId, 'end');
        
        this.outputChannel.appendLine(`⏱️ ${markerId}: ${executionTime.toFixed(2)}ms`);
    }

    /**
     * Records a performance trend point for the given marker
     */
    private recordPerformanceTrendPoint(markerId: string, executionTime: number): void {
        if (!this.performanceTrends.has(markerId)) {
            this.performanceTrends.set(markerId, []);
        }
        
        const relativeTimestamp = performance.now() - this.recordingStartTime;
        this.performanceTrends.get(markerId)!.push({
            timestamp: relativeTimestamp,
            executionTime: executionTime
        });
    }

    /**
     * Captures the current memory usage
     */
    private captureMemoryUsage(markerId: string, type: 'start' | 'end'): void {
        if (process.memoryUsage) {
            const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB
            
            if (!this.memorySnapshots.has(markerId)) {
                this.memorySnapshots.set(markerId, []);
            }
            
            const snapshot = this.memorySnapshots.get(markerId)!;
            if (type === 'start' && snapshot.length % 2 === 0) {
                snapshot.push(memoryUsage);
            } else if (type === 'end' && snapshot.length % 2 === 1) {
                snapshot.push(memoryUsage);
            }
        }
    }

    /**
     * Captures current CPU usage
     */
    private captureCpuUsage(markerId: string, type: 'start' | 'end'): void {
        if (process.cpuUsage) {
            const cpuUsage = process.cpuUsage();
            const totalCpuUsage = (cpuUsage.user + cpuUsage.system) / 1000; // Convert to ms
            
            if (!this.cpuUsageSnapshots.has(markerId)) {
                this.cpuUsageSnapshots.set(markerId, []);
            }
            
            const snapshot = this.cpuUsageSnapshots.get(markerId)!;
            if (type === 'start' && snapshot.length % 2 === 0) {
                snapshot.push(totalCpuUsage);
            } else if (type === 'end' && snapshot.length % 2 === 1) {
                snapshot.push(totalCpuUsage);
            }
        }
    }

    /**
     * Start tracking an asynchronous operation
     * @param markerId Unique identifier for the operation
     * @param operationId Unique identifier for this specific async operation
     */
    public startAsyncOperation(markerId: string, operationId: string): void {
        if (!this.isRecording) {
            return;
        }
        
        if (!this.asyncOperations.has(markerId)) {
            this.asyncOperations.set(markerId, []);
        }
        
        this.asyncOperations.get(markerId)!.push({
            operationId,
            startTime: performance.now(),
            endTime: 0,
            isCompleted: false
        });
    }

    /**
     * End tracking an asynchronous operation
     * @param markerId Unique identifier for the operation
     * @param operationId Unique identifier for this specific async operation
     */
    public endAsyncOperation(markerId: string, operationId: string): void {
        if (!this.isRecording || !this.asyncOperations.has(markerId)) {
            return;
        }
        
        const operations = this.asyncOperations.get(markerId)!;
        const opIndex = operations.findIndex(op => op.operationId === operationId && !op.isCompleted);
        
        if (opIndex !== -1) {
            operations[opIndex].endTime = performance.now();
            operations[opIndex].isCompleted = true;
            
            const duration = operations[opIndex].endTime - operations[opIndex].startTime;
            this.outputChannel.appendLine(`🔄 Async operation ${markerId}:${operationId} completed in ${duration.toFixed(2)}ms`);
        }
    }

    /**
     * Analyze the collected performance data
     */
    private analyzeResults(): void {
        this.outputChannel.appendLine('\n📊 Runtime Analysis Results:');
        
        // Process execution times
        for (const [markerId, times] of this.executionTimes.entries()) {
            if (times.length === 0) {
                continue;
            }
            
            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            
            // Calculate standard deviation
            const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
            const stdDev = Math.sqrt(variance);
            
            // Process memory usage if available
            let avgMemoryDelta = 0;
            let memoryLeakPotential = false;
            
            if (this.memorySnapshots.has(markerId)) {
                const snapshots = this.memorySnapshots.get(markerId)!;
                const memoryDeltas: number[] = [];
                
                for (let i = 0; i < snapshots.length; i += 2) {
                    if (i + 1 < snapshots.length) {
                        memoryDeltas.push(snapshots[i + 1] - snapshots[i]);
                    }
                }
                
                if (memoryDeltas.length > 0) {
                    avgMemoryDelta = memoryDeltas.reduce((sum, delta) => sum + delta, 0) / memoryDeltas.length;
                    
                    // Check for potential memory leaks
                    const consistentIncrease = memoryDeltas.every(delta => delta > 0);
                    const significantIncrease = avgMemoryDelta > 1; // More than 1MB average increase
                    
                    memoryLeakPotential = consistentIncrease && significantIncrease && memoryDeltas.length >= 3;
                }
            }
            
            // Process CPU usage if available
            let avgCpuDelta = 0;
            let cpuIntensiveOperation = false;
            
            if (this.cpuUsageSnapshots.has(markerId)) {
                const snapshots = this.cpuUsageSnapshots.get(markerId)!;
                const cpuDeltas: number[] = [];
                
                for (let i = 0; i < snapshots.length; i += 2) {
                    if (i + 1 < snapshots.length) {
                        cpuDeltas.push(snapshots[i + 1] - snapshots[i]);
                    }
                }
                
                if (cpuDeltas.length > 0) {
                    avgCpuDelta = cpuDeltas.reduce((sum, delta) => sum + delta, 0) / cpuDeltas.length;
                    
                    // Check for CPU intensive operations
                    cpuIntensiveOperation = avgCpuDelta > 50; // Arbitrary threshold for demonstration
                }
            }
            
            // Process async operations if available
            let avgAsyncDuration = 0;
            let maxConcurrentOperations = 0;
            let asyncOperationsCount = 0;
            
            if (this.asyncOperations.has(markerId)) {
                const operations = this.asyncOperations.get(markerId)!;
                const completedOperations = operations.filter(op => op.isCompleted);
                
                if (completedOperations.length > 0) {
                    const durations = completedOperations.map(op => op.endTime - op.startTime);
                    avgAsyncDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
                    asyncOperationsCount = completedOperations.length;
                    
                    // Calculate max concurrent operations
                    // This is a simplified approximation
                    const timePoints: {time: number, isStart: boolean}[] = [];
                    completedOperations.forEach(op => {
                        timePoints.push({time: op.startTime, isStart: true});
                        timePoints.push({time: op.endTime, isStart: false});
                    });
                    
                    timePoints.sort((a, b) => a.time - b.time);
                    
                    let currentConcurrent = 0;
                    timePoints.forEach(point => {
                        if (point.isStart) {
                            currentConcurrent++;
                        } else {
                            currentConcurrent--;
                        }
                        maxConcurrentOperations = Math.max(maxConcurrentOperations, currentConcurrent);
                    });
                }
            }
            
            // Analyze performance trend
            let performanceTrend: 'improving' | 'degrading' | 'stable' = 'stable';
            let trendPercentage = 0;
            
            if (this.performanceTrends.has(markerId)) {
                const trendPoints = this.performanceTrends.get(markerId)!;
                
                if (trendPoints.length >= 5) {
                    // Calculate trend using linear regression
                    const n = trendPoints.length;
                    const timestamps = trendPoints.map(p => p.timestamp);
                    const executionTimes = trendPoints.map(p => p.executionTime);
                    
                    const sumX = timestamps.reduce((sum, x) => sum + x, 0);
                    const sumY = executionTimes.reduce((sum, y) => sum + y, 0);
                    const sumXY = timestamps.reduce((sum, x, i) => sum + x * executionTimes[i], 0);
                    const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);
                    
                    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                    
                    if (Math.abs(slope) < 0.01) {
                        performanceTrend = 'stable';
                    } else if (slope > 0) {
                        performanceTrend = 'degrading';
                        trendPercentage = (slope * (timestamps[n-1] - timestamps[0]) / avgTime) * 100;
                    } else {
                        performanceTrend = 'improving';
                        trendPercentage = (-slope * (timestamps[n-1] - timestamps[0]) / avgTime) * 100;
                    }
                }
            }
            
            const result: AnalysisResult = {
                markerId,
                executionCount: times.length,
                averageTime: avgTime,
                minTime,
                maxTime,
                standardDeviation: stdDev,
                averageMemoryDelta: avgMemoryDelta,
                potentialMemoryLeak: memoryLeakPotential,
                averageCpuDelta: avgCpuDelta,
                cpuIntensiveOperation,
                asyncOperationsCount,
                averageAsyncDuration,
                maxConcurrentOperations,
                performanceTrend,
                trendPercentage
            };
            
            this.analysisResults.set(markerId, result);
            
            // Output results
            this.outputChannel.appendLine(`\n🔹 ${markerId}:`);
            this.outputChannel.appendLine(`   Executions: ${result.executionCount}`);
            this.outputChannel.appendLine(`   Avg Time: ${result.averageTime.toFixed(2)}ms`);
            this.outputChannel.appendLine(`   Min Time: ${result.minTime.toFixed(2)}ms`);
            this.outputChannel.appendLine(`   Max Time: ${result.maxTime.toFixed(2)}ms`);
            this.outputChannel.appendLine(`   Std Dev: ${result.standardDeviation.toFixed(2)}ms`);
            
            if (this.memorySnapshots.has(markerId)) {
                this.outputChannel.appendLine(`   Avg Memory Δ: ${result.averageMemoryDelta.toFixed(2)}MB`);
                if (result.potentialMemoryLeak) {
                    this.outputChannel.appendLine(`   ⚠️ POTENTIAL MEMORY LEAK DETECTED`);
                }
            }
            
            if (this.cpuUsageSnapshots.has(markerId)) {
                this.outputChannel.appendLine(`   Avg CPU Δ: ${result.averageCpuDelta.toFixed(2)}ms`);
                if (result.cpuIntensiveOperation) {
                    this.outputChannel.appendLine(`   ⚠️ CPU INTENSIVE OPERATION DETECTED`);
                }
            }
            
            if (this.asyncOperations.has(markerId) && result.asyncOperationsCount > 0) {
                this.outputChannel.appendLine(`   Async Operations: ${result.asyncOperationsCount}`);
                this.outputChannel.appendLine(`   Avg Async Duration: ${result.averageAsyncDuration.toFixed(2)}ms`);
                this.outputChannel.appendLine(`   Max Concurrent Operations: ${result.maxConcurrentOperations}`);
            }
            
            if (performanceTrend !== 'stable') {
                this.outputChannel.appendLine(`   Performance Trend: ${performanceTrend.toUpperCase()} by ${trendPercentage.toFixed(2)}%`);
            } else {
                this.outputChannel.appendLine(`   Performance Trend: STABLE`);
            }
            
            // Performance recommendations
            this.generatePerformanceRecommendations(result);
        }
        
        // Reset data after analysis
        this.perfMarkers.clear();
    }

    /**
     * Generate performance optimization recommendations
     */
    private generatePerformanceRecommendations(result: AnalysisResult): void {
        this.outputChannel.appendLine(`\n   📝 RECOMMENDATIONS:`);
        
        // Execution time recommendations
        if (result.averageTime > 500) {
            this.outputChannel.appendLine(`   🔴 SLOW EXECUTION: Consider optimizing ${result.markerId}`);
            this.outputChannel.appendLine(`      - Consider breaking down into smaller functions`);
            this.outputChannel.appendLine(`      - Look for opportunities to use caching`);
            this.outputChannel.appendLine(`      - Investigate if operations can be done asynchronously`);
        } else if (result.averageTime > 100) {
            this.outputChannel.appendLine(`   🟠 MODERATE PERFORMANCE: ${result.markerId} could be improved`);
            this.outputChannel.appendLine(`      - Review algorithms for optimization opportunities`);
            this.outputChannel.appendLine(`      - Consider using more efficient data structures`);
        }
        
        // Execution time variance recommendations
        if (result.standardDeviation > result.averageTime * 0.5) {
            this.outputChannel.appendLine(`   ⚠️ HIGH VARIANCE: ${result.markerId} has inconsistent performance`);
            this.outputChannel.appendLine(`      - Look for conditional paths that might cause slowdowns`);
            this.outputChannel.appendLine(`      - Check for external dependencies that might affect performance`);
            this.outputChannel.appendLine(`      - Consider adding more specific performance markers to identify bottlenecks`);
        }
        
        // Memory recommendations
        if (result.potentialMemoryLeak) {
            this.outputChannel.appendLine(`   🚨 POTENTIAL MEMORY LEAK: Investigate ${result.markerId}`);
            this.outputChannel.appendLine(`      - Check for unclosed resources or event listeners`);
            this.outputChannel.appendLine(`      - Look for growing collections or caches without limits`);
            this.outputChannel.appendLine(`      - Consider implementing weak references where appropriate`);
        } else if (result.averageMemoryDelta > 0.5) {
            this.outputChannel.appendLine(`   🟠 SIGNIFICANT MEMORY USAGE: ${result.markerId} consumes ${result.averageMemoryDelta.toFixed(2)}MB`);
            this.outputChannel.appendLine(`      - Consider object pooling to reduce allocations`);
            this.outputChannel.appendLine(`      - Look for opportunities to reuse objects instead of creating new ones`);
        }
        
        // CPU recommendations
        if (result.cpuIntensiveOperation) {
            this.outputChannel.appendLine(`   🔥 CPU INTENSIVE: ${result.markerId} is demanding on the CPU`);
            this.outputChannel.appendLine(`      - Consider moving work to a Web Worker if appropriate`);
            this.outputChannel.appendLine(`      - Look for ways to parallelize computation`);
            this.outputChannel.appendLine(`      - Consider using more efficient algorithms`);
        }
        
        // Async recommendations
        if (result.asyncOperationsCount > 0) {
            if (result.maxConcurrentOperations > 10) {
                this.outputChannel.appendLine(`   ⚠️ HIGH CONCURRENCY: ${result.markerId} runs ${result.maxConcurrentOperations} operations concurrently`);
                this.outputChannel.appendLine(`      - Consider adding throttling or pooling to limit concurrency`);
                this.outputChannel.appendLine(`      - Check for resource contention issues`);
            }
            
            if (result.averageAsyncDuration > 1000) {
                this.outputChannel.appendLine(`   🕒 LONG ASYNC OPERATIONS: ${result.markerId} average duration is ${result.averageAsyncDuration.toFixed(2)}ms`);
                this.outputChannel.appendLine(`      - Add progress indicators for better user experience`);
                this.outputChannel.appendLine(`      - Consider breaking down long operations into smaller chunks`);
            }
        }
        
        // Performance trend recommendations
        if (result.performanceTrend === 'degrading' && result.trendPercentage > 10) {
            this.outputChannel.appendLine(`   📉 DEGRADING PERFORMANCE: ${result.markerId} is getting slower by ${result.trendPercentage.toFixed(2)}%`);
            this.outputChannel.appendLine(`      - Check for accumulating state that might be affecting performance`);
            this.outputChannel.appendLine(`      - Look for resource leaks that compound over time`);
            this.outputChannel.appendLine(`      - Consider implementing periodic cleanup or reset mechanisms`);
        } else if (result.performanceTrend === 'improving' && result.trendPercentage > 10) {
            this.outputChannel.appendLine(`   📈 IMPROVING PERFORMANCE: ${result.markerId} is getting faster by ${result.trendPercentage.toFixed(2)}%`);
            this.outputChannel.appendLine(`      - Consider what warm-up optimizations might be happening`);
            this.outputChannel.appendLine(`      - Document the improvement patterns for other parts of the codebase`);
        }
    }

    /**
     * Export analysis results to JSON file
     */
    public exportResults(filePath?: string): void {
        if (this.analysisResults.size === 0) {
            vscode.window.showWarningMessage('No runtime analysis data to export');
            return;
        }
        
        const resultsObject = Array.from(this.analysisResults.entries())
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {} as Record<string, AnalysisResult>);
        
        if (!filePath) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            
            filePath = path.join(workspaceFolders[0].uri.fsPath, 'runtime-analysis-results.json');
        }
        
        try {
            fs.writeFileSync(filePath, JSON.stringify(resultsObject, null, 2));
            vscode.window.showInformationMessage(`Runtime analysis results exported to ${filePath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export analysis results: ${error}`);
        }
    }

    /**
     * Generate a visual performance report
     */
    public async generateVisualReport(): Promise<vscode.Uri | undefined> {
        if (this.analysisResults.size === 0) {
            vscode.window.showWarningMessage('No runtime analysis data to visualize');
            return;
        }
        
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }
        
        const reportDir = path.join(workspaceFolders[0].uri.fsPath, '.runtime-reports');
        const reportFile = path.join(reportDir, `report-${new Date().toISOString().replace(/[:.]/g, '-')}.html`);
        
        try {
            // Create reports directory if it doesn't exist
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            
            // Generate HTML content with Chart.js visualizations
            const htmlContent = this.generateHtmlReport();
            
            // Write the HTML file
            fs.writeFileSync(reportFile, htmlContent);
            
            this.outputChannel.appendLine(`\n📊 Visual performance report generated at: ${reportFile}`);
            
            return vscode.Uri.file(reportFile);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate visual report: ${error}`);
            return;
        }
    }

    /**
     * Generates HTML content for the visual report
     */
    private generateHtmlReport(): string {
        const chartData = this.prepareChartData();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Runtime Performance Analysis Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .chart-container {
            margin: 30px 0;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            background-color: white;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 15px;
            border-left: 5px solid #3498db;
        }
        .recommendations {
            background-color: #eef7fa;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            border-left: 5px solid #2ecc71;
        }
        .warning {
            border-left-color: #e74c3c;
        }
        .timestamp {
            color: #7f8c8d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Runtime Performance Analysis Report</h1>
        <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
        
        ${chartData.map(data => `
        <div class="chart-container">
            <h2>${data.markerId}</h2>
            <div class="summary-stats">
                <div class="stat-card">
                    <h3>Execution Stats</h3>
                    <p>Executions: ${data.executionCount}</p>
                    <p>Avg Time: ${data.averageTime.toFixed(2)}ms</p>
                    <p>Min Time: ${data.minTime.toFixed(2)}ms</p>
                    <p>Max Time: ${data.maxTime.toFixed(2)}ms</p>
                    <p>Std Dev: ${data.standardDeviation.toFixed(2)}ms</p>
                </div>
                ${data.memoryData ? `
                <div class="stat-card ${data.potentialMemoryLeak ? 'warning' : ''}">
                    <h3>Memory Usage</h3>
                    <p>Avg Memory Δ: ${data.averageMemoryDelta.toFixed(2)}MB</p>
                    ${data.potentialMemoryLeak ? '<p><strong>⚠️ POTENTIAL MEMORY LEAK DETECTED</strong></p>' : ''}
                </div>` : ''}
                ${data.asyncData ? `
                <div class="stat-card">
                    <h3>Async Operations</h3>
                    <p>Async Operations: ${data.asyncOperationsCount}</p>
                    <p>Avg Async Duration: ${data.averageAsyncDuration.toFixed(2)}ms</p>
                    <p>Max Concurrent: ${data.maxConcurrentOperations}</p>
                </div>` : ''}
            </div>
            
            ${this.generateRecommendationsHtml(data)}
            
            <canvas id="timeChart${data.chartId}"></canvas>
            ${data.trendData ? `<canvas id="trendChart${data.chartId}"></canvas>` : ''}
            ${data.memoryData ? `<canvas id="memoryChart${data.chartId}"></canvas>` : ''}
        </div>`).join('')}
    </div>
    
    <script>
        // Chart initialization code
        window.onload = function() {
            ${chartData.map(data => this.generateChartJs(data)).join('\n')}
        };
    </script>
</body>
</html>`;
    }

    /**
     * Prepares data for charts
     */
    private prepareChartData(): any[] {
        let chartId = 0;
        return Array.from(this.analysisResults.entries()).map(([markerId, result]) => {
            const times = this.executionTimes.get(markerId) || [];
            const memoryData = this.memorySnapshots.has(markerId);
            const trendData = this.performanceTrends.has(markerId) && this.performanceTrends.get(markerId)!.length > 1;
            const asyncData = this.asyncOperations.has(markerId) && result.asyncOperationsCount > 0;
            
            return {
                markerId,
                chartId: chartId++,
                executionTimes: times,
                executionCount: result.executionCount,
                averageTime: result.averageTime,
                minTime: result.minTime,
                maxTime: result.maxTime,
                standardDeviation: result.standardDeviation,
                averageMemoryDelta: result.averageMemoryDelta,
                potentialMemoryLeak: result.potentialMemoryLeak,
                asyncOperationsCount: result.asyncOperationsCount,
                averageAsyncDuration: result.averageAsyncDuration,
                maxConcurrentOperations: result.maxConcurrentOperations,
                performanceTrend: result.performanceTrend,
                trendPercentage: result.trendPercentage,
                memoryData,
                trendData,
                asyncData,
                trendPoints: this.performanceTrends.get(markerId) || []
            };
        });
    }

    /**
     * Generates HTML for recommendations
     */
    private generateRecommendationsHtml(data: any): string {
        const recommendations: string[] = [];
        
        // Add recommendations based on the data
        if (data.averageTime > 500) {
            recommendations.push(`<p>🔴 <strong>SLOW EXECUTION:</strong> Consider optimizing this operation</p>`);
            recommendations.push(`<p>- Consider breaking down into smaller functions</p>`);
            recommendations.push(`<p>- Look for opportunities to use caching</p>`);
            recommendations.push(`<p>- Investigate if operations can be done asynchronously</p>`);
        } else if (data.averageTime > 100) {
            recommendations.push(`<p>🟠 <strong>MODERATE PERFORMANCE:</strong> This operation could be improved</p>`);
            recommendations.push(`<p>- Review algorithms for optimization opportunities</p>`);
            recommendations.push(`<p>- Consider using more efficient data structures</p>`);
        }
        
        if (data.standardDeviation > data.averageTime * 0.5) {
            recommendations.push(`<p>⚠️ <strong>HIGH VARIANCE:</strong> This operation has inconsistent performance</p>`);
            recommendations.push(`<p>- Look for conditional paths that might cause slowdowns</p>`);
            recommendations.push(`<p>- Check for external dependencies that might affect performance</p>`);
        }
        
        if (data.potentialMemoryLeak) {
            recommendations.push(`<p>🚨 <strong>POTENTIAL MEMORY LEAK:</strong> Investigate this operation</p>`);
            recommendations.push(`<p>- Check for unclosed resources or event listeners</p>`);
            recommendations.push(`<p>- Look for growing collections or caches without limits</p>`);
        }
        
        if (recommendations.length === 0) {
            return '';
        }
        
        return `
        <div class="recommendations">
            <h3>Performance Recommendations</h3>
            ${recommendations.join('')}
        </div>`;
    }

    /**
     * Generates JavaScript for chart initialization
     */
    private generateChartJs(data: any): string {
        const timeChartJs = `
        // Execution time chart for ${data.markerId}
        new Chart(document.getElementById('timeChart${data.chartId}'), {
            type: 'bar',
            data: {
                labels: Array.from({length: ${data.executionTimes.length}}, (_, i) => 'Execution ' + (i + 1)),
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: ${JSON.stringify(data.executionTimes)},
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Execution Times'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        }
                    }
                }
            }
        });`;
        
        let chartJs = timeChartJs;
        
        // Add trend chart if trend data is available
        if (data.trendData) {
            chartJs += `
            // Performance trend chart for ${data.markerId}
            new Chart(document.getElementById('trendChart${data.chartId}'), {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(data.trendPoints.map((p: any, i: number) => 'Point ' + (i + 1)))},
                    datasets: [{
                        label: 'Execution Time Trend',
                        data: ${JSON.stringify(data.trendPoints.map((p: any) => p.executionTime))},
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Performance Trend'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Time (ms)'
                            }
                        }
                    }
                }
            });`;
        }
        
        // Add memory chart if memory data is available
        if (data.memoryData) {
            chartJs += `
            // Memory usage chart for ${data.markerId}
            new Chart(document.getElementById('memoryChart${data.chartId}'), {
                type: 'line',
                data: {
                    labels: ['Start', 'End'],
                    datasets: [{
                        label: 'Memory Usage (MB)',
                        data: [0, ${data.averageMemoryDelta}],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Memory Usage'
                        }
                    },
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Memory (MB)'
                            }
                        }
                    }
                }
            });`;
        }
        
        return chartJs;
    }
}

/**
 * Interface for analysis result data
 */
interface AnalysisResult {
    markerId: string;
    executionCount: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    standardDeviation: number;
    averageMemoryDelta: number;
    potentialMemoryLeak: boolean;
    averageCpuDelta?: number;
    cpuIntensiveOperation?: boolean;
    asyncOperationsCount?: number;
    averageAsyncDuration?: number;
    maxConcurrentOperations?: number;
    performanceTrend?: 'improving' | 'degrading' | 'stable';
    trendPercentage?: number;
}

/**
 * Interface for tracking asynchronous operations
 */
interface AsyncOperationTracker {
    operationId: string;
    startTime: number;
    endTime: number;
    isCompleted: boolean;
}

/**
 * Interface for performance trend data points
 */
interface PerformanceTrendPoint {
    timestamp: number;
    executionTime: number;
}

// Export singleton instance
export const runtimeAnalyzer = new RuntimeAnalyzer();
