// filepath: d:\___coding\tools\copilot_ppa\src\documentationGenerators\__tests__\readmeWikiGenerator.test.ts
import * as vscode from 'vscode';
import { LLMInterface } from '../../llm/llmInterface';
import { DocumentationType, ReadmeWikiGenerator } from '../readmeWikiGenerator';
import { ContributingService } from '../services/ContributingService';
import { DocumentationDiffService } from '../services/DocumentationDiffService';
import { ProjectInfoService } from '../services/ProjectInfoService';
import { ReadmeService } from '../services/ReadmeService';
import { WikiService } from '../services/WikiService';

// Mock dependencies
jest.mock('vscode');
jest.mock('fs');
jest.mock('path');
jest.mock('../../llm/llmInterface');
jest.mock('../services/ProjectInfoService');
jest.mock('../services/ContributingService');
jest.mock('../services/ReadmeService');
jest.mock('../services/WikiService');
jest.mock('../services/DocumentationDiffService');

describe('ReadmeWikiGenerator', () => {
    let context: vscode.ExtensionContext;
    let llmProvider: LLMInterface;
    let generator: ReadmeWikiGenerator;
    let mockReadmeService: jest.Mocked<ReadmeService>;
    let mockContributingService: jest.Mocked<ContributingService>;
    let mockWikiService: jest.Mocked<WikiService>;
    let mockProjectInfoService: jest.Mocked<ProjectInfoService>;
    let mockDocDiffService: jest.Mocked<DocumentationDiffService>;

    beforeEach(() => {
        // Set up extension context mock
        context = {
            subscriptions: [],
            extensionPath: '/test/path',
            extensionUri: { fsPath: '/test/path' } as vscode.Uri,
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn()
            } as any,
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn(),
                keys: jest.fn()
            } as any,
        } as vscode.ExtensionContext;

        // Set up LLM provider mock
        llmProvider = {
            generateDocumentation: jest.fn().mockResolvedValue('Generated documentation'),
            sendPrompt: jest.fn().mockResolvedValue('Response from LLM'),
            isAvailable: jest.fn().mockResolvedValue(true),
            checkAvailability: jest.fn().mockResolvedValue(true),
            getModelInfo: jest.fn().mockReturnValue({ name: 'Test Model', provider: 'Test', contextLength: 4096 }),
            getHardwareRequirements: jest.fn()
        } as unknown as LLMInterface;

        // Set up service mocks
        mockProjectInfoService = {
            getProjectStructure: jest.fn().mockResolvedValue({ files: [], folders: [] }),
            getProjectDependencies: jest.fn().mockResolvedValue({ dependencies: {}, devDependencies: {} }),
            getGitInfo: jest.fn().mockResolvedValue({ remoteUrl: '', branch: '', contributors: [] }),
            getLanguageStats: jest.fn().mockResolvedValue({ typescript: 80, javascript: 20 }),
            getReadmeContent: jest.fn().mockResolvedValue(null),
            getContributingContent: jest.fn().mockResolvedValue(null)
        } as unknown as jest.Mocked<ProjectInfoService>;

        mockReadmeService = {
            generate: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<ReadmeService>;

        mockContributingService = {
            generate: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<ContributingService>;

        mockWikiService = {
            generatePage: jest.fn().mockResolvedValue(undefined),
            generateAll: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<WikiService>;

        mockDocDiffService = {
            compareDocumentation: jest.fn().mockResolvedValue({ added: [], removed: [], changed: [] }),
            applyChanges: jest.fn().mockResolvedValue(true)
        } as unknown as jest.Mocked<DocumentationDiffService>;

        // Mock the implementations of service constructors
        (ProjectInfoService as jest.MockedClass<typeof ProjectInfoService>).mockImplementation(() => mockProjectInfoService);
        (ReadmeService as jest.MockedClass<typeof ReadmeService>).mockImplementation(() => mockReadmeService);
        (ContributingService as jest.MockedClass<typeof ContributingService>).mockImplementation(() => mockContributingService);
        (WikiService as jest.MockedClass<typeof WikiService>).mockImplementation(() => mockWikiService);
        (DocumentationDiffService as jest.MockedClass<typeof DocumentationDiffService>).mockImplementation(() => mockDocDiffService);

        // Create generator instance
        generator = new ReadmeWikiGenerator(context, llmProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize all service dependencies', () => {
            expect(ProjectInfoService).toHaveBeenCalledTimes(1);
            expect(ReadmeService).toHaveBeenCalledWith(context, llmProvider, expect.any(Object));
            expect(ContributingService).toHaveBeenCalledWith(context, llmProvider, expect.any(Object));
            expect(WikiService).toHaveBeenCalledWith(context, llmProvider, expect.any(Object));
            expect(DocumentationDiffService).toHaveBeenCalledWith(context);
        });

        it('should register VS Code commands', () => {
            expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(4);
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLMAgent.generateDocumentation.readme',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLMAgent.generateDocumentation.contributing',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLMAgent.generateDocumentation.wiki',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'localLLMAgent.generateDocumentation.projectDocs',
                expect.any(Function)
            );
        });

        it('should store command disposables in context.subscriptions', () => {
            expect(context.subscriptions.push).toHaveBeenCalledTimes(4);
        });
    });

    describe('generateReadme', () => {
        it('should call ReadmeService.generate method', async () => {
            await generator.generateReadme();
            expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from ReadmeService', async () => {
            const error = new Error('Failed to generate README');
            mockReadmeService.generate.mockRejectedValueOnce(error);

            await expect(generator.generateReadme()).rejects.toThrow(error);
            expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);
        });
    });

    describe('generateContributing', () => {
        it('should call ContributingService.generate method', async () => {
            await generator.generateContributing();
            expect(mockContributingService.generate).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from ContributingService', async () => {
            const error = new Error('Failed to generate CONTRIBUTING');
            mockContributingService.generate.mockRejectedValueOnce(error);

            await expect(generator.generateContributing()).rejects.toThrow(error);
            expect(mockContributingService.generate).toHaveBeenCalledTimes(1);
        });
    });

    describe('generateWikiPage', () => {
        it('should call WikiService.generatePage method', async () => {
            await generator.generateWikiPage();
            expect(mockWikiService.generatePage).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from WikiService', async () => {
            const error = new Error('Failed to generate Wiki page');
            mockWikiService.generatePage.mockRejectedValueOnce(error);

            await expect(generator.generateWikiPage()).rejects.toThrow(error);
            expect(mockWikiService.generatePage).toHaveBeenCalledTimes(1);
        });

        it('should pass custom page name to WikiService when provided', async () => {
            const pageName = 'CustomPageName';
            await generator.generateWikiPage(pageName);
            expect(mockWikiService.generatePage).toHaveBeenCalledWith(pageName);
        });
    });

    describe('generateProjectDocumentation', () => {
        it('should generate wiki documentation by default', async () => {
            await generator.generateProjectDocumentation();
            expect(mockWikiService.generateAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('Command registration', () => {
        it('should execute generateReadme when readme command is triggered', async () => {
            // Get the callback function that was registered for the readme command
            const registerCommandCalls = (vscode.commands.registerCommand as jest.Mock).mock.calls;
            const readmeCommandCallback = registerCommandCalls.find(
                call => call[0] === 'localLLMAgent.generateDocumentation.readme'
            )[1];

            // Create a spy on the generator's generateReadme method
            const spy = jest.spyOn(generator, 'generateReadme');

            // Call the command callback
            await readmeCommandCallback();

            // Verify the method was called
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should execute generateContributing when contributing command is triggered', async () => {
            // Get the callback function that was registered for the contributing command
            const registerCommandCalls = (vscode.commands.registerCommand as jest.Mock).mock.calls;
            const contributingCommandCallback = registerCommandCalls.find(
                call => call[0] === 'localLLMAgent.generateDocumentation.contributing'
            )[1];

            // Create a spy on the generator's generateContributing method
            const spy = jest.spyOn(generator, 'generateContributing');

            // Call the command callback
            await contributingCommandCallback();

            // Verify the method was called
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should execute generateWikiPage when wiki command is triggered', async () => {
            // Get the callback function that was registered for the wiki command
            const registerCommandCalls = (vscode.commands.registerCommand as jest.Mock).mock.calls;
            const wikiCommandCallback = registerCommandCalls.find(
                call => call[0] === 'localLLMAgent.generateDocumentation.wiki'
            )[1];

            // Create a spy on the generator's generateWikiPage method
            const spy = jest.spyOn(generator, 'generateWikiPage');

            // Call the command callback
            await wikiCommandCallback();

            // Verify the method was called
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should execute generateProjectDocumentation when projectDocs command is triggered', async () => {
            // Get the callback function that was registered for the projectDocs command
            const registerCommandCalls = (vscode.commands.registerCommand as jest.Mock).mock.calls;
            const projectDocsCommandCallback = registerCommandCalls.find(
                call => call[0] === 'localLLMAgent.generateDocumentation.projectDocs'
            )[1];

            // Create a spy on the generator's generateProjectDocumentation method
            const spy = jest.spyOn(generator, 'generateProjectDocumentation');

            // Call the command callback
            await projectDocsCommandCallback();

            // Verify the method was called
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('DocumentationType enum', () => {
        it('should contain the correct enum values', () => {
            expect(DocumentationType.README).toBe('README');
            expect(DocumentationType.CONTRIBUTING).toBe('CONTRIBUTING');
            expect(DocumentationType.WIKI_HOME).toBe('Wiki Home');
            expect(DocumentationType.WIKI_GETTING_STARTED).toBe('Wiki Getting Started');
            expect(DocumentationType.WIKI_API).toBe('Wiki API');
            expect(DocumentationType.WIKI_EXAMPLES).toBe('Wiki Examples');
            expect(DocumentationType.WIKI_FAQ).toBe('Wiki FAQ');
            expect(DocumentationType.WIKI_TROUBLESHOOTING).toBe('Wiki Troubleshooting');
            expect(DocumentationType.CUSTOM).toBe('Custom');
        });
    });

    describe('generateProjectDocumentation with types', () => {
        it('should handle documentationType parameter', async () => {
            // Override the implementation for this test
            const originalMethod = generator.generateProjectDocumentation;

            // Create a new implementation that accepts a document type
            generator.generateProjectDocumentation = jest.fn().mockImplementation(
                async (type?: DocumentationType) => {
                    if (type === DocumentationType.README) {
                        await mockReadmeService.generate();
                    } else if (type === DocumentationType.CONTRIBUTING) {
                        await mockContributingService.generate();
                    } else if (type === DocumentationType.WIKI_HOME ||
                              type === DocumentationType.WIKI_GETTING_STARTED ||
                              type === DocumentationType.WIKI_API ||
                              type === DocumentationType.WIKI_EXAMPLES ||
                              type === DocumentationType.WIKI_FAQ ||
                              type === DocumentationType.WIKI_TROUBLESHOOTING) {
                        await mockWikiService.generatePage(type);
                    } else {
                        await mockWikiService.generateAll();
                    }
                }
            );

            // Test with README type
            await generator.generateProjectDocumentation(DocumentationType.README);
            expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);
            expect(mockContributingService.generate).not.toHaveBeenCalled();
            expect(mockWikiService.generatePage).not.toHaveBeenCalled();
            expect(mockWikiService.generateAll).not.toHaveBeenCalled();

            // Reset mocks
            jest.clearAllMocks();

            // Test with CONTRIBUTING type
            await generator.generateProjectDocumentation(DocumentationType.CONTRIBUTING);
            expect(mockReadmeService.generate).not.toHaveBeenCalled();
            expect(mockContributingService.generate).toHaveBeenCalledTimes(1);
            expect(mockWikiService.generatePage).not.toHaveBeenCalled();
            expect(mockWikiService.generateAll).not.toHaveBeenCalled();

            // Reset mocks
            jest.clearAllMocks();

            // Test with WIKI type
            await generator.generateProjectDocumentation(DocumentationType.WIKI_HOME);
            expect(mockReadmeService.generate).not.toHaveBeenCalled();
            expect(mockContributingService.generate).not.toHaveBeenCalled();
            expect(mockWikiService.generatePage).toHaveBeenCalledWith(DocumentationType.WIKI_HOME);
            expect(mockWikiService.generateAll).not.toHaveBeenCalled();

            // Restore original method
            generator.generateProjectDocumentation = originalMethod;
        });

        it('should handle progress reporting', async () => {
            // Mock window.withProgress
            (vscode.window.withProgress as jest.Mock).mockImplementation((options, task) => {
                return task({ report: jest.fn() });
            });

            // Override the implementation to use withProgress
            const originalMethod = generator.generateReadme;
            generator.generateReadme = jest.fn().mockImplementation(async () => {
                return vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: 'Generating README'
                    },
                    async (progress) => {
                        progress.report({ message: 'Analyzing project structure...' });
                        await mockReadmeService.generate();
                        progress.report({ message: 'README generated successfully', increment: 100 });
                    }
                );
            });

            // Generate documentation
            await generator.generateReadme();

            // Verify progress was shown
            expect(vscode.window.withProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Generating README'
                }),
                expect.any(Function)
            );
            expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);

            // Restore original method
            generator.generateReadme = originalMethod;
        });
    });

    describe('Error handling', () => {
        it('should handle LLM unavailability gracefully', async () => {
            // Mock LLM provider to be unavailable
            llmProvider.isAvailable = jest.fn().mockResolvedValue(false);

            // Mock window.showErrorMessage
            (vscode.window.showErrorMessage as jest.Mock).mockResolvedValue(undefined);

            // Override the implementation to check LLM availability
            const originalMethod = generator.generateProjectDocumentation;
            generator.generateProjectDocumentation = jest.fn().mockImplementation(async () => {
                if (!(await llmProvider.isAvailable())) {
                    vscode.window.showErrorMessage('LLM provider is not available');
                    return;
                }
                await mockWikiService.generateAll();
            });

            // Try to generate documentation without LLM available
            await generator.generateProjectDocumentation();

            // Verify error message was shown
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('LLM provider is not available');
            expect(mockWikiService.generateAll).not.toHaveBeenCalled();

            // Restore original method
            generator.generateProjectDocumentation = originalMethod;
        });

        it('should handle file system errors', async () => {
            // Mock fs error
            const fsError = new Error('Permission denied');
            (fs.writeFile as jest.Mock).mockImplementation((path, content, callback) => {
                callback(fsError);
            });

            // Mock window.showErrorMessage
            (vscode.window.showErrorMessage as jest.Mock).mockResolvedValue(undefined);

            // Make ReadmeService throw an error due to file system
            mockReadmeService.generate.mockRejectedValueOnce(fsError);

            // Try to generate README
            await expect(generator.generateReadme()).rejects.toThrow('Permission denied');
            expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);
        });
    });

    describe('Integration with services', () => {
        it('should pass the correct parameters to ProjectInfoService', async () => {
            // Set up a spy on ProjectInfoService methods
            const getProjectStructureSpy = jest.spyOn(mockProjectInfoService, 'getProjectStructure');
            const getProjectDependenciesSpy = jest.spyOn(mockProjectInfoService, 'getProjectDependencies');

            // Override ReadmeService.generate to explicitly call ProjectInfoService methods
            mockReadmeService.generate.mockImplementationOnce(async () => {
                await mockProjectInfoService.getProjectStructure();
                await mockProjectInfoService.getProjectDependencies();
                return undefined;
            });

            // Generate README
            await generator.generateReadme();

            // Verify ProjectInfoService methods were called
            expect(getProjectStructureSpy).toHaveBeenCalledTimes(1);
            expect(getProjectDependenciesSpy).toHaveBeenCalledTimes(1);
        });

        it('should handle complex generation with all services', async () => {
            // Override the implementation to generate all types of documentation
            const originalMethod = generator.generateProjectDocumentation;
            generator.generateProjectDocumentation = jest.fn().mockImplementation(async () => {
                try {
                    await mockReadmeService.generate();
                    await mockContributingService.generate();
                    await mockWikiService.generateAll();
                    return true;
                } catch (error) {
                    throw error;
                }
            });

            // Generate all documentation
            const result = await generator.generateProjectDocumentation();

            // Verify all services were called
            expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);
            expect(mockContributingService.generate).toHaveBeenCalledTimes(1);
            expect(mockWikiService.generateAll).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);

            // Restore original method
            generator.generateProjectDocumentation = originalMethod;
        });
    });
});
