export interface LLMPromptOptions {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stopSequences?: string[];
}
