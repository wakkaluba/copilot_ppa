"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatProviderError = exports.isRetryableError = exports.formatErrorDetails = exports.parseModelCapabilities = exports.testConnection = exports.delay = exports.calculateRetryDelay = void 0;
const RetryService_1 = require("./services/RetryService");
const ModelCapabilityService_1 = require("./services/ModelCapabilityService");
const ConnectionErrorService_1 = require("./services/ConnectionErrorService");
const retryService = new RetryService_1.RetryService();
const modelCapabilityService = new ModelCapabilityService_1.ModelCapabilityService();
const errorService = new ConnectionErrorService_1.ConnectionErrorService();
function calculateRetryDelay(retryCount, options) {
    return retryService.calculateDelay(retryCount, options);
}
exports.calculateRetryDelay = calculateRetryDelay;
function delay(ms) {
    return retryService.delay(ms);
}
exports.delay = delay;
async function testConnection(url, timeout) {
    return retryService.testConnection(url, timeout);
}
exports.testConnection = testConnection;
function parseModelCapabilities(modelData) {
    return modelCapabilityService.parseCapabilities(modelData);
}
exports.parseModelCapabilities = parseModelCapabilities;
function formatErrorDetails(error) {
    return errorService.formatDetails(error);
}
exports.formatErrorDetails = formatErrorDetails;
function isRetryableError(error) {
    return errorService.isRetryable(error);
}
exports.isRetryableError = isRetryableError;
function formatProviderError(error, providerName) {
    return errorService.formatProviderError(error, providerName);
}
exports.formatProviderError = formatProviderError;
//# sourceMappingURL=connectionUtils.js.map