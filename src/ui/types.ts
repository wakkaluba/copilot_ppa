export interface WebviewState {
    isLocalLLMActive: boolean;
    isCopilotConnected: boolean;
}

export interface WebviewMessage {
    command: 'toggleLLMMode' | 'sendMessage' | 'reconnectCopilot';
    text?: string;
}