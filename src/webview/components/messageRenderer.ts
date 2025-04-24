/**
 * Message renderer module for conversation panel
 */

// Import dependencies
import { escapeHtml } from '../../utils/htmlEscaper';
import { IChatMessage } from './conversationPanel';

/**
 * Renders a list of chat messages as HTML
 * @param messages Array of chat messages to render
 * @returns HTML string representation of the messages
 */
export function renderMessages(messages: IChatMessage[]): string {
    if (!messages || messages.length === 0) {
        return '<div class="no-messages">No messages in this conversation yet.</div>';
    }
    
    return messages.map((message, index) => {
        return renderSingleMessage(message, index);
    }).join('');
}

/**
 * Renders a single chat message as HTML
 * @param message Chat message to render
 * @param index Index of the message in the conversation
 * @returns HTML string representation of the message
 */
function renderSingleMessage(message: IChatMessage, index: number): string {
    const role = message.role === 'user' ? 'user' : 
                message.role === 'assistant' ? 'assistant' : 'system';
    const timestamp = new Date(message.timestamp).toLocaleString();
    
    return `
    <div class="message message-${role}" data-index="${index}">
        <div class="message-header">
            <div class="message-role">${role}</div>
            <div class="message-timestamp">${timestamp}</div>
        </div>
        <div class="message-content">${formatMessageContent(message.content)}</div>
    </div>
    `;
}

/**
 * Format message content by handling code blocks and escaping HTML
 * @param content Raw message content
 * @returns Formatted HTML content
 */
function formatMessageContent(content: string): string {
    if (!content) {
        return '';
    }
    
    // Replace code blocks with properly formatted HTML
    let formattedContent = content.replace(/```([\w]*)([\s\S]*?)```/g, (_match, language, code) => {
        return `<pre class="code-block${language ? ' language-' + language : ''}"><code>${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Handle inline code
    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle paragraphs - replace double newlines with paragraph breaks
    formattedContent = formattedContent.replace(/\n\n/g, '</p><p>');
    
    // Handle single newlines
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already
    if (!formattedContent.startsWith('<p>')) {
        formattedContent = `<p>${formattedContent}</p>`;
    }
    
    return formattedContent;
}