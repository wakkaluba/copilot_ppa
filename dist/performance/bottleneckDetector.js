"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottleneckDetector = void 0;
const events_1 = require("events");
const BottleneckDetectionService_1 = require("./services/BottleneckDetectionService");
/**
 * BottleneckDetector analyzes performance data to identify operations
 * that are potentially causing performance issues
 */
class BottleneckDetector extends events_1.EventEmitter {
    static instance;
    service;
    constructor() {
        super();
        this.service = new BottleneckDetectionService_1.BottleneckDetectionService();
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
        this.service.setEnabled(enabled);
    }
    /**
     * Reset all bottleneck statistics
     */
    resetStats() {
        this.service.resetStats();
    }
    /**
     * Set performance thresholds for a specific operation
     */
    setThreshold(operationId, thresholds) {
        this.service.setThreshold(operationId, thresholds);
    }
    /**
     * Analyze a completed operation for bottlenecks
     */
    analyzeOperation(operationId) {
        this.service.analyzeOperation(operationId);
    }
    /**
     * Analyze all operations to find bottlenecks
     */
    analyzeAll() {
        return this.service.analyzeAll();
    }
    /**
     * Gets optimization suggestions for a specific operation
     */
    getOptimizationSuggestions(operationId) {
        return this.service.getOptimizationSuggestions(operationId);
    }
    reportPerformanceIssue(issue) {
        this.service.reportPerformanceIssue(issue);
    }
    getIssues(sessionId) {
        return this.service.getIssues(sessionId);
    }
    getOperationsCount() {
        return this.service.getOperationsCount();
    }
    incrementOperationsCount() {
        this.service.incrementOperationsCount();
    }
    resetOperationsCount() {
        this.service.resetOperationsCount();
    }
    getPatternAnalysis(sessionId) {
        return this.service.getPatternAnalysis(sessionId);
    }
    getSummary() {
        return this.service.getSummary();
    }
    clear() {
        this.service.clear();
    }
}
exports.BottleneckDetector = BottleneckDetector;
//# sourceMappingURL=bottleneckDetector.js.map