"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottleneckDetector = void 0;
const performanceProfiler_1 = require("./performanceProfiler");
const logger_1 = require("../utils/logger");
const events_1 = require("events");
/**
 * BottleneckDetector analyzes performance data to identify operations
 * that are potentially causing performance issues
 */
class BottleneckDetector extends events_1.EventEmitter {
    static instance;
    static MEMORY_GROWTH_THRESHOLD = 0.1; // 10% growth rate
    static OPERATION_GROWTH_THRESHOLD = 0.2; // 20% growth rate
    static PATTERN_DETECTION_WINDOW = 100; // samples
    static HIGH_FREQUENCY_THRESHOLD = 10; // ops/sec
    thresholds = new Map();
    profiler;
    logger;
    isEnabled = false;
    analysisResults = new Map();
    issues;
    operationPatterns;
    metricHistory;
    operationsCount;
    constructor() {
        super();
        this.profiler = performanceProfiler_1.PerformanceProfiler.getInstance();
        this.logger = logger_1.Logger.getInstance();
        this.issues = new Map();
        this.operationPatterns = new Map();
        this.metricHistory = new Map();
        this.operationsCount = 0;
        // Set default thresholds for common operations
        this.setDefaultThresholds();
    }
    static getInstance() {
        if (!BottleneckDetector.instance) {
            BottleneckDetector.instance = new BottleneckDetector();
        }
        return BottleneckDetector.instance;
    }
    /**
     * Enable or disable bottleneck detection
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.resetStats();
        }
        this.logger.log(`Bottleneck detection ${enabled ? 'enabled' : 'disabled'}`);
    }
    /**
     * Reset all bottleneck statistics
     */
    resetStats() {
        this.analysisResults.clear();
        this.logger.info('Bottleneck detection statistics reset');
    }
    /**
     * Set performance thresholds for a specific operation
     */
    setThreshold(operationId, thresholds) {
        this.thresholds.set(operationId, thresholds);
    }
    /**
     * Analyze a completed operation for bottlenecks
     */
    analyzeOperation(operationId) {
        if (!this.isEnabled)
            return;
        const stats = this.profiler.getOperationStats(operationId);
        if (!stats)
            return;
        const threshold = this.getThresholdForOperation(operationId);
        // Only analyze if we have enough samples
        if (stats.count < threshold.samplesRequired)
            return;
        // Update analysis results
        if (!this.analysisResults.has(operationId)) {
            this.analysisResults.set(operationId, { criticalCount: 0, warningCount: 0 });
        }
        const results = this.analysisResults.get(operationId);
        if (stats.avg > threshold.critical) {
            results.criticalCount++;
            this.reportCriticalBottleneck(operationId, stats);
        }
        else if (stats.avg > threshold.warning) {
            results.warningCount++;
            this.reportWarningBottleneck(operationId, stats);
        }
    }
    /**
     * Analyze all operations to find bottlenecks
     */
    analyzeAll() {
        if (!this.isEnabled) {
            return { critical: [], warnings: [] };
        }
        const allStats = this.profiler.getAllStats();
        const criticalOps = [];
        const warningOps = [];
        for (const [opId, stats] of allStats.entries()) {
            const threshold = this.getThresholdForOperation(opId);
            // Only analyze if we have enough samples
            if (stats.count < threshold.samplesRequired)
                continue;
            if (stats.avg > threshold.critical) {
                criticalOps.push(opId);
                this.reportCriticalBottleneck(opId, stats);
            }
            else if (stats.avg > threshold.warning) {
                warningOps.push(opId);
                this.reportWarningBottleneck(opId, stats);
            }
        }
        return { critical: criticalOps, warnings: warningOps };
    }
    /**
     * Gets optimization suggestions for a specific operation
     */
    getOptimizationSuggestions(operationId) {
        const suggestions = [
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
    reportWarningBottleneck(operationId, stats) {
        this.logger.warn(`Performance warning: ${operationId} is slower than expected ` +
            `(avg: ${stats.avg.toFixed(2)}ms, max: ${stats.max.toFixed(2)}ms, samples: ${stats.count})`);
    }
    reportCriticalBottleneck(operationId, stats) {
        this.logger.error(`Performance critical: ${operationId} has severely degraded performance ` +
            `(avg: ${stats.avg.toFixed(2)}ms, max: ${stats.max.toFixed(2)}ms, samples: ${stats.count})`);
        // Provide some optimization suggestions
        const suggestions = this.getOptimizationSuggestions(operationId);
        suggestions.forEach(suggestion => {
            this.logger.log(`Suggestion: ${suggestion}`);
        });
    }
    getThresholdForOperation(operationId) {
        // Look for exact match
        if (this.thresholds.has(operationId)) {
            return this.thresholds.get(operationId);
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
    setDefaultThresholds() {
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
    reportPerformanceIssue(issue) {
        issue.timestamp = Date.now();
        if (!this.issues.has(issue.sessionId)) {
            this.issues.set(issue.sessionId, []);
        }
        const sessionIssues = this.issues.get(issue.sessionId);
        sessionIssues.push(issue);
        // Track metric history for pattern detection
        const metricKey = `${issue.sessionId}-${issue.type}`;
        if (!this.metricHistory.has(metricKey)) {
            this.metricHistory.set(metricKey, []);
        }
        const history = this.metricHistory.get(metricKey);
        history.push(issue.metric);
        // Keep history within window size
        if (history.length > BottleneckDetector.PATTERN_DETECTION_WINDOW) {
            history.shift();
        }
        // Analyze patterns
        this.detectPatterns(issue);
        // Emit event for real-time monitoring
        this.emit('performanceIssue', {
            ...issue,
            patterns: this.getPatternAnalysis(issue.sessionId)
        });
        // Log the issue
        this.logger.warn(`Performance issue detected: ${issue.type}`, {
            metric: issue.metric,
            threshold: issue.threshold,
            sessionId: issue.sessionId
        });
    }
    getIssues(sessionId) {
        return this.issues.get(sessionId) || [];
    }
    getOperationsCount() {
        return this.operationsCount;
    }
    incrementOperationsCount() {
        this.operationsCount++;
    }
    resetOperationsCount() {
        this.operationsCount = 0;
    }
    detectPatterns(issue) {
        const history = this.metricHistory.get(`${issue.sessionId}-${issue.type}`);
        if (!history || history.length < 10)
            return;
        const pattern = {
            operationId: `${issue.sessionId}-${issue.type}`,
            avgDuration: this.calculateAverage(history),
            frequency: this.calculateFrequency(history),
            memoryImpact: this.calculateMemoryImpact(history),
            dependencies: this.detectDependencies(issue.sessionId)
        };
        this.operationPatterns.set(pattern.operationId, pattern);
        // Check for concerning patterns
        if (this.isHighFrequencyPattern(pattern)) {
            this.logger.warn('High frequency operation pattern detected', {
                operationId: pattern.operationId,
                frequency: pattern.frequency
            });
        }
        if (this.isMemoryIntensivePattern(pattern)) {
            this.logger.warn('Memory intensive pattern detected', {
                operationId: pattern.operationId,
                memoryImpact: pattern.memoryImpact
            });
        }
    }
    calculateAverage(values) {
        return values.reduce((a, b) => a + b, 0) / values.length;
    }
    calculateFrequency(values) {
        const timeWindow = (values.length * 100) / 1000; // Convert to seconds
        return values.length / timeWindow;
    }
    calculateMemoryImpact(values) {
        if (values.length < 2)
            return 0;
        return (values[values.length - 1] - values[0]) / values[0];
    }
    detectDependencies(sessionId) {
        const dependencies = [];
        const sessionIssues = this.issues.get(sessionId) || [];
        // Group issues by time windows to detect correlations
        const timeWindows = this.groupIssuesByTimeWindow(sessionIssues);
        for (const window of timeWindows) {
            if (window.length > 1) {
                // Issues occurring together might be related
                for (let i = 1; i < window.length; i++) {
                    dependencies.push(`${window[i - 1].type}->${window[i].type}`);
                }
            }
        }
        return [...new Set(dependencies)]; // Remove duplicates
    }
    groupIssuesByTimeWindow(issues) {
        const WINDOW_SIZE = 1000; // 1 second window
        const windows = [];
        let currentWindow = [];
        let lastTimestamp = 0;
        for (const issue of issues) {
            if (!issue.timestamp)
                continue;
            if (currentWindow.length === 0) {
                currentWindow.push(issue);
                lastTimestamp = issue.timestamp;
            }
            else if (issue.timestamp - lastTimestamp < WINDOW_SIZE) {
                currentWindow.push(issue);
            }
            else {
                windows.push(currentWindow);
                currentWindow = [issue];
                lastTimestamp = issue.timestamp;
            }
        }
        if (currentWindow.length > 0) {
            windows.push(currentWindow);
        }
        return windows;
    }
    isHighFrequencyPattern(pattern) {
        return pattern.frequency > BottleneckDetector.HIGH_FREQUENCY_THRESHOLD;
    }
    isMemoryIntensivePattern(pattern) {
        return pattern.memoryImpact > BottleneckDetector.MEMORY_GROWTH_THRESHOLD;
    }
    getPatternAnalysis(sessionId) {
        const patterns = Array.from(this.operationPatterns.values())
            .filter(p => p.operationId.startsWith(sessionId));
        const recommendations = [];
        // Analyze patterns and generate recommendations
        for (const pattern of patterns) {
            if (this.isHighFrequencyPattern(pattern)) {
                recommendations.push(`Consider implementing rate limiting or batching for ${pattern.operationId}`);
            }
            if (this.isMemoryIntensivePattern(pattern)) {
                recommendations.push(`Monitor memory usage in ${pattern.operationId} and implement cleanup strategies`);
            }
            if (pattern.dependencies.length > 3) {
                recommendations.push(`High coupling detected in ${pattern.operationId}. Consider refactoring to reduce dependencies`);
            }
        }
        // Look for cascading issues
        const cascadingPatterns = this.detectCascadingPatterns(patterns);
        if (cascadingPatterns.length > 0) {
            recommendations.push('Detected cascading performance issues. Consider implementing circuit breakers or fallbacks');
        }
        return {
            patterns,
            recommendations: [...new Set(recommendations)] // Remove duplicates
        };
    }
    detectCascadingPatterns(patterns) {
        return patterns.filter(pattern => {
            const dependencies = pattern.dependencies;
            return dependencies.length > 0 &&
                dependencies.some(dep => {
                    const relatedPattern = patterns.find(p => p.operationId.includes(dep.split('->')[0]));
                    return relatedPattern && this.isHighFrequencyPattern(relatedPattern);
                });
        });
    }
    getSummary() {
        const issuesByType = {};
        let totalIssues = 0;
        // Aggregate issues
        for (const sessionIssues of this.issues.values()) {
            for (const issue of sessionIssues) {
                totalIssues++;
                issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
            }
        }
        // Find most frequent issues
        const mostFrequentIssues = Object.entries(issuesByType)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([type]) => type);
        // Identify critical patterns
        const criticalPatterns = Array.from(this.operationPatterns.values())
            .filter(pattern => this.isHighFrequencyPattern(pattern) ||
            this.isMemoryIntensivePattern(pattern));
        return {
            totalIssues,
            issuesByType,
            mostFrequentIssues,
            criticalPatterns
        };
    }
    clear() {
        this.issues.clear();
        this.operationPatterns.clear();
        this.metricHistory.clear();
        this.operationsCount = 0;
    }
}
exports.BottleneckDetector = BottleneckDetector;
//# sourceMappingURL=bottleneckDetector.js.map