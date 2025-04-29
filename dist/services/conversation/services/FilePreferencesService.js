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
exports.FilePreferencesService = void 0;
const path = __importStar(require("path"));
/**
 * Service for managing file type preferences
 */
class FilePreferencesService {
    /**
     * Create a new FilePreferencesService
     * @param context Extension context for state persistence
     */
    constructor(context) {
        this.fileExtensions = new Map();
        this.directories = new Map();
        this.namingPatterns = new Map();
        this.context = context;
    }
    /**
     * Initialize service
     */
    async initialize() {
        // Load preferences from storage
        const storedPrefs = this.context.globalState.get('filePreferences');
        if (storedPrefs) {
            try {
                const parsedPrefs = JSON.parse(storedPrefs);
                if (parsedPrefs.extensions) {
                    Object.entries(parsedPrefs.extensions).forEach(([key, value]) => {
                        this.fileExtensions.set(key, value);
                    });
                }
                if (parsedPrefs.directories) {
                    Object.entries(parsedPrefs.directories).forEach(([key, value]) => {
                        this.directories.set(key, value);
                    });
                }
                if (parsedPrefs.namingPatterns) {
                    Object.entries(parsedPrefs.namingPatterns).forEach(([key, value]) => {
                        this.namingPatterns.set(key, value);
                    });
                }
            }
            catch (error) {
                console.error('Failed to parse stored file preferences', error);
            }
        }
    }
    /**
     * Track file extension usage
     * @param extension File extension
     */
    trackFileExtension(extension) {
        if (!extension.startsWith('.')) {
            extension = `.${extension}`;
        }
        const count = this.fileExtensions.get(extension) || 0;
        this.fileExtensions.set(extension, count + 1);
        this.savePreferences();
    }
    /**
     * Track directory usage
     * @param filePath Full path to a file
     */
    trackDirectory(filePath) {
        const directory = path.dirname(filePath);
        const count = this.directories.get(directory) || 0;
        this.directories.set(directory, count + 1);
        // Also track naming pattern
        this.trackNamingPattern(path.basename(filePath));
        this.savePreferences();
    }
    /**
     * Track file naming pattern
     * @param fileName Name of the file
     */
    trackNamingPattern(fileName) {
        // Simple patterns: camelCase, snake_case, kebab-case, PascalCase
        const patterns = [
            { name: 'camelCase', regex: /^[a-z][a-zA-Z0-9]*$/ },
            { name: 'snake_case', regex: /^[a-z][a-z0-9_]*$/ },
            { name: 'kebab-case', regex: /^[a-z][a-z0-9-]*$/ },
            { name: 'PascalCase', regex: /^[A-Z][a-zA-Z0-9]*$/ }
        ];
        const baseName = path.parse(fileName).name;
        for (const { name, regex } of patterns) {
            if (regex.test(baseName)) {
                const count = this.namingPatterns.get(name) || 0;
                this.namingPatterns.set(name, count + 1);
                break;
            }
        }
    }
    /**
     * Get most frequently used file extensions
     * @param limit Maximum number of extensions to return
     */
    getMostFrequentExtensions(limit = 5) {
        return Array.from(this.fileExtensions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    /**
     * Get recently used directories
     * @param limit Maximum number of directories to return
     */
    getRecentDirectories(limit = 3) {
        return Array.from(this.directories.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    /**
     * Get file naming patterns used by the user
     */
    getNamingPatterns() {
        return Array.from(this.namingPatterns.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
    }
    /**
     * Check if a file extension is preferred
     * @param extension File extension
     */
    isPreferredExtension(extension) {
        if (!extension.startsWith('.')) {
            extension = `.${extension}`;
        }
        const count = this.fileExtensions.get(extension) || 0;
        return count > 0;
    }
    /**
     * Clear all preferences
     */
    async clearPreferences() {
        this.fileExtensions.clear();
        this.directories.clear();
        this.namingPatterns.clear();
        await this.savePreferences();
    }
    /**
     * Save preferences to storage
     */
    async savePreferences() {
        const prefsObject = {
            extensions: Object.fromEntries(this.fileExtensions.entries()),
            directories: Object.fromEntries(this.directories.entries()),
            namingPatterns: Object.fromEntries(this.namingPatterns.entries())
        };
        await this.context.globalState.update('filePreferences', JSON.stringify(prefsObject));
    }
}
exports.FilePreferencesService = FilePreferencesService;
//# sourceMappingURL=FilePreferencesService.js.map