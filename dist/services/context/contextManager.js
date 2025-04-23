"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
class ContextManager {
    messages = [];
    maxContextLength = 4096;
    constructor() { }
    appendMessage(message) {
        this.messages.push(message);
        this.trimContextIfNeeded();
    }
    listMessages() {
        return [...this.messages];
    }
    getContextString() {
        return this.messages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n\n');
    }
    async clear() {
        this.messages = [];
    }
    trimContextIfNeeded() {
        let totalLength = this.getContextString().length;
        while (totalLength > this.maxContextLength && this.messages.length > 2) {
            // Keep the last user message and response pair
            this.messages.splice(0, 2);
            totalLength = this.getContextString().length;
        }
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=contextManager.js.map