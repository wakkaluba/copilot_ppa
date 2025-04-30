import { ILogger } from '../../../logging/ILogger';
export declare class TypeScriptMetricsCalculator {
    private readonly logger;
    constructor(logger: ILogger);
    calculateMetrics(content: string): Record<string, number>;
    private countPattern;
    private calculateCommentRatio;
    private calculateAverageMethodLength;
}
