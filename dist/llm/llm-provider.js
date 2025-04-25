"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProvider = void 0;
/**
 * Base implementation of the LLM Provider interface
 */
class LLMProvider {
    /**
     * Stream a prompt response from this provider (optional)
     * @param request The LLM request to process
     */
    async *streamPrompt(request) {
        // Default implementation for providers that don't support streaming
        // Just get the full response and yield it
        const response = await this.completePrompt(request);
        yield response;
    }
}
exports.LLMProvider = LLMProvider;
//# sourceMappingURL=llm-provider.js.map