"use strict";
/**
 * Message renderer module for conversation panel
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMessages = renderMessages;
// Import dependencies
var htmlEscaper_1 = require("../../utils/htmlEscaper");
/**
 * Renders a list of chat messages as HTML
 * @param messages Array of chat messages to render
 * @returns HTML string representation of the messages
 */
function renderMessages(messages) {
    if (!messages || messages.length === 0) {
        return '<div class="no-messages">No messages in this conversation yet.</div>';
    }
    return messages.map(function (message, index) {
        return renderSingleMessage(message, index);
    }).join('');
}
/**
 * Renders a single chat message as HTML
 * @param message Chat message to render
 * @param index Index of the message in the conversation
 * @returns HTML string representation of the message
 */
function renderSingleMessage(message, index) {
    var role = message.role === 'user' ? 'user' :
        message.role === 'assistant' ? 'assistant' : 'system';
    var timestamp = new Date(message.timestamp).toLocaleString();
    return "\n    <div class=\"message message-".concat(role, "\" data-index=\"").concat(index, "\">\n        <div class=\"message-header\">\n            <div class=\"message-role\">").concat(role, "</div>\n            <div class=\"message-timestamp\">").concat(timestamp, "</div>\n        </div>\n        <div class=\"message-content\">").concat(formatMessageContent(message.content), "</div>\n    </div>\n    ");
}
/**
 * Format message content by handling code blocks and escaping HTML
 * @param content Raw message content
 * @returns Formatted HTML content
 */
function formatMessageContent(content) {
    if (!content) {
        return '';
    }
    // Replace code blocks with properly formatted HTML
    var formattedContent = content.replace(/```([\w]*)([\s\S]*?)```/g, function (_match, language, code) {
        return "<pre class=\"code-block".concat(language ? ' language-' + language : '', "\"><code>").concat((0, htmlEscaper_1.escapeHtml)(code.trim()), "</code></pre>");
    });
    // Handle inline code
    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Handle paragraphs - replace double newlines with paragraph breaks
    formattedContent = formattedContent.replace(/\n\n/g, '</p><p>');
    // Handle single newlines
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    // Wrap in paragraphs if not already
    if (!formattedContent.startsWith('<p>')) {
        formattedContent = "<p>".concat(formattedContent, "</p>");
    }
    return formattedContent;
}
