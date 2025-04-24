/**
 * Utility functions for the performance analyzer
 */

/**
 * Calculate a hash of file content using a MurmurHash3-like algorithm
 * @param content The file content to hash
 * @returns A string hash of the content
 */
export function calculateContentHash(content: string): string {
    const seed = 0x1234;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    let h1 = seed;

    const chunks = Math.floor(content.length / 4);
    
    for (let i = 0; i < chunks; i++) {
        let k1 = 0;
        for (let j = 0; j < 4; j++) {
            k1 |= content.charCodeAt(i * 4 + j) << (j * 8);
        }
        
        k1 = Math.imul(k1, c1);
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = Math.imul(k1, c2);
        
        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1 = Math.imul(h1, 5) + 0xe6546b64;
    }
    
    // Handle remaining bytes
    let k1 = 0;
    const rem = content.length & 3;
    for (let i = 0; i < rem; i++) {
        k1 |= content.charCodeAt(chunks * 4 + i) << (i * 8);
    }
    
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
    
    // Finalization
    h1 ^= content.length;
    h1 ^= h1 >>> 16;
    h1 = Math.imul(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = Math.imul(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;
    
    return String(h1 >>> 0); // Convert to unsigned 32-bit
}

/**
 * Extract a snippet of code around a specific line
 * @param lines The lines of code
 * @param centerLine The line number to center around
 * @param contextLines The number of context lines to include
 * @returns A string snippet of the code
 */
export function extractCodeSnippet(lines: string[], centerLine: number, contextLines: number): string {
    const startLine = Math.max(0, centerLine - Math.floor(contextLines / 2));
    const endLine = Math.min(lines.length - 1, centerLine + Math.ceil(contextLines / 2));
    
    return lines.slice(startLine, endLine + 1).join('\n');
}

/**
 * Find the line number for a specific position in file content
 * @param content The file content
 * @param position The position to find the line number for
 * @returns The line number (0-indexed)
 */
export function findLineNumber(content: string, position: number): number {
    const textBefore = content.substring(0, position);
    return textBefore.split('\n').length - 1;
}

/**
 * Extract the function body for analysis
 * @param content The file content
 * @param position The position where the function starts
 * @returns The function body as a string
 */
export function extractFunctionBody(content: string, position: number): string {
    let bracketCount = 0;
    let startPos = position;
    
    // Find the opening brace
    while (startPos < content.length && content[startPos] !== '{') {
        startPos++;
    }
    
    if (startPos >= content.length) {
        return '';
    }
    
    let endPos = startPos;
    
    // Find the matching closing brace
    do {
        if (content[endPos] === '{') {bracketCount++;}
        if (content[endPos] === '}') {bracketCount--;}
        endPos++;
    } while (bracketCount > 0 && endPos < content.length);
    
    return content.substring(startPos, endPos);
}

/**
 * Escape HTML special characters
 * @param text The text to escape
 * @returns The escaped text
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Format metric name for display
 * @param key The metric key
 * @returns A formatted string for display
 */
export function formatMetricName(key: string): string {
    return key
        .split(/(?=[A-Z])/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get a rating for a metric
 * @param key The metric key
 * @param value The metric value
 * @returns An HTML string with the rating
 */
export function getMetricRating(key: string, value: number): string {
    // Define thresholds for different metrics
    const thresholds: { [key: string]: [number, number] } = {
        cyclomaticComplexity: [10, 20],
        nestedBlockDepth: [3, 5],
        functionLength: [100, 200],
        parameterCount: [4, 7],
        maintainabilityIndex: [65, 85], // Higher is better for this one
        commentRatio: [10, 20]  // Higher is better for this one
    };
    
    if (!thresholds[key]) {
        return 'N/A';
    }
    
    // For metrics where higher is better
    if (key === 'maintainabilityIndex' || key === 'commentRatio') {
        if (value > thresholds[key][1]) {
            return '<span class="rating good">Good</span>';
        } else if (value > thresholds[key][0]) {
            return '<span class="rating average">Average</span>';
        } else {
            return '<span class="rating poor">Poor</span>';
        }
    } 
    // For metrics where lower is better
    else {
        if (value < thresholds[key][0]) {
            return '<span class="rating good">Good</span>';
        } else if (value < thresholds[key][1]) {
            return '<span class="rating average">Average</span>';
        } else {
            return '<span class="rating poor">Poor</span>';
        }
    }
}

/**
 * Estimate the maximum nested depth
 * @param content The file content
 * @returns The maximum nested depth
 */
export function estimateMaxNestedDepth(content: string): number {
    const lines = content.split('\n');
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const line of lines) {
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        
        currentDepth += openBraces - closeBraces;
        maxDepth = Math.max(maxDepth, currentDepth);
    }
    
    return maxDepth;
}