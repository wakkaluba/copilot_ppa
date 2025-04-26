import * as vscode from 'vscode';
import * as os from 'os';
import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure nonce string
 * @returns A random nonce string
 */
export function getNonce(): string {
    return randomBytes(16).toString('base64');
}

/**
 * Convert a local path to a webview URI
 * @param webview The webview to use for URI conversion
 * @param extensionPath The extension path
 * @param pathParts Path parts to join
 * @returns A webview URI
 */
export function getWebviewUri(
    webview: vscode.Webview,
    extensionPath: string,
    ...pathParts: string[]
): vscode.Uri {
    const uri = vscode.Uri.joinPath(vscode.Uri.file(extensionPath), ...pathParts);
    return webview.asWebviewUri(uri);
}

/**
 * Get system information including OS, memory, etc.
 * @returns SystemInfo object
 */
export function getSystemInfo(): SystemInfo {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const cpuCount = os.cpus().length;
    
    return {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        totalMemoryMB: Math.floor(totalMemory / (1024 * 1024)),
        freeMemoryMB: Math.floor(freeMemory / (1024 * 1024)),
        usedMemoryMB: Math.floor(usedMemory / (1024 * 1024)),
        memoryUsagePercent: Math.round((usedMemory / totalMemory) * 100),
        cpuCount,
        cpuModel: os.cpus()[0]?.model || 'Unknown',
        nodeVersion: process.version
    };
}

/**
 * Format bytes to human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Human-readable string representation
 */
export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Safely parse JSON with error handling
 * @param text JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed object or default value
 */
export function parseJson<T>(text: string, defaultValue: T): T {
    try {
        return JSON.parse(text) as T;
    } catch (error) {
        return defaultValue;
    }
}

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