import { TypeScriptAnalyzer } from './TypeScriptAnalyzer';
import { ILanguageAnalyzer } from '../types/ILanguageAnalyzer';

export class JavaScriptAnalyzer extends TypeScriptAnalyzer implements ILanguageAnalyzer {
    // Inherits TypeScript analysis functionality since TypeScript is a superset of JavaScript
    // Can be extended with JavaScript-specific analysis in the future
}