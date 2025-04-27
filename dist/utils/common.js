"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJson = exports.formatBytes = exports.getSystemInfo = exports.getWebviewUri = exports.getNonce = void 0;
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
const crypto_1 = require("crypto");
/**
 * Generate a cryptographically secure nonce string
 * @returns A random nonce string
 */
function getNonce() {
    return (0, crypto_1.randomBytes)(16).toString('base64');
}
exports.getNonce = getNonce;
/**
 * Convert a local path to a webview URI
 * @param webview The webview to use for URI conversion
 * @param extensionPath The extension path
 * @param pathParts Path parts to join
 * @returns A webview URI
 */
function getWebviewUri(webview, extensionPath, ...pathParts) {
    const uri = vscode.Uri.joinPath(vscode.Uri.file(extensionPath), ...pathParts);
    return webview.asWebviewUri(uri);
}
exports.getWebviewUri = getWebviewUri;
/**
 * Get system information including OS, memory, etc.
 * @returns SystemInfo object
 */
function getSystemInfo() {
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
exports.getSystemInfo = getSystemInfo;
/**
 * Format bytes to human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Human-readable string representation
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
exports.formatBytes = formatBytes;
/**
 * Safely parse JSON with error handling
 * @param text JSON string to parse
 * @param defaultValue Default value to return if parsing fails
 * @returns Parsed object or default value
 */
function parseJson(text, defaultValue) {
    try {
        return JSON.parse(text);
    }
    catch (error) {
        return defaultValue;
    }
}
exports.parseJson = parseJson;
//# sourceMappingURL=common.js.map