import * as vscode from 'vscode';
/**
 * Generate a cryptographically secure nonce string
 * @returns A random nonce string
 */
export declare function getNonce(): string;
/**
 * Convert a local path to a webview URI
 * @param webview The webview to use for URI conversion
 * @param extensionPath The extension path
 * @param pathParts Path parts to join
 * @returns A webview URI
 */
export declare function getWebviewUri(webview: vscode.Webview, extensionPath: string, ...pathParts: string[]): vscode.Uri;
/**
 * Get system information including OS, memory, etc.
 * @returns SystemInfo object
 */
export declare function getSystemInfo(): SystemInfo;
/**
 * Format bytes to human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Human-readable string representation
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Safely parse JSON with error handling
 * @param text JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed object or default value
 */
export declare function parseJson<T>(text: string, defaultValue: T): T;
/**
 * System information type
 */
export interface SystemInfo {
    platform: string;
    arch: string;
    release: string;
    hostname: string;
    totalMemoryMB: number;
    freeMemoryMB: number;
    usedMemoryMB: number;
    memoryUsagePercent: number;
    cpuCount: number;
    cpuModel: string;
    nodeVersion: string;
}
