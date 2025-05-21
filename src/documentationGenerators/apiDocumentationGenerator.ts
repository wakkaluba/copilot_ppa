/**
 * Format options for API documentation
 */
export enum ApiDocFormat {
  MARKDOWN = "markdown",
  HTML = "html",
  JSON = "json",
}

/**
 * API Documentation Generator class
 * Generates API documentation from source code
 */
export class ApiDocumentationGenerator {
  private context: any;
  private llmProvider: any;
  private fileService: any;
  private promptBuilder: any;
  private writer: any;
  private openApiService: any;
  private registerCommands: any;
}
