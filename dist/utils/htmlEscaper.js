"use strict";
/**
 * HTML escaper utility to prevent XSS attacks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = escapeHtml;
/**
 * Escapes HTML special characters in a string
 * @param text String to escape
 * @returns Escaped string
 */
function escapeHtml(text) {
    if (!text) {
        return '';
    }
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
//# sourceMappingURL=htmlEscaper.js.map