import { Theme, UILayoutOptions } from './interfaces';
/**
 * Generates CSS variables and styles from themes and layout options
 */
export declare class CSSGenerator {
    /**
     * Generate CSS variables for a theme
     */
    static generateThemeCSS(theme: Theme): string;
    /**
     * Generate CSS based on UI layout options
     */
    static generateLayoutCSS(options: UILayoutOptions): string;
}
