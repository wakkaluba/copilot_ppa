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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullOrUndefined = isNullOrUndefined;
exports.getNestedProperty = getNestedProperty;
exports.safeJsonParse = safeJsonParse;
exports.debounce = debounce;
exports.throttle = throttle;
exports.getHardwareSpecs = getHardwareSpecs;
exports.formatBytes = formatBytes;
exports.formatTime = formatTime;
exports.ensureDirectoryExists = ensureDirectoryExists;
exports.uniqueArray = uniqueArray;
exports.sleep = sleep;
exports.clamp = clamp;
exports.isValidUrl = isValidUrl;
exports.parseError = parseError;
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
/**
 * Checks if a value is null or undefined
 */
function isNullOrUndefined(value) {
    return value === null || value === undefined;
}
/**
 * Safely gets a nested property from an object without throwing errors
 */
function getNestedProperty(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (isNullOrUndefined(current) || typeof current !== 'object') {
            return defaultValue;
        }
        current = current[key];
    }
    return isNullOrUndefined(current) ? defaultValue : current;
}
/**
 * Safely parse JSON without throwing errors
 */
function safeJsonParse(text, defaultValue = {}) {
    try {
        return JSON.parse(text);
    }
    catch (error) {
        return defaultValue;
    }
}
/**
 * Debounce a function
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const later = () => {
            timeout = undefined;
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
/**
 * Throttle a function to limit execution frequency
 */
function throttle(func, wait) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= wait) {
            lastCall = now;
            func(...args);
        }
    };
}
/**
 * Get system hardware specifications
 */
async function getHardwareSpecs() {
    // Default return object with basic info we can get synchronously
    const result = {
        ram: {
            total: os.totalmem() / (1024 * 1024), // Convert to MB
            free: os.freemem() / (1024 * 1024) // Convert to MB
        },
        cpu: {
            cores: os.cpus().length,
            model: os.cpus()[0]?.model
        },
        gpu: {
            available: false
        }
    };
    // In a real implementation, we'd use platform-specific methods to detect GPU
    // This is a placeholder that would be replaced with actual implementation
    return result;
}
/**
 * Format bytes to a human readable string
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
/**
 * Format milliseconds into a human-readable time string
 */
function formatTime(ms) {
    if (ms <= 0) {
        return '0s';
    }
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const parts = [];
    if (days > 0)
        parts.push(`${days}d`);
    if (hours > 0)
        parts.push(`${hours}h`);
    if (minutes > 0)
        parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0)
        parts.push(`${seconds}s`);
    return parts.join(' ');
}
/**
 * Ensure a directory exists, creating it if needed
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
/**
 * Get unique items from an array
 */
function uniqueArray(array) {
    return [...new Set(array)];
}
/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Clamp a number between min and max values
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/**
 * Check if a string is a valid URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (error) {
        return false;
    }
}
/**
 * Parse error objects into string messages
 */
function parseError(error) {
    if (!error) {
        return 'Unknown error';
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return `Error: ${typeof error} ${JSON.stringify(error)}`;
}
//# sourceMappingURL=common.js.map