export interface IWebviewState {
    isLocalLLMActive: boolean;
    isCopilotConnected: boolean;
}

export interface IWebviewMessage {
    command: 'toggleLLMMode' | 'sendMessage' | 'reconnectCopilot';
    text?: string;
}