/**
 * Options for JSDoc/TSDoc generation
 */
export interface JSDocTSDocGenerationOptions {
  /** Whether to overwrite existing documentation */
  overwrite?: boolean;
  /** Documentation style to use */
  style?: 'jsdoc' | 'tsdoc';
}

/** JSDoc node types */
export type JSDocNodeType =
  | 'class'
  | 'interface'
  | 'function'
  | 'method'
  | 'property'
  | 'enum'
  | 'type'
  | 'variable'
  | 'other';

/** TSDoc node types (same as JSDoc for now) */
export type TSDocNodeType = JSDocNodeType;
