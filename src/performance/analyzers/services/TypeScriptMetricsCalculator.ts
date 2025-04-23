import { injectable } from 'inversify';
import { ILogger } from '../../../logging/ILogger';

@injectable()
export class TypeScriptMetricsCalculator {
    constructor(@inject(ILogger) private readonly logger: ILogger) {}

    public calculateMetrics(content: string): Record<string, number> {
        try {
            const lines = content.split('\n');
            return {
                classCount: this.countPattern(content, /\bclass\s+\w+/g),
                methodCount: this.countPattern(content, /\b(public|private|protected|async)?\s*\w+\s*\([^)]*\)\s*{/g),
                importCount: this.countPattern(content, /^import\s+/gm),
                commentRatio: this.calculateCommentRatio(content, lines),
                averageMethodLength: this.calculateAverageMethodLength(content),
                asyncMethodCount: this.countPattern(content, /\basync\s+/g),
                promiseUsage: this.countPattern(content, /Promise\./g),
                arrowFunctionCount: this.countPattern(content, /=>/g),
                typeAnnotationCount: this.countPattern(content, /:\s*[A-Z]\w+/g),
                eventListenerCount: this.countPattern(content, /addEventListener\(/g),
                domManipulationCount: this.countPattern(content, /document\.|getElementById|querySelector/g)
            };
        } catch (error) {
            this.logger.error('Error calculating TypeScript metrics:', error);
            return {};
        }
    }

    private countPattern(content: string, regex: RegExp): number {
        return (content.match(regex) || []).length;
    }

    private calculateCommentRatio(content: string, lines: string[]): number {
        const commentCount = (content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
        return Math.round((commentCount / lines.length) * 100);
    }

    private calculateAverageMethodLength(content: string): number {
        // ... existing implementation ...
    }
}
