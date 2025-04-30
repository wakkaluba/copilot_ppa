import { ICodeLinker } from '../types';
export declare class CodeLinkerService implements ICodeLinker {
    /**
     * Create links between related code elements
     */
    createCodeLink(): Promise<void>;
    /**
     * Navigate to linked code
     */
    navigateCodeLink(): Promise<void>;
    private getSelectionOrWordAtCursor;
    private findLinkAtPosition;
    private navigateToTarget;
    private createStatusBarItem;
    private createHighlightDecoration;
    private saveCodeLink;
}
