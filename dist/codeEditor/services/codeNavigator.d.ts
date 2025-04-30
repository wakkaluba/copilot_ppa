import { ICodeNavigator } from '../types';
export declare class CodeNavigatorService implements ICodeNavigator {
    private webviewProvider;
    constructor();
    /**
     * Shows a code overview/outline for the current file
     */
    showCodeOverview(): Promise<void>;
    /**
     * Find references to the symbol at the current position
     */
    findReferences(): Promise<void>;
}
