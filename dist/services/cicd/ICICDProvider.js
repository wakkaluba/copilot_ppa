"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CICDError = void 0;
class CICDError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'CICDError';
    }
}
exports.CICDError = CICDError;
//# sourceMappingURL=ICICDProvider.js.map