"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRetryDelay = calculateRetryDelay;
exports.delay = delay;
exports.testConnection = testConnection;
exports.parseModelCapabilities = parseModelCapabilities;
exports.formatErrorDetails = formatErrorDetails;
exports.isRetryableError = isRetryableError;
exports.formatProviderError = formatProviderError;
const RetryService_1 = require("./services/RetryService");
const ModelCapabilityService_1 = require("./services/ModelCapabilityService");
const ConnectionErrorService_1 = require("./services/ConnectionErrorService");
const retryService = new RetryService_1.RetryService();
const modelCapabilityService = new ModelCapabilityService_1.ModelCapabilityService();
const errorService = new ConnectionErrorService_1.ConnectionErrorService();
function calculateRetryDelay(retryCount, options) {
    return retryService.calculateDelay(retryCount, options);
}
function delay(ms) {
    return retryService.delay(ms);
}
async function testConnection(url, timeout) {
    return retryService.testConnection(url, timeout);
}
function parseModelCapabilities(modelData) {
    return modelCapabilityService.parseCapabilities(modelData);
}
function formatErrorDetails(error) {
    return errorService.formatDetails(error);
}
function isRetryableError(error) {
    return errorService.isRetryable(error);
}
function formatProviderError(error, providerName) {
    return errorService.formatProviderError(error, providerName);
}
//# sourceMappingURL=connectionUtils.js.map