import { Conversation, ChatMessage } from '../../types/conversation';
/**
 * Renders a single message as HTML
 * @param message The chat message to render
 * @param index Index of the message in the conversation
 * @returns HTML string representation of the message
 */
export declare function renderMessage(message: ChatMessage, index: number): string;
/**
 * Generates the HTML for the conversation panel
 * @param conversation The conversation data to render
 * @returns HTML string for the conversation panel
 */
export declare function getConversationPanelHtml(conversation: Conversation): string;
/**
 * Gets the JavaScript code for the conversation panel
 * @returns JavaScript as a string
 */
export declare function getConversationPanelScript(): string;
/**
 * Gets the CSS styles for the conversation panel
 * @returns CSS as a string
 */
export declare function getConversationPanelStyles(): string;
