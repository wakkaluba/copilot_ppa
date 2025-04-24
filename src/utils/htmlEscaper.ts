/**
 * HTML escaper utility to prevent XSS attacks
 */

/**
 * Escapes HTML special characters in a string
 * @param text String to escape
 * @returns Escaped string
 */
export function escapeHtml(text: string): string {
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