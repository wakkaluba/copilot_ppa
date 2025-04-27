"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BottleneckDetector = void 0;
var events_1 = require("events");
var BottleneckDetectionService_1 = require("./services/BottleneckDetectionService");
/**
 * BottleneckDetector analyzes performance data to identify operations
 * that are potentially causing performance issues
 */
var BottleneckDetector = /** @class */ (function (_super) {
    __extends(BottleneckDetector, _super);
    function BottleneckDetector() {
        var _this = _super.call(this) || this;
        _this.service = new BottleneckDetectionService_1.BottleneckDetectionService();
        return _this;
    }
    BottleneckDetector.getInstance = function () {
        if (!BottleneckDetector.instance) {
            BottleneckDetector.instance = new BottleneckDetector();
        }
        return BottleneckDetector.instance;
    };
    /**
     * Enable or disable bottleneck detection
     */
    BottleneckDetector.prototype.setEnabled = function (enabled) {
        this.service.setEnabled(enabled);
    };
    /**
     * Reset all bottleneck statistics
     */
    BottleneckDetector.prototype.resetStats = function () {
        this.service.resetStats();
    };
    /**
     * Set performance thresholds for a specific operation
     */
    BottleneckDetector.prototype.setThreshold = function (operationId, thresholds) {
        this.service.setThreshold(operationId, thresholds);
    };
    /**
     * Analyze a completed operation for bottlenecks
     */
    BottleneckDetector.prototype.analyzeOperation = function (operationId) {
        this.service.analyzeOperation(operationId);
    };
    /**
     * Analyze all operations to find bottlenecks
     */
    BottleneckDetector.prototype.analyzeAll = function () {
        return this.service.analyzeAll();
    };
    /**
     * Gets optimization suggestions for a specific operation
     */
    BottleneckDetector.prototype.getOptimizationSuggestions = function (operationId) {
        return this.service.getOptimizationSuggestions(operationId);
    };
    BottleneckDetector.prototype.reportPerformanceIssue = function (issue) {
        this.service.reportPerformanceIssue(issue);
    };
    BottleneckDetector.prototype.getIssues = function (sessionId) {
        return this.service.getIssues(sessionId);
    };
    BottleneckDetector.prototype.getOperationsCount = function () {
        return this.service.getOperationsCount();
    };
    BottleneckDetector.prototype.incrementOperationsCount = function () {
        this.service.incrementOperationsCount();
    };
    BottleneckDetector.prototype.resetOperationsCount = function () {
        this.service.resetOperationsCount();
    };
    BottleneckDetector.prototype.getPatternAnalysis = function (sessionId) {
        return this.service.getPatternAnalysis(sessionId);
    };
    BottleneckDetector.prototype.getSummary = function () {
        return this.service.getSummary();
    };
    BottleneckDetector.prototype.clear = function () {
        this.service.clear();
    };
    return BottleneckDetector;
}(events_1.EventEmitter));
exports.BottleneckDetector = BottleneckDetector;
