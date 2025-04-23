import { ChatMessage } from '../../models/chat';

export class ContextManager {
    private messages: ChatMessage[] = [];
    private maxContextLength = 4096;

    constructor() {}

    public appendMessage(message: ChatMessage): void {
        this.messages.push(message);
        this.trimContextIfNeeded();
    }

    public listMessages(): ChatMessage[] {
        return [...this.messages];
    }

    public getContextString(): string {
        return this.messages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n\n');
    }

    public async clear(): Promise<void> {
        this.messages = [];
    }

    private trimContextIfNeeded(): void {
        let totalLength = this.getContextString().length;
        while (totalLength > this.maxContextLength && this.messages.length > 2) {
            // Keep the last user message and response pair
            this.messages.splice(0, 2);
            totalLength = this.getContextString().length;
        }
    }
}