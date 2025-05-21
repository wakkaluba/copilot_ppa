/**
 * Service responsible for handling JSDoc/TSDoc generation and integration
 */
export class JSDocTSDocIntegration {
  private readonly llmProvider: any;
  private readonly supportedLanguages: string[] = ['javascript', 'typescript'];
  private readonly outputChannel: any;
  private generateSymbolDocumentation: any;
  private visitNode: any;
  private shouldDocumentNode: any;
  private isExportedVariable: any;
  private getExistingDocumentation: any;
  private extractSymbolInfo: any;
  private getNodeName: any;
}
