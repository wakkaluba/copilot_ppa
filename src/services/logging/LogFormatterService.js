"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogFormatterService = void 0;
var logging_1 = require("../../types/logging");
/**
 * Service for formatting log entries for different outputs
 */
var LogFormatterService = /** @class */ (function () {
    function LogFormatterService() {
    }
    /**
     * Create a new log entry
     */
    LogFormatterService.prototype.createEntry = function (level, message, context, source) {
        if (context === void 0) { context = {}; }
        // Return with correct typing to satisfy exactOptionalPropertyTypes
        var entry = {
            timestamp: new Date(),
            level: level,
            message: message,
            context: context
        };
        // Only set source if it's provided
        if (source !== undefined) {
            entry.source = source;
        }
        return entry;
    };
    /**
     * Format an entry for display in VS Code output channel
     */
    LogFormatterService.prototype.formatForDisplay = function (entry) {
        var timestamp = new Date(entry.timestamp).toISOString();
        var level = this.formatLevel(entry.level);
        var source = entry.source ? "[".concat(entry.source, "] ") : '';
        var result = "[".concat(timestamp, "] [").concat(level, "] ").concat(source).concat(entry.message);
        // Add context if any
        if (entry.context && Object.keys(entry.context).length > 0) {
            try {
                result += "\n".concat(JSON.stringify(entry.context, null, 2));
            }
            catch (e) {
                result += "\nContext: [Not serializable]";
            }
        }
        return result;
    };
    /**
     * Format an entry for JSON serialization
     */
    LogFormatterService.prototype.formatForJson = function (entry) {
        return JSON.stringify(entry);
    };
    /**
     * Format log level with fixed width padding
     */
    LogFormatterService.prototype.formatLevel = function (level) {
        var _a;
        var levelMap = (_a = {},
            _a[logging_1.LogLevel.DEBUG] = 'DEBUG',
            _a[logging_1.LogLevel.INFO] = 'INFO ',
            _a[logging_1.LogLevel.WARN] = 'WARN ',
            _a[logging_1.LogLevel.ERROR] = 'ERROR',
            _a);
        return levelMap[level] || 'UNKN ';
    };
    return LogFormatterService;
}());
exports.LogFormatterService = LogFormatterService;
