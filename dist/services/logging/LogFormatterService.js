"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogFormatterService = void 0;
const logging_1 = require("../../types/logging");
/**
 * Service for formatting log entries for different outputs
 */
class LogFormatterService {
    /**
     * Create a new log entry
     */
    createEntry(level, message, context = {}, source) {
        // Return with correct typing to satisfy exactOptionalPropertyTypes
        const entry = {
            timestamp: Date.now(),
            level,
            message,
            context
        };
        // Only set source if it's provided
        if (source !== undefined) {
            entry.source = source;
        }
        return entry;
    }
    /**
     * Format an entry for display in VS Code output channel
     */
    formatForDisplay(entry) {
        const timestamp = new Date(entry.timestamp).toISOString();
        const level = this.formatLevel(entry.level);
        const source = entry.source ? `[${entry.source}] ` : '';
        let result = `[${timestamp}] [${level}] ${source}${entry.message}`;
        // Add context if any
        if (entry.context && Object.keys(entry.context).length > 0) {
            try {
                result += `\n${JSON.stringify(entry.context, null, 2)}`;
            }
            catch (e) {
                result += `\nContext: [Not serializable]`;
            }
        }
        return result;
    }
    /**
     * Format an entry for JSON serialization
     */
    formatForJson(entry) {
        return JSON.stringify(entry);
    }
    /**
     * Format log level with fixed width padding
     */
    formatLevel(level) {
        const levelMap = {
            [logging_1.LogLevel.DEBUG]: 'DEBUG',
            [logging_1.LogLevel.INFO]: 'INFO ',
            [logging_1.LogLevel.WARN]: 'WARN ',
            [logging_1.LogLevel.ERROR]: 'ERROR'
        };
        return levelMap[level] || 'UNKN ';
    }
}
exports.LogFormatterService = LogFormatterService;
//# sourceMappingURL=LogFormatterService.js.map