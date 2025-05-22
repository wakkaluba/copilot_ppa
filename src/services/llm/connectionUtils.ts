/**
 * Utilities for LLM connection management
 */
import { LLMConnectionOptions } from '../../types/llm';
import { LLMConnectionError } from './errors';
import { ConnectionErrorCode } from './interfaces';
import { RetryService } from './services/RetryService';
import { ModelCapabilityService } from './services/ModelCapabilityService';
import { ConnectionErrorService } from './services/ConnectionErrorService';

const retryService = new RetryService();
const modelCapabilityService = new ModelCapabilityService();
const errorService = new ConnectionErrorService();

export function calculateRetryDelay(retryCount: number, options: LLMConnectionOptions): number {
    return retryService.calculateDelay(retryCount, options);
}

export function delay(ms: number): Promise<void> {
    return retryService.delay(ms);
}

export async function testConnection(url: string, timeout: number): Promise<boolean> {
    return retryService.testConnection(url, timeout);
}

export function parseModelCapabilities(modelData: any): string[] {
    return modelCapabilityService.parseCapabilities(modelData);
}

export function formatErrorDetails(error: Error & { code?: string, response?: any }): string {
    return errorService.formatDetails(error);
}

export function isRetryableError(error: Error & { code?: string }): boolean {
    return errorService.isRetryable(error);
}

export function formatProviderError(error: unknown, providerName: string): LLMConnectionError {
    return errorService.formatProviderError(error, providerName);
}