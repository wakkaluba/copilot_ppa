import { ICodeExecutor } from '../types';
export declare class CodeExecutorService implements ICodeExecutor {
    /**
     * Executes selected code in the active editor
     */
    executeSelectedCode(): Promise<void>;
    /**
     * Executes code in the appropriate terminal based on language
     */
    private executeInTerminal;
    /**
     * Creates a temporary file with the given code
     */
    private createTempFile;
}
