"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePerformanceAnalyzer = void 0;
/**
 * Base class for all performance analyzers
 */
var BasePerformanceAnalyzer = /** @class */ (function () {
    function BasePerformanceAnalyzer(context) {
        this.context = context;
    }
    /**
     * Extract a code snippet around a specific line
     */
    BasePerformanceAnalyzer.prototype.extractCodeSnippet = function (lines, lineIndex, context) {
        if (context === void 0) { context = 3; }
        var start = Math.max(0, lineIndex - context);
        var end = Math.min(lines.length, lineIndex + context + 1);
        return lines.slice(start, end).join('\n');
    };
    /**
     * Find the line number for a position in the file
     */
    BasePerformanceAnalyzer.prototype.findLineNumber = function (content, position) {
        return content.substring(0, position).split('\n').length - 1;
    };
    /**
     * Estimate maximum nesting depth in code
     */
    BasePerformanceAnalyzer.prototype.estimateMaxNestedDepth = function (content) {
        var maxDepth = 0;
        var currentDepth = 0;
        for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
            var char = content_1[_i];
            if (char === '{') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
            else if (char === '}') {
                currentDepth = Math.max(0, currentDepth - 1);
            }
        }
        return maxDepth;
    };
    /**
     * Calculate hash of file content for caching
     */
    BasePerformanceAnalyzer.prototype.calculateFileHash = function (content) {
        var hash = 0;
        for (var i = 0; i < content.length; i++) {
            var char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    };
    return BasePerformanceAnalyzer;
}());
exports.BasePerformanceAnalyzer = BasePerformanceAnalyzer;
