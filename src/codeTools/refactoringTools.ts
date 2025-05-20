import { EventEmitter } from '../common/eventEmitter';
import { CodeDiffService } from './services/CodeDiffService';
import { CodeSimplificationService } from './services/CodeSimplificationService';
import { LLMRefactoringService } from './services/LLMRefactoringService';
import { RefactoringOutputService } from './services/RefactoringOutputService';
import { UnusedCodeAnalyzerService } from './services/UnusedCodeAnalyzerService';

/**
 * Provides refactoring tools for code improvements
 */
export class RefactoringTools extends EventEmitter {
    private simplificationService: CodeSimplificationService;
    private unusedCodeAnalyzer: UnusedCodeAnalyzerService;
    private diffService: CodeDiffService;
    private outputService: RefactoringOutputService;
    private llmService: LLMRefactoringService;

    constructor() {
        super();
        this.simplificationService = new CodeSimplificationService();
        this.unusedCodeAnalyzer = new UnusedCodeAnalyzerService();
        this.diffService = new CodeDiffService();
        this.outputService = new RefactoringOutputService();
        this.llmService = new LLMRefactoringService();
    }

    /**
     * Initialize the refactoring tools
     */
    public async initialize(): Promise<void> {
        await Promise.all([
            this.simplificationService.initialize(),
            this.unusedCodeAnalyzer.initialize(),
            this.llmService.initialize()
        ]);
    }

    // ...existing code...
}
