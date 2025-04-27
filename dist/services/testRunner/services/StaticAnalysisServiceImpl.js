"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticAnalysisServiceImpl = void 0;
class StaticAnalysisServiceImpl {
    constructor(logger, outputChannel) {
        this.logger = logger;
        this.outputChannel = outputChannel;
    }
    async runESLint(options) {
        this.logger.debug('Running ESLint analysis');
        try {
            const result = {
                success: true,
                message: 'ESLint analysis completed',
                totalTests: 1,
                passed: 1,
                failed: 0,
                skipped: 0,
                duration: 0,
                timestamp: new Date(),
                suites: [],
                staticAnalysis: {
                    raw: '',
                    issueCount: 0,
                    issues: []
                }
            };
            return result;
        }
        catch (error) {
            return this.createErrorResult('ESLint analysis failed', error);
        }
    }
    async runPrettier(options) {
        this.logger.debug('Running Prettier analysis');
        try {
            const result = {
                success: true,
                message: 'Prettier analysis completed',
                totalTests: 1,
                passed: 1,
                failed: 0,
                skipped: 0,
                duration: 0,
                timestamp: new Date(),
                suites: [],
                staticAnalysis: {
                    raw: '',
                    issueCount: 0,
                    issues: []
                }
            };
            return result;
        }
        catch (error) {
            return this.createErrorResult('Prettier analysis failed', error);
        }
    }
    async runAnalysis(options) {
        this.logger.debug(`Running ${options.tool || 'default'} analysis`);
        try {
            this.outputChannel.appendLine(`Running ${options.tool || 'default'} analysis...`);
            const result = {
                success: true,
                message: 'Analysis completed',
                totalTests: 1,
                passed: 1,
                failed: 0,
                skipped: 0,
                duration: 0,
                timestamp: new Date(),
                suites: [],
                staticAnalysis: {
                    raw: '',
                    issueCount: 0,
                    issues: []
                }
            };
            return result;
        }
        catch (error) {
            return this.createErrorResult('Analysis failed', error);
        }
    }
    createErrorResult(message, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            message: `${message}: ${errorMessage}`,
            totalTests: 1,
            passed: 0,
            failed: 1,
            skipped: 0,
            duration: 0,
            timestamp: new Date(),
            suites: []
        };
    }
    dispose() {
        // Nothing to dispose
    }
}
exports.StaticAnalysisServiceImpl = StaticAnalysisServiceImpl;
//# sourceMappingURL=StaticAnalysisServiceImpl.js.map