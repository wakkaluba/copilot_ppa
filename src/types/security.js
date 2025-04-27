"use strict";
/**
 * Types and interfaces for the security module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecuritySeverity = void 0;
/**
 * Severity levels for security issues
 */
var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["CRITICAL"] = "critical";
    SecuritySeverity["HIGH"] = "high";
    SecuritySeverity["MEDIUM"] = "medium";
    SecuritySeverity["LOW"] = "low";
})(SecuritySeverity || (exports.SecuritySeverity = SecuritySeverity = {}));
