"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedLogger = void 0;
const LoggingService_1 = require("../services/logging/LoggingService");
class AdvancedLogger {
    static instance;
    service;
    constructor() {
        this.service = new LoggingService_1.LoggingService();
    }
    static getInstance() {
        if (!AdvancedLogger.instance) {
            AdvancedLogger.instance = new AdvancedLogger();
        }
        return AdvancedLogger.instance;
    }
    updateFromConfig() {
        this.service.updateFromConfig();
    }
    setLogLevel(level) {
        this.service.setLogLevel(level);
    }
    enableFileLogging(filePath = '', maxSizeMB = 5, maxFiles = 3) {
        this.service.enableFileLogging(filePath, maxSizeMB, maxFiles);
    }
    disableFileLogging() {
        this.service.disableFileLogging();
    }
    isFileLoggingEnabled() {
        return this.service.isFileLoggingEnabled();
    }
    getLogFilePath() {
        return this.service.getLogFilePath();
    }
    debug(message, context = {}, source) {
        this.service.debug(message, context, source);
    }
    info(message, context = {}, source) {
        this.service.info(message, context, source);
    }
    warn(message, context = {}, source) {
        this.service.warn(message, context, source);
    }
    error(message, context = {}, source) {
        this.service.error(message, context, source);
    }
    log(level, message, context = {}, source) {
        this.service.log(level, message, context, source);
    }
    getLogs() {
        return this.service.getLogs();
    }
    clearLogs() {
        this.service.clearLogs();
    }
    addLogListener(listener) {
        this.service.addLogListener(listener);
    }
    removeLogListener(listener) {
        this.service.removeLogListener(listener);
    }
    showOutputChannel() {
        this.service.showOutputChannel();
    }
    getEntryCount(level) {
        return this.service.getEntryCount(level);
    }
}
exports.AdvancedLogger = AdvancedLogger;
//# sourceMappingURL=advancedLogger.js.map