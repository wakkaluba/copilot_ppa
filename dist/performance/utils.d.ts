/**
 * Utility functions for the performance analyzer
 */
/**
 * Calculate a hash of file content using a MurmurHash3-like algorithm
 * @param content The file content to hash
 * @returns A string hash of the content
 */
export declare function calculateContentHash(content: string): string;
/**
 * Extract a snippet of code around a specific line
 * @param lines The lines of code
 * @param centerLine The line number to center around
 * @param contextLines The number of context lines to include
 * @returns A string snippet of the code
 */
export declare function extractCodeSnippet(lines: string[], centerLine: number, contextLines: number): string;
/**
 * Find the line number for a specific position in file content
 * @param content The file content
 * @param position The position to find the line number for
 * @returns The line number (0-indexed)
 */
export declare function findLineNumber(content: string, position: number): number;
/**
 * Extract the function body for analysis
 * @param content The file content
 * @param position The position where the function starts
 * @returns The function body as a string
 */
export declare function extractFunctionBody(content: string, position: number): string;
/**
 * Escape HTML special characters
 * @param text The text to escape
 * @returns The escaped text
 */
export declare function escapeHtml(text: string): string;
/**
 * Format metric name for display
 * @param key The metric key
 * @returns A formatted string for display
 */
export declare function formatMetricName(key: string): string;
/**
 * Get a rating for a metric
 * @param key The metric key
 * @param value The metric value
 * @returns An HTML string with the rating
 */
export declare function getMetricRating(key: string, value: number): string;
/**
 * Estimate the maximum nested depth
 * @param content The file content
 * @returns The maximum nested depth
 */
export declare function estimateMaxNestedDepth(content: string): number;
