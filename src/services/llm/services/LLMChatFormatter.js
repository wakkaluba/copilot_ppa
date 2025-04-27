"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMChatFormatter = void 0;
var types_1 = require("../types");
/**
 * Service for formatting chat messages, context, and responses
 */
var LLMChatFormatter = /** @class */ (function () {
    function LLMChatFormatter(options) {
        if (options === void 0) { options = {}; }
        var _a, _b;
        this.defaultSystemPrompt = 'You are a helpful AI assistant.';
        this.maxContextLength = 4096;
        this.options = __assign({ systemPromptPrefix: options.systemPromptPrefix || this.defaultSystemPrompt, maxContextMessages: options.maxContextMessages || 10, useMarkdown: (_a = options.useMarkdown) !== null && _a !== void 0 ? _a : true, preserveFormatting: (_b = options.preserveFormatting) !== null && _b !== void 0 ? _b : true }, options);
    }
    /**
     * Format conversation context
     */
    LLMChatFormatter.prototype.formatContext = function (messages, context) {
        if (context === void 0) { context = {}; }
        try {
            var formatted = '';
            // Add system prompt
            var systemPrompt = this.formatSystemPrompt(context);
            if (systemPrompt) {
                formatted += systemPrompt + '\n\n';
            }
            // Add context variables
            var contextVars = this.formatContextVariables(context);
            if (contextVars) {
                formatted += contextVars + '\n\n';
            }
            // Add conversation history
            var history_1 = this.formatConversationHistory(messages);
            if (history_1) {
                formatted += history_1;
            }
            // Ensure we don't exceed max context length
            if (formatted.length > this.maxContextLength) {
                formatted = this.truncateContext(formatted);
            }
            return formatted.trim();
        }
        catch (error) {
            throw new types_1.ChatError('Failed to format context', undefined, error instanceof Error ? error : undefined);
        }
    };
    /**
     * Format system prompt
     */
    LLMChatFormatter.prototype.formatSystemPrompt = function (context) {
        var prompt = this.options.systemPromptPrefix;
        if (context.systemInstructions) {
            prompt += '\n' + context.systemInstructions;
        }
        if (context.userPreferences) {
            prompt += '\nUser preferences:';
            for (var _i = 0, _a = Object.entries(context.userPreferences); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                prompt += "\n- ".concat(key, ": ").concat(value);
            }
        }
        return prompt;
    };
    /**
     * Format context variables
     */
    LLMChatFormatter.prototype.formatContextVariables = function (context) {
        if (!context.variables || Object.keys(context.variables).length === 0) {
            return '';
        }
        var formatted = 'Current context:';
        for (var _i = 0, _a = Object.entries(context.variables); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            formatted += "\n".concat(key, ": ").concat(this.formatValue(value));
        }
        return formatted;
    };
    /**
     * Format conversation history
     */
    LLMChatFormatter.prototype.formatConversationHistory = function (messages) {
        var _this = this;
        if (messages.length === 0) {
            return '';
        }
        // Get most recent messages up to maxContextMessages
        var recentMessages = messages
            .slice(-this.options.maxContextMessages)
            .map(function (msg) { return _this.formatMessage(msg); })
            .join('\n\n');
        return recentMessages;
    };
    /**
     * Format a single message
     */
    LLMChatFormatter.prototype.formatMessage = function (message) {
        var role = message.role.charAt(0).toUpperCase() + message.role.slice(1);
        var formatted = "".concat(role, ": ").concat(message.content);
        if (this.options.useMarkdown) {
            formatted = this.applyMarkdownFormatting(formatted, message);
        }
        return formatted;
    };
    /**
     * Format a value for display
     */
    LLMChatFormatter.prototype.formatValue = function (value) {
        if (typeof value === 'string') {
            return value;
        }
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    };
    /**
     * Apply markdown formatting
     */
    LLMChatFormatter.prototype.applyMarkdownFormatting = function (text, message) {
        var _a;
        if (!this.options.useMarkdown) {
            return text;
        }
        var formatted = text;
        // Add code block formatting
        if ((_a = message.metadata) === null || _a === void 0 ? void 0 : _a.isCode) {
            var lang = message.metadata.language || '';
            formatted = "```".concat(lang, "\n").concat(formatted, "\n```");
        }
        // Add quote formatting for system messages
        if (message.role === 'system') {
            formatted = '> ' + formatted.replace(/\n/g, '\n> ');
        }
        return formatted;
    };
    /**
     * Format LLM response
     */
    LLMChatFormatter.prototype.formatResponse = function (response) {
        try {
            var content = response.content;
            // Apply formatting if needed
            if (this.options.useMarkdown && !this.options.preserveFormatting) {
                content = this.cleanMarkdown(content);
            }
            return content;
        }
        catch (error) {
            throw new types_1.ChatError('Failed to format response', undefined, error instanceof Error ? error : undefined);
        }
    };
    /**
     * Clean and normalize markdown
     */
    LLMChatFormatter.prototype.cleanMarkdown = function (content) {
        return content
            // Normalize line endings
            .replace(/\r\n/g, '\n')
            // Remove extra blank lines
            .replace(/\n{3,}/g, '\n\n')
            // Fix code block formatting
            .replace(/```(\w*)\s*\n/g, '```$1\n')
            .replace(/\n\s*```/g, '\n```')
            // Fix list formatting
            .replace(/^\s*[-*+]\s*/gm, '- ')
            .trim();
    };
    /**
     * Truncate context to fit within max length
     */
    LLMChatFormatter.prototype.truncateContext = function (context) {
        // Keep system prompt and most recent messages
        var parts = context.split('\n\n');
        var systemPrompt = parts[0];
        var contextVars = parts[1];
        var remaining = this.maxContextLength -
            (systemPrompt.length + contextVars.length + 4); // 4 for \n\n separators
        var messages = parts.slice(2);
        var keptMessages = [];
        // Add messages from most recent until we hit the limit
        for (var i = messages.length - 1; i >= 0; i--) {
            var message = messages[i];
            if (message.length + 2 <= remaining) { // 2 for \n\n separator
                keptMessages.unshift(message);
                remaining -= message.length + 2;
            }
            else {
                break;
            }
        }
        return __spreadArray([systemPrompt, contextVars], keptMessages, true).join('\n\n');
    };
    /**
     * Extract code blocks from message
     */
    LLMChatFormatter.prototype.extractCodeBlocks = function (content) {
        var blocks = [];
        var codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
        var match;
        while ((match = codeBlockRegex.exec(content)) !== null) {
            blocks.push({
                language: match[1] || 'text',
                code: match[2].trim()
            });
        }
        return blocks;
    };
    /**
     * Format error message
     */
    LLMChatFormatter.prototype.formatError = function (error) {
        var message = typeof error === 'string' ? error : error.message;
        return this.options.useMarkdown ?
            "**Error**: ".concat(message) :
            "Error: ".concat(message);
    };
    return LLMChatFormatter;
}());
exports.LLMChatFormatter = LLMChatFormatter;
