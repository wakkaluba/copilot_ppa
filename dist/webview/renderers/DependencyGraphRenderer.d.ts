import { DependencyNode } from '../../services/dependencyGraph/types';
export declare class DependencyGraphRenderer {
    render(dependencies: DependencyNode[]): string;
    private getStyles;
    private getScript;
}
