"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConnectionManager = void 0;
const LLMConnectionManager_1 = require("./llm/LLMConnectionManager");
/**
 * @deprecated Use the new LLMConnectionManager from services/llm instead
 */
class LLMConnectionManager {
    static instance;
    newManager;
    constructor() {
        this.newManager = LLMConnectionManager_1.LLMConnectionManager.getInstance();
        console.warn('LLMConnectionManager is deprecated. Use services/llm/LLMConnectionManager instead.');
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LLMConnectionManager();
        }
        return this.instance;
    }
    async connectToLLM() {
        return this.newManager.connectToLLM();
    }
    async handleConnectionFailure() {
        // Forward to new implementation's retry mechanism
        return false; // Let new implementation handle retries
    }
    dispose() {
        this.newManager.dispose();
    }
}
exports.LLMConnectionManager = LLMConnectionManager;
//# sourceMappingURL=LLMConnectionManager.js.map