"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePerformanceAnalyzer = void 0;
/**
 * Base class for all performance analyzers
 */
class BasePerformanceAnalyzer {
    constructor(context) {
        this.context = context;
    }
    /**
     * Extract a code snippet around a specific line
     */
    extractCodeSnippet(lines, lineIndex, context = 3) {
        const start = Math.max(0, lineIndex - context);
        const end = Math.min(lines.length, lineIndex + context + 1);
        return lines.slice(start, end).join('\n');
    }
    /**
     * Find the line number for a position in the file
     */
    findLineNumber(content, position) {
        return content.substring(0, position).split('\n').length - 1;
    }
    /**
     * Estimate maximum nesting depth in code
     */
    estimateMaxNestedDepth(content) {
        let maxDepth = 0;
        let currentDepth = 0;
        for (const char of content) {
            if (char === '{') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
            else if (char === '}') {
                currentDepth = Math.max(0, currentDepth - 1);
            }
        }
        return maxDepth;
    }
    /**
     * Calculate hash of file content for caching
     */
    calculateFileHash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
}
exports.BasePerformanceAnalyzer = BasePerformanceAnalyzer;
//# sourceMappingURL=baseAnalyzer.js.map