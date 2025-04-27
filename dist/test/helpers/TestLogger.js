"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestLogger = void 0;
class TestLogger {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.infos = [];
        this.debugs = [];
    }
    error(message, ...args) {
        this.errors.push(this.format(message, args));
    }
    warn(message, ...args) {
        this.warnings.push(this.format(message, args));
    }
    info(message, ...args) {
        this.infos.push(this.format(message, args));
    }
    debug(message, ...args) {
        this.debugs.push(this.format(message, args));
    }
    format(message, args) {
        return `${message} ${args.join(' ')}`.trim();
    }
    reset() {
        this.errors = [];
        this.warnings = [];
        this.infos = [];
        this.debugs = [];
    }
}
exports.TestLogger = TestLogger;
//# sourceMappingURL=TestLogger.js.map