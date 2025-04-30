/**
 * Message renderer module for conversation panel
 */
import { IChatMessage } from './conversationPanel';
/**
 * Renders a list of chat messages as HTML
 * @param messages Array of chat messages to render
 * @returns HTML string representation of the messages
 */
export declare function renderMessages(messages: IChatMessage[]): string;
