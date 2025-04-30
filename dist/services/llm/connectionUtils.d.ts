/**
 * Utilities for LLM connection management
 */
import { LLMConnectionOptions } from '../../types/llm';
import { LLMConnectionError } from './errors';
export declare function calculateRetryDelay(retryCount: number, options: LLMConnectionOptions): number;
export declare function delay(ms: number): Promise<void>;
export declare function testConnection(url: string, timeout: number): Promise<boolean>;
export declare function parseModelCapabilities(modelData: any): string[];
export declare function formatErrorDetails(error: Error & {
    code?: string;
    response?: any;
}): string;
export declare function isRetryableError(error: Error & {
    code?: string;
}): boolean;
export declare function formatProviderError(error: unknown, providerName: string): LLMConnectionError;
