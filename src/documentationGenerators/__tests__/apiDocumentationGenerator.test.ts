// filepath: d:\___coding\tools\copilot_ppa\src\documentationGenerators\__tests__\apiDocumentationGenerator.test.ts
import * as vscode from 'vscode';
import { LLMInterface } from '../../llm/llmInterface';
import { ApiDocFormat, ApiDocumentationGenerator } from '../apiDocumentationGenerator';

// Mock dependencies
jest.mock('vscode');
jest.mock('../../llm/llmInterface');

// Mock service classes
class MockSourceFileService {
    constructor(private context: vscode.ExtensionContext) {}

    async pickActiveFile(): Promise<vscode.Uri | null> {
        return vscode.Uri.file('/test/file.ts');
    }

    async chooseFormat(): Promise<ApiDocFormat> {
        return ApiDocFormat.MARKDOWN;
    }

    async readFileContent(uri: vscode.Uri): Promise<string> {
        return 'test code content';
    }

    async collectProjectFiles(): Promise<string[]> {
        return ['/test/file1.ts', '/test/file2.ts'];
    }
}

class MockApiDocPromptBuilder {
    buildFilePrompt(code: string, filePath: string, format: ApiDocFormat): string {
        return `Generate documentation for ${filePath} in ${format} format`;
    }
}

class MockDocumentationWriter {
    constructor(private context: vscode.ExtensionContext) {}

    async writeFileDoc(fileUri: vscode.Uri, doc: string, format: ApiDocFormat): Promise<void> {
        return Promise.resolve();
    }

    async writeProjectDoc(filePath: string, doc: string, format: ApiDocFormat): Promise<void> {
        return Promise.resolve();
    }

    async writeIndex(files: string[], format: ApiDocFormat): Promise<void> {
        return Promise.resolve();
    }
}

class MockOpenApiSpecService {
    constructor(private llmProvider: LLMInterface) {}

    async generateAndSaveSpec(): Promise<void> {
        return Promise.resolve();
    }
}

