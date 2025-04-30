"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const ContextManager_1 = require("./conversation/ContextManager");
/**
 * Re-export the ContextManager from the conversation directory
 * This helps maintain compatibility with existing test imports
 */
class ContextManager {
    static instance;
    /**
     * Get singleton instance of ContextManager
     * @param context Extension context
     */
    static getInstance(context) {
        if (!this.instance) {
            this.instance = ContextManager_1.ContextManager.getInstance(context);
        }
        return this.instance;
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map