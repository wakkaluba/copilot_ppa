import { LLMConnectionError, LLMConnectionErrorCode } from '../types';

export class LLMErrorHandlingService {
    public createError(code: LLMConnectionErrorCode, message: string, cause?: Error): LLMConnectionError {
        return new LLMConnectionError(code, message, cause);
    }

    public formatError(error: unknown): LLMConnectionError {
        if (error instanceof LLMConnectionError) {
            return error;
        }

        const message = error instanceof Error ? error.message : String(error);
        return this.createError(LLMConnectionErrorCode.InternalError, message);
    }

    public isRetryableError(error: unknown): boolean {
        if (error instanceof LLMConnectionError) {
            return [
                LLMConnectionErrorCode.ConnectionFailed,
                LLMConnectionErrorCode.Timeout
            ].includes(error.code);
        }

        // Network-related errors are generally retryable
        if (error instanceof Error) {
            const networkErrors = [
                'ECONNREFUSED',
                'ECONNRESET',
                'ETIMEDOUT',
                'ENOTFOUND'
            ];
            return networkErrors.some(code => error.message.includes(code));
        }

        return false;
    }
}