describe('ApiDocumentationGenerator (TypeScript)', () => {
    let context: vscode.ExtensionContext;
    let llmProvider: LLMInterface;
    let apiDocGenerator: ApiDocumentationGenerator;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create a mock context
        context = {
            subscriptions: [],
            extensionPath: '/test/extension/path',
            extensionUri: vscode.Uri.file('/test/extension/path'),
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn(),
                keys: jest.fn()
            } as any,
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn()
            } as any,
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn()
            } as any,
            extensionMode: vscode.ExtensionMode.Test,
            logUri: vscode.Uri.file('/test/log/path'),
            globalStorageUri: vscode.Uri.file('/test/global/storage'),
            storageUri: vscode.Uri.file('/test/storage'),
            asAbsolutePath: jest.fn().mockImplementation(relativePath => `/test/extension/path/${relativePath}`),
        } as unknown as vscode.ExtensionContext;

        // Mock the llmProvider
        llmProvider = {
            sendPrompt: jest.fn().mockResolvedValue('Generated API documentation'),
            generateDocumentation: jest.fn().mockResolvedValue('Generated documentation'),
            isAvailable: jest.fn().mockResolvedValue(true),
            checkAvailability: jest.fn().mockResolvedValue(true),
            getModelInfo: jest.fn().mockReturnValue({ name: 'Test Model', provider: 'Test Provider', contextLength: 4096 }),
            getHardwareRequirements: jest.fn().mockReturnValue({ minRAM: '8GB', recommendedRAM: '16GB', minCPU: '4 cores', minGPU: 'None' }),
        } as unknown as LLMInterface;

        // Override the imported service classes with mocks
        (global as any).SourceFileService = MockSourceFileService;
        (global as any).ApiDocPromptBuilder = MockApiDocPromptBuilder;
        (global as any).DocumentationWriter = MockDocumentationWriter;
        (global as any).OpenApiSpecService = MockOpenApiSpecService;

        // Create the generator with mocked dependencies
        apiDocGenerator = new ApiDocumentationGenerator(context, llmProvider);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete (global as any).SourceFileService;
        delete (global as any).ApiDocPromptBuilder;
        delete (global as any).DocumentationWriter;
        delete (global as any).OpenApiSpecService;
    });

    describe('Constructor', () => {
        it('should initialize with the correct dependencies', () => {
            expect(apiDocGenerator).toBeDefined();
            expect(apiDocGenerator['fileService']).toBeInstanceOf(MockSourceFileService);
            expect(apiDocGenerator['promptBuilder']).toBeInstanceOf(MockApiDocPromptBuilder);
            expect(apiDocGenerator['writer']).toBeInstanceOf(MockDocumentationWriter);
            expect(apiDocGenerator['openApiService']).toBeInstanceOf(MockOpenApiSpecService);
        });

        it('should register commands', () => {
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLMAgent.generateDocumentation.apiFile',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLMAgent.generateDocumentation.apiProject',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLMAgent.generateDocumentation.openapi',
                expect.any(Function)
            );
            expect(context.subscriptions.push).toHaveBeenCalledTimes(3);
        });
    });

    describe('generateApiDocForFile', () => {
        it('should generate documentation for the current file', async () => {
            // Set up spies
            const pickActiveFileSpy = jest.spyOn(MockSourceFileService.prototype, 'pickActiveFile');
            const chooseFormatSpy = jest.spyOn(MockSourceFileService.prototype, 'chooseFormat');
            const readFileContentSpy = jest.spyOn(MockSourceFileService.prototype, 'readFileContent');
            const buildFilePromptSpy = jest.spyOn(MockApiDocPromptBuilder.prototype, 'buildFilePrompt');
            const sendPromptSpy = jest.spyOn(llmProvider, 'sendPrompt' as keyof LLMInterface);
            const writeFileDocSpy = jest.spyOn(MockDocumentationWriter.prototype, 'writeFileDoc');

            // Execute the method
            await apiDocGenerator.generateApiDocForFile();

            // Verify the method calls in the correct order
            expect(pickActiveFileSpy).toHaveBeenCalled();
            expect(chooseFormatSpy).toHaveBeenCalled();
            expect(readFileContentSpy).toHaveBeenCalledWith(vscode.Uri.file('/test/file.ts'));
            expect(buildFilePromptSpy).toHaveBeenCalledWith(
                'test code content',
                '/test/file.ts',
                ApiDocFormat.MARKDOWN
            );
            expect(sendPromptSpy).toHaveBeenCalled();
            expect(writeFileDocSpy).toHaveBeenCalledWith(
                vscode.Uri.file('/test/file.ts'),
                'Generated API documentation',
                ApiDocFormat.MARKDOWN
            );
        });

        it('should exit early when no file is selected', async () => {
            // Mock the pickActiveFile method to return null
            jest.spyOn(MockSourceFileService.prototype, 'pickActiveFile').mockResolvedValueOnce(null);

            // Set up spies
            const chooseFormatSpy = jest.spyOn(MockSourceFileService.prototype, 'chooseFormat');
            const readFileContentSpy = jest.spyOn(MockSourceFileService.prototype, 'readFileContent');

            // Execute the method
            await apiDocGenerator.generateApiDocForFile();

            // Verify that the method exited early
            expect(chooseFormatSpy).not.toHaveBeenCalled();
            expect(readFileContentSpy).not.toHaveBeenCalled();
        });

        it('should handle errors when generating documentation', async () => {
            // Mock sendPrompt to throw an error
            (llmProvider.sendPrompt as jest.Mock).mockRejectedValueOnce(new Error('LLM error'));

            // Execute the method and expect it to throw
            await expect(apiDocGenerator.generateApiDocForFile()).rejects.toThrow('LLM error');
        });
    });

    describe('generateApiDocForProject', () => {
        it('should generate documentation for all project files', async () => {
            // Set up spies
            const chooseFormatSpy = jest.spyOn(MockSourceFileService.prototype, 'chooseFormat');
            const collectProjectFilesSpy = jest.spyOn(MockSourceFileService.prototype, 'collectProjectFiles');
            const readFileContentSpy = jest.spyOn(MockSourceFileService.prototype, 'readFileContent');
            const buildFilePromptSpy = jest.spyOn(MockApiDocPromptBuilder.prototype, 'buildFilePrompt');
            const sendPromptSpy = jest.spyOn(llmProvider, 'sendPrompt' as keyof LLMInterface);
            const writeProjectDocSpy = jest.spyOn(MockDocumentationWriter.prototype, 'writeProjectDoc');
            const writeIndexSpy = jest.spyOn(MockDocumentationWriter.prototype, 'writeIndex');

            // Execute the method
            await apiDocGenerator.generateApiDocForProject();

            // Verify the method calls
            expect(chooseFormatSpy).toHaveBeenCalled();
            expect(collectProjectFilesSpy).toHaveBeenCalled();
            expect(readFileContentSpy).toHaveBeenCalledTimes(2); // Once for each file
            expect(buildFilePromptSpy).toHaveBeenCalledTimes(2);
            expect(sendPromptSpy).toHaveBeenCalledTimes(2);
            expect(writeProjectDocSpy).toHaveBeenCalledTimes(2);
            expect(writeIndexSpy).toHaveBeenCalledWith(['/test/file1.ts', '/test/file2.ts'], ApiDocFormat.MARKDOWN);
        });

        it('should handle empty project files array', async () => {
            // Mock the collectProjectFiles method to return an empty array
            jest.spyOn(MockSourceFileService.prototype, 'collectProjectFiles').mockResolvedValueOnce([]);

            // Set up spies
            const readFileContentSpy = jest.spyOn(MockSourceFileService.prototype, 'readFileContent');
            const writeIndexSpy = jest.spyOn(MockDocumentationWriter.prototype, 'writeIndex');

            // Execute the method
            await apiDocGenerator.generateApiDocForProject();

            // Verify that no file processing occurred
            expect(readFileContentSpy).not.toHaveBeenCalled();
            expect(writeIndexSpy).toHaveBeenCalledWith([], ApiDocFormat.MARKDOWN);
        });

        it('should handle errors in file processing', async () => {
            // Mock readFileContent to throw an error for the second file
            jest.spyOn(MockSourceFileService.prototype, 'readFileContent')
                .mockImplementation((uri: vscode.Uri) => {
                    if (uri.fsPath === '/test/file2.ts') {
                        return Promise.reject(new Error('File read error'));
                    }
                    return Promise.resolve('test code content');
                });

            // Execute the method and expect it to throw
            await expect(apiDocGenerator.generateApiDocForProject()).rejects.toThrow('File read error');
        });
    });

    describe('generateOpenApiSpec', () => {
        it('should generate OpenAPI specification', async () => {
            // Set up spy
            const generateAndSaveSpecSpy = jest.spyOn(MockOpenApiSpecService.prototype, 'generateAndSaveSpec');

            // Execute the method
            await apiDocGenerator.generateOpenApiSpec();

            // Verify the method call
            expect(generateAndSaveSpecSpy).toHaveBeenCalled();
        });

        it('should handle errors when generating OpenAPI spec', async () => {
            // Mock generateAndSaveSpec to throw an error
            jest.spyOn(MockOpenApiSpecService.prototype, 'generateAndSaveSpec')
                .mockRejectedValueOnce(new Error('OpenAPI generation error'));

            // Execute the method and expect it to throw
            await expect(apiDocGenerator.generateOpenApiSpec()).rejects.toThrow('OpenAPI generation error');
        });
    });
});
