import { IChatMessage } from '../../models/interfaces';

export interface IContextManager {
    getCurrentConversationId(): string;
    getContextString(): string;
    appendMessage(message: IChatMessage): void;
    listMessages(): IChatMessage[];
    clear(): Promise<void>;
}