import * as vscode from 'vscode';
import { PerformanceProfiler } from './performanceProfiler';
import { Logger } from '../utils/logger';

/**
 * Threshold configuration for bottleneck detection
 */
export interface BottleneckThresholds {
    warning: number;   // Time in ms that triggers a warning
    critical: number;  // Time in ms that triggers a critical alert
    samplesRequired: number; // Minimum samples needed before analysis
}

/**
 * BottleneckDetector analyzes performance data to identify operations
 * that are potentially causing performance issues
 */
export class BottleneckDetector {
    private static instance: BottleneckDetector;
    private thresholds: Map<string, BottleneckThresholds> = new Map();
    private profiler: PerformanceProfiler;
    private logger: Logger;
    private isEnabled: boolean = false;
    
    private constructor() {
        this.profiler = PerformanceProfiler.getInstance();
        this.logger = Logger.getInstance();
        
        // Set default thresholds for common operations
        this.setDefaultThresholds();
    }
    
    public static getInstance(): BottleneckDetector {
        if (!BottleneckDetector.instance) {
            BottleneckDetector.instance = new BottleneckDetector();
        }
        return BottleneckDetector.instance;
    }
    
    /**
     * Enable or disable bottleneck detection
     */
    public setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        this.logger.log(`Bottleneck detection ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Set performance thresholds for a specific operation
     */
    public setThreshold(operationId: string, thresholds: BottleneckThresholds): void {
        this.thresholds.set(operationId, thresholds);
    }
    
    /**
     * Analyze a completed operation for bottlenecks
     */
    public analyzeOperation(operationId: string): void {
        if (!this.isEnabled) return;
        
        const stats = this.profiler.getOperationStats(operationId);
        if (!stats) return;
        
        const threshold = this.getThresholdForOperation(operationId);
        
        // Only analyze if we have enough samples
        if (stats.count < threshold.samplesRequired) return;
        
        if (stats.avg > threshold.critical) {
            this.reportCriticalBottleneck(operationId, stats);
        } else if (stats.avg > threshold.warning) {
            this.reportWarningBottleneck(operationId, stats);
        }
    }
    
    /**
     * Analyze all operations to find bottlenecks
     */
    public analyzeAll(): { critical: string[], warnings: string[] } {
        if (!this.isEnabled) {
            return { critical: [], warnings: [] };
        }
        
        const allStats = this.profiler.getAllStats();
        const criticalOps: string[] = [];
        const warningOps: string[] = [];
        
        for (const [opId, stats] of allStats.entries()) {
            const threshold = this.getThresholdForOperation(opId);
            
            // Only analyze if we have enough samples
            if (stats.count < threshold.samplesRequired) continue;
            
            if (stats.avg > threshold.critical) {
                criticalOps.push(opId);
                this.reportCriticalBottleneck(opId, stats);
            } else if (stats.avg > threshold.warning) {
                warningOps.push(opId);
                this.reportWarningBottleneck(opId, stats);
            }
        }
        
        return { critical: criticalOps, warnings: warningOps };
    }
    
    /**
     * Gets optimization suggestions for a specific operation
     */
    public getOptimizationSuggestions(operationId: string): string[] {
        const suggestions: string[] = [
            `Consider memoizing results for ${operationId}`,
            `Check if ${operationId} can be processed asynchronously`,
            `Evaluate if ${operationId} can be broken into smaller chunks`,
            `Consider implementing progressive loading for ${operationId}`
        ];
        
        // Add operation-specific suggestions
        if (operationId.includes('file')) {
            suggestions.push('Use workspace filesystem APIs for better performance');
            suggestions.push('Consider using a caching strategy for file operations');
        }
        
        if (operationId.includes('api') || operationId.includes('request')) {
            suggestions.push('Implement request batching to reduce number of API calls');
            suggestions.push('Add response caching with appropriate TTL values');
        }
        
        return suggestions;
    }
    
    private reportWarningBottleneck(operationId: string, stats: { avg: number, min: number, max: number, count: number }): void {
        this.logger.warn(
            `Performance warning: ${operationId} is slower than expected ` +
            `(avg: ${stats.avg.toFixed(2)}ms, max: ${stats.max.toFixed(2)}ms, samples: ${stats.count})`
        );
    }
    
    private reportCriticalBottleneck(operationId: string, stats: { avg: number, min: number, max: number, count: number }): void {
        this.logger.error(
            `Performance critical: ${operationId} has severely degraded performance ` +
            `(avg: ${stats.avg.toFixed(2)}ms, max: ${stats.max.toFixed(2)}ms, samples: ${stats.count})`
        );
        
        // Provide some optimization suggestions
        const suggestions = this.getOptimizationSuggestions(operationId);
        suggestions.forEach(suggestion => {
            this.logger.log(`Suggestion: ${suggestion}`);
        });
    }
    
    private getThresholdForOperation(operationId: string): BottleneckThresholds {
        // Look for exact match
        if (this.thresholds.has(operationId)) {
            return this.thresholds.get(operationId)!;
        }
        
        // Look for partial match (prefix)
        for (const [key, threshold] of this.thresholds.entries()) {
            if (operationId.startsWith(key)) {
                return threshold;
            }
        }
        
        // Return default thresholds
        return {
            warning: 500, // 500ms warning by default
            critical: 2000, // 2s critical by default
            samplesRequired: 5 // Need at least 5 samples
        };
    }
    
    private setDefaultThresholds(): void {
        // File operations
        this.thresholds.set('file.read', {
            warning: 100,
            critical: 500,
            samplesRequired: 5
        });
        
        this.thresholds.set('file.write', {
            warning: 200,
            critical: 1000,
            samplesRequired: 5
        });
        
        // LLM operations
        this.thresholds.set('llm.request', {
            warning: 1000,
            critical: 5000,
            samplesRequired: 3
        });
        
        // UI operations
        this.thresholds.set('ui.update', {
            warning: 50,
            critical: 200,
            samplesRequired: 10
        });
        
        // General extension operations
        this.thresholds.set('extension.', {
            warning: 300,
            critical: 1500,
            samplesRequired: 5
        });
    }
}
