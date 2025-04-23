"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const LogLevel_1 = require("./LogLevel");
class Logger {
    static instance;
    constructor() { }
    static getInstance() {
        if (!Logger.getInstance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    log(message, level = LogLevel_1.LogLevel.Info) {
        // Implement logging logic
    }
    for(context) {
        // Create scoped logger
        return new Logger();
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map