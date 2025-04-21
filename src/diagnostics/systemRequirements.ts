import * as vscode from 'vscode';
import * as os from 'os';
import * as child_process from 'child_process';
import { promisify } from 'util';
import { Logger } from '../utils/logger';
import { SystemRequirementsService } from './services/SystemRequirementsService';

const execAsync = promisify(child_process.exec);

/**
 * System requirements checker for the Copilot PPA extension
 */
export class SystemRequirementsChecker {
    private service: SystemRequirementsService;

    constructor(logger: Logger) {
        this.service = new SystemRequirementsService(logger);
    }

    /**
     * Check if the system meets the minimum requirements for running LLMs
     */
    public async checkSystemRequirements(): Promise<boolean> {
        return this.service.checkSystemRequirements();
    }
}
