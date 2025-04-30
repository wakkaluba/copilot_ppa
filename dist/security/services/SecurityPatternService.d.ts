import { SecurityPattern } from '../types';
export declare class SecurityPatternService {
    private patterns;
    constructor();
    getPatterns(): SecurityPattern[];
    addPattern(pattern: SecurityPattern): void;
    private loadDefaultPatterns;
}
