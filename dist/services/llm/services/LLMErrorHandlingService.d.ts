import { LLMConnectionError, LLMConnectionErrorCode } from '../types';
export declare class LLMErrorHandlingService {
    createError(code: LLMConnectionErrorCode, message: string, cause?: Error): LLMConnectionError;
    formatError(error: unknown): LLMConnectionError;
    isRetryableError(error: unknown): boolean;
}
