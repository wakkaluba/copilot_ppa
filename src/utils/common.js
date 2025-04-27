"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonce = getNonce;
exports.getWebviewUri = getWebviewUri;
exports.getSystemInfo = getSystemInfo;
exports.formatBytes = formatBytes;
exports.parseJson = parseJson;
var vscode = require("vscode");
var os = require("os");
var crypto_1 = require("crypto");
/**
 * Generate a cryptographically secure nonce string
 * @returns A random nonce string
 */
function getNonce() {
    return (0, crypto_1.randomBytes)(16).toString('base64');
}
/**
 * Convert a local path to a webview URI
 * @param webview The webview to use for URI conversion
 * @param extensionPath The extension path
 * @param pathParts Path parts to join
 * @returns A webview URI
 */
function getWebviewUri(webview, extensionPath) {
    var _a;
    var pathParts = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        pathParts[_i - 2] = arguments[_i];
    }
    var uri = (_a = vscode.Uri).joinPath.apply(_a, __spreadArray([vscode.Uri.file(extensionPath)], pathParts, false));
    return webview.asWebviewUri(uri);
}
/**
 * Get system information including OS, memory, etc.
 * @returns SystemInfo object
 */
function getSystemInfo() {
    var _a;
    var totalMemory = os.totalmem();
    var freeMemory = os.freemem();
    var usedMemory = totalMemory - freeMemory;
    var cpuCount = os.cpus().length;
    return {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        totalMemoryMB: Math.floor(totalMemory / (1024 * 1024)),
        freeMemoryMB: Math.floor(freeMemory / (1024 * 1024)),
        usedMemoryMB: Math.floor(usedMemory / (1024 * 1024)),
        memoryUsagePercent: Math.round((usedMemory / totalMemory) * 100),
        cpuCount: cpuCount,
        cpuModel: ((_a = os.cpus()[0]) === null || _a === void 0 ? void 0 : _a.model) || 'Unknown',
        nodeVersion: process.version
    };
}
/**
 * Format bytes to human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Human-readable string representation
 */
function formatBytes(bytes, decimals) {
    if (decimals === void 0) { decimals = 2; }
    if (bytes === 0)
        return '0 Bytes';
    var k = 1024;
    var dm = decimals < 0 ? 0 : decimals;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
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
