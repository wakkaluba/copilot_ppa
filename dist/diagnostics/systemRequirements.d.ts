import { Logger } from '../utils/logger';
/**
 * System requirements checker for the Copilot PPA extension
 */
export declare class SystemRequirementsChecker {
    private service;
    constructor(logger: Logger);
    /**
     * Check if the system meets the minimum requirements for running LLMs
     */
    checkSystemRequirements(): Promise<boolean>;
}
