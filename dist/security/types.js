"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityCategory = exports.SecuritySeverity = void 0;
var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["Critical"] = "critical";
    SecuritySeverity["High"] = "high";
    SecuritySeverity["Medium"] = "medium";
    SecuritySeverity["Low"] = "low";
    SecuritySeverity["Info"] = "info";
})(SecuritySeverity || (exports.SecuritySeverity = SecuritySeverity = {}));
var SecurityCategory;
(function (SecurityCategory) {
    SecurityCategory["Injection"] = "injection";
    SecurityCategory["XSS"] = "xss";
    SecurityCategory["PathTraversal"] = "pathTraversal";
    SecurityCategory["Authentication"] = "authentication";
    SecurityCategory["Authorization"] = "authorization";
    SecurityCategory["Encryption"] = "encryption";
    SecurityCategory["Configuration"] = "configuration";
    SecurityCategory["Validation"] = "validation";
    SecurityCategory["Other"] = "other";
})(SecurityCategory || (exports.SecurityCategory = SecurityCategory = {}));
//# sourceMappingURL=types.js.map