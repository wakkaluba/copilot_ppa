import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMRequest } from '../types';

export interface ISecurityCredentials {
    apiKey?: string;
    accessToken?: string;
    certificate?: {
        cert: string;
        key: string;
    };
    customHeaders?: Record<string, string>;
}

export interface ISecurityPolicy {
    allowedModels: string[];
    allowedProviders: string[];
    maxTokensPerRequest: number;
    rateLimits: {
        requestsPerMinute: number;
        tokensPerMinute: number;
    };
    ipRestrictions?: string[];
}

export interface IRequestValidation {
    isValid: boolean;
    reason?: string;
    policyViolations?: string[];
}

export interface ISecurityAudit {
    timestamp: number;
    requestId: string;
    action: string;
    success: boolean;
    details?: Record<string, unknown>;
}

@injectable()
export class LLMSecurityManager extends EventEmitter {
    private readonly credentials = new Map<string, ISecurityCredentials>();
    private readonly policies = new Map<string, ISecurityPolicy>();
    private readonly auditLog: ISecurityAudit[] = [];

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public async setCredentials(
        providerId: string,
        credentials: ISecurityCredentials
    ): Promise<void> {
        try {
            // Validate and encrypt sensitive data before storing
            const encrypted = await this.encryptCredentials(credentials);
            this.credentials.set(providerId, encrypted);

            this.emit('credentialsUpdated', { providerId });
            this.logAudit({
                timestamp: Date.now(),
                requestId: 'system',
                action: 'credentials_updated',
                success: true,
                details: { providerId }
            });
        } catch (error) {
            this.handleError('Failed to set credentials', error as Error);
            throw error;
        }
    }

    public async getCredentials(providerId: string): Promise<ISecurityCredentials> {
        const credentials = this.credentials.get(providerId);
        if (!credentials) {
            throw new Error(`No credentials found for provider ${providerId}`);
        }
        return await this.decryptCredentials(credentials);
    }

    public setSecurityPolicy(providerId: string, policy: ISecurityPolicy): void {
        try {
            this.validatePolicy(policy);
            this.policies.set(providerId, { ...policy });

            this.emit('policyUpdated', { providerId, policy });
            this.logAudit({
                timestamp: Date.now(),
                requestId: 'system',
                action: 'policy_updated',
                success: true,
                details: { providerId }
            });
        } catch (error) {
            this.handleError('Failed to set security policy', error as Error);
            throw error;
        }
    }

    public async validateRequest(
        providerId: string,
        request: ILLMRequest
    ): Promise<IRequestValidation> {
        try {
            const policy = this.policies.get(providerId);
            if (!policy) {
                return { isValid: false, reason: 'No security policy found' };
            }

            const violations: string[] = [];

            // Check model allowlist
            if (!policy.allowedModels.includes(request.model)) {
                violations.push(`Model ${request.model} not allowed`);
            }

            // Check token limits
            if (request.options?.maxTokens && request.options.maxTokens > policy.maxTokensPerRequest) {
                violations.push(`Token limit exceeded: ${request.options.maxTokens} > ${policy.maxTokensPerRequest}`);
            }

            // Check rate limits
            if (!await this.checkRateLimits(providerId, policy.rateLimits)) {
                violations.push('Rate limit exceeded');
            }

            const isValid = violations.length === 0;
            this.logAudit({
                timestamp: Date.now(),
                requestId: request.id,
                action: 'request_validation',
                success: isValid,
                details: { violations }
            });

            return {
                isValid,
                policyViolations: violations,
                reason: violations.join(', ')
            };
        } catch (error) {
            this.handleError('Failed to validate request', error as Error);
            throw error;
        }
    }

    private validatePolicy(policy: ISecurityPolicy): void {
        if (!Array.isArray(policy.allowedModels)) {
            throw new Error('allowedModels must be an array');
        }

        if (!Array.isArray(policy.allowedProviders)) {
            throw new Error('allowedProviders must be an array');
        }

        if (policy.maxTokensPerRequest <= 0) {
            throw new Error('maxTokensPerRequest must be positive');
        }

        if (policy.rateLimits.requestsPerMinute <= 0) {
            throw new Error('requestsPerMinute must be positive');
        }

        if (policy.rateLimits.tokensPerMinute <= 0) {
            throw new Error('tokensPerMinute must be positive');
        }
    }

    private async encryptCredentials(
        credentials: ISecurityCredentials
    ): Promise<ISecurityCredentials> {
        // This would implement actual encryption
        return { ...credentials };
    }

    private async decryptCredentials(
        credentials: ISecurityCredentials
    ): Promise<ISecurityCredentials> {
        // This would implement actual decryption
        return { ...credentials };
    }

    private async checkRateLimits(
        providerId: string,
        limits: ISecurityPolicy['rateLimits']
    ): Promise<boolean> {
        // This would implement actual rate limiting
        return true;
    }

    public getAuditLog(): ISecurityAudit[] {
        return [...this.auditLog];
    }

    private logAudit(entry: ISecurityAudit): void {
        this.auditLog.push(entry);
        this.emit('auditLogUpdated', entry);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[LLMSecurityManager]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.credentials.clear();
        this.policies.clear();
        this.auditLog.length = 0;
        this.removeAllListeners();
    }
}
