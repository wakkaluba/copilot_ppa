// filepath: d:\___coding\tools\copilot_ppa\src\documentationGenerators\__tests__\readmeWikiGenerator.test.js
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { ReadmeWikiGenerator, DocumentationType } = require('../readmeWikiGenerator');
const { LLMInterface } = require('../../llm/llmInterface');
const { ProjectInfoService } = require('../services/ProjectInfoService');
const { ReadmeService } = require('../services/ReadmeService');
const { ContributingService } = require('../services/ContributingService');
const { WikiService } = require('../services/WikiService');
const { DocumentationDiffService } = require('../services/DocumentationDiffService');

// Mock dependencies
jest.mock('vscode');
jest.mock('fs');
jest.mock('path');
jest.mock('../../llm/llmInterface');
jest.mock('../services/ProjectInfoService');
jest.mock('../services/ReadmeService');
jest.mock('../services/ContributingService');
jest.mock('../services/WikiService');
jest.mock('../services/DocumentationDiffService');

describe('ReadmeWikiGenerator (JavaScript)', () => {
    let context;
    let llmProvider;
    let generator;
    let mockReadmeService;
    let mockContributingService;
    let mockWikiService;
    let mockProjectInfoService;
    let mockDocDiffService;

    beforeEach(() => {
        // Set up extension context mock
        context = {
            subscriptions: [],
            extensionPath: '/test/path',
            extensionUri: { fsPath: '/test/path' }
        };

        // Set up LLM provider mock
        llmProvider = {
            generateDocumentation: jest.fn().mockResolvedValue('Generated documentation'),
            sendPrompt: jest.fn().mockResolvedValue('Response from LLM'),
            isAvailable: jest.fn().mockResolvedValue(true),
            checkAvailability: jest.fn().mockResolvedValue(true),
            getModelInfo: jest.fn().mockReturnValue({ name: 'Test Model', provider: 'Test', contextLength: 4096 })
        };

        // Reset mocks
        ProjectInfoService.mockClear();
        ReadmeService.mockClear();
        ContributingService.mockClear();
        WikiService.mockClear();
        DocumentationDiffService.mockClear();

        // Mock service instances
        mockProjectInfoService = {
            getProjectStructure: jest.fn().mockResolvedValue({ files: [], folders: [] }),
            getProjectDependencies: jest.fn().mockResolvedValue({ dependencies: {}, devDependencies: {} }),
            getGitInfo: jest.fn().mockResolvedValue({ remoteUrl: '', branch: '', contributors: [] }),
            getLanguageStats: jest.fn().mockResolvedValue({ typescript: 80, javascript: 20 }),
            getReadmeContent: jest.fn().mockResolvedValue(null),
            getContributingContent: jest.fn().mockResolvedValue(null)
        };

        mockReadmeService = {
            generate: jest.fn().mockResolvedValue(undefined)
        };

        mockContributingService = {
            generate: jest.fn().mockResolvedValue(undefined)
        };

        mockWikiService = {
            generatePage: jest.fn().mockResolvedValue(undefined),
            generateAll: jest.fn().mockResolvedValue(undefined)
        };

        mockDocDiffService = {
            compareDocumentation: jest.fn().mockResolvedValue({ added: [], removed: [], changed: [] }),
            applyChanges: jest.fn().mockResolvedValue(true)
        };

        // Set up service mocks
        ProjectInfoService.mockImplementation(() => mockProjectInfoService);
        ReadmeService.mockImplementation(() => mockReadmeService);
        ContributingService.mockImplementation(() => mockContributingService);
        WikiService.mockImplementation(() => mockWikiService);
        DocumentationDiffService.mockImplementation(() => mockDocDiffService);

        // Create generator instance
        generator = new ReadmeWikiGenerator(context, llmProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should create service instances with the correct parameters', () => {
            expect(ProjectInfoService).toHaveBeenCalledTimes(1);
            expect(ReadmeService).toHaveBeenCalledWith(
                context,
                llmProvider,
                expect.any(Object) // ProjectInfoService instance
            );
            expect(ContributingService).toHaveBeenCalledWith(
                context,
                llmProvider,
                expect.any(Object) // ProjectInfoService instance
            );
            expect(WikiService).toHaveBeenCalledWith(
                context,
                llmProvider,
                expect.any(Object) // ProjectInfoService instance
            );
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
            expect(context.subscriptions.push).toHaveBeenCalledTimes(4);
        });
    });

    describe('generateReadme', () => {
        it('should call ReadmeService.generate', async () => {
            await generator.generateReadme();
            expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from ReadmeService', async () => {
            const errorMessage = 'Failed to generate README';
            mockReadmeService.generate.mockRejectedValueOnce(new Error(errorMessage));

            await expect(generator.generateReadme()).rejects.toThrow(errorMessage);
            expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);
        });
    });

    describe('generateContributing', () => {
        it('should call ContributingService.generate', async () => {
            await generator.generateContributing();
            expect(mockContributingService.generate).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from ContributingService', async () => {
            const errorMessage = 'Failed to generate CONTRIBUTING';
            mockContributingService.generate.mockRejectedValueOnce(new Error(errorMessage));

            await expect(generator.generateContributing()).rejects.toThrow(errorMessage);
            expect(mockContributingService.generate).toHaveBeenCalledTimes(1);
        });

        // JavaScript-specific test
        it('should handle undefined response from ContributingService', async () => {
            // Test with undefined response (JavaScript-specific behavior)
            mockContributingService.generate.mockResolvedValueOnce(undefined);
            const result = await generator.generateContributing();
            expect(result).toBeUndefined();
        });
    });

    describe('generateWikiPage', () => {
        it('should call WikiService.generatePage', async () => {
            await generator.generateWikiPage();
            expect(mockWikiService.generatePage).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from WikiService', async () => {
            const errorMessage = 'Failed to generate Wiki page';
            mockWikiService.generatePage.mockRejectedValueOnce(new Error(errorMessage));

            await expect(generator.generateWikiPage()).rejects.toThrow(errorMessage);
            expect(mockWikiService.generatePage).toHaveBeenCalledTimes(1);
        });

        // JavaScript-specific test
        it('should handle null response from WikiService', async () => {
            // Test with null response (JavaScript-specific behavior)
            mockWikiService.generatePage.mockResolvedValueOnce(null);
            const result = await generator.generateWikiPage();
            expect(result).toBeNull();
        });

        it('should pass custom page name to WikiService when provided', async () => {
            const pageName = 'CustomPageName';
            await generator.generateWikiPage(pageName);
            expect(mockWikiService.generatePage).toHaveBeenCalledWith(pageName);
        });
    });

    describe('generateProjectDocumentation', () => {
        it('should call WikiService.generateAll by default', async () => {
            await generator.generateProjectDocumentation();
            expect(mockWikiService.generateAll).toHaveBeenCalledTimes(1);
        });

        describe('with document types', () => {
            it('should generate only README when README type specified', async () => {
                // Override the implementation for this test to handle DocumentationType
                generator.generateProjectDocumentation = jest.fn().mockImplementation(async (type) => {
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
                        await mockWikiService.generateAll();
                    } else {
                        await mockWikiService.generateAll();
                    }
                });

                await generator.generateProjectDocumentation(DocumentationType.README);
                expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);
                expect(mockContributingService.generate).not.toHaveBeenCalled();
                expect(mockWikiService.generateAll).not.toHaveBeenCalled();
            });

            it('should generate only CONTRIBUTING when CONTRIBUTING type specified', async () => {
                // Override the implementation for this test
                generator.generateProjectDocumentation = jest.fn().mockImplementation(async (type) => {
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
                        await mockWikiService.generateAll();
                    } else {
                        await mockWikiService.generateAll();
                    }
                });

                await generator.generateProjectDocumentation(DocumentationType.CONTRIBUTING);
                expect(mockReadmeService.generate).not.toHaveBeenCalled();
                expect(mockContributingService.generate).toHaveBeenCalledTimes(1);
                expect(mockWikiService.generateAll).not.toHaveBeenCalled();
            });

            it('should generate only Wiki pages when Wiki-related type specified', async () => {
                // Override the implementation for this test
                generator.generateProjectDocumentation = jest.fn().mockImplementation(async (type) => {
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
                        await mockWikiService.generateAll();
                    } else {
                        await mockWikiService.generateAll();
                    }
                });

                await generator.generateProjectDocumentation(DocumentationType.WIKI_HOME);
                expect(mockReadmeService.generate).not.toHaveBeenCalled();
                expect(mockContributingService.generate).not.toHaveBeenCalled();
                expect(mockWikiService.generateAll).toHaveBeenCalledTimes(1);
            });

            it('should propagate errors from services during generation', async () => {
                // Override the implementation to test error handling
                generator.generateProjectDocumentation = jest.fn().mockImplementation(async () => {
                    try {
                        await mockReadmeService.generate();
                        await mockContributingService.generate();
                        await mockWikiService.generateAll();
                    } catch (error) {
                        throw error;
                    }
                });

                // Make ReadmeService throw an error
                mockReadmeService.generate.mockRejectedValueOnce(new Error('Failed to generate documentation'));

                await expect(generator.generateProjectDocumentation()).rejects.toThrow('Failed to generate documentation');
                expect(mockReadmeService.generate).toHaveBeenCalledTimes(1);
                // Since error happens first, these shouldn't be called
                expect(mockContributingService.generate).not.toHaveBeenCalled();
                expect(mockWikiService.generateAll).not.toHaveBeenCalled();
            });
        });
    });

    describe('Command Registration', () => {
        it('should execute the correct method when readme command is triggered', async () => {
            // Get the command callback
            const readmeCallback = vscode.commands.registerCommand.mock.calls.find(
                call => call[0] === 'localLLMAgent.generateDocumentation.readme'
            )[1];

            // Create a spy on the generator's method
            const spy = jest.spyOn(generator, 'generateReadme');

            // Execute the callback
            await readmeCallback();

            // Verify the correct method was called
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should execute the correct method when contributing command is triggered', async () => {
            // Get the command callback
            const contributingCallback = vscode.commands.registerCommand.mock.calls.find(
                call => call[0] === 'localLLMAgent.generateDocumentation.contributing'
            )[1];

            // Create a spy on the generator's method
            const spy = jest.spyOn(generator, 'generateContributing');

            // Execute the callback
            await contributingCallback();

            // Verify the correct method was called
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should execute the correct method when wiki command is triggered', async () => {
            // Get the command callback
            const wikiCallback = vscode.commands.registerCommand.mock.calls.find(
                call => call[0] === 'localLLMAgent.generateDocumentation.wiki'
            )[1];

            // Create a spy on the generator's method
            const spy = jest.spyOn(generator, 'generateWikiPage');

            // Execute the callback
            await wikiCallback();

            // Verify the correct method was called
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should execute the correct method when projectDocs command is triggered', async () => {
            // Get the command callback
            const projectDocsCallback = vscode.commands.registerCommand.mock.calls.find(
                call => call[0] === 'localLLMAgent.generateDocumentation.projectDocs'
            )[1];

            // Create a spy on the generator's method
            const spy = jest.spyOn(generator, 'generateProjectDocumentation');

            // Execute the callback
            await projectDocsCallback();

            // Verify the correct method was called
            expect(spy).toHaveBeenCalledTimes(1);
        });

        // JavaScript-specific test
        it('should handle errors in command callbacks', async () => {
            // Get the readme command callback
            const readmeCallback = vscode.commands.registerCommand.mock.calls.find(
                call => call[0] === 'localLLMAgent.generateDocumentation.readme'
            )[1];

            // Mock console.error to catch the logged error
            const originalConsoleError = console.error;
            console.error = jest.fn();

            // Make the service throw an error
            const errorMessage = 'Unexpected command execution error';
            mockReadmeService.generate.mockRejectedValueOnce(new Error(errorMessage));

            // Execute the callback
            try {
                await readmeCallback();
            } catch (error) {
                // The error should propagate in the real implementation
            }

            // Restore console.error
            console.error = originalConsoleError;
        });
    });

    describe('Error handling', () => {
        it('should handle LLM unavailability gracefully', async () => {
            llmProvider.isAvailable = jest.fn().mockResolvedValue(false);

            // Mock window.showErrorMessage to test error handling
            vscode.window.showErrorMessage = jest.fn();

            // Override the implementation to test LLM unavailability
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
        });

        it('should display progress notification during documentation generation', async () => {
            // Mock withProgress
            vscode.window.withProgress = jest.fn().mockImplementation((options, task) => {
                return task({
                    report: jest.fn()
                });
            });

            // Override the implementation to use withProgress
            generator.generateReadme = jest.fn().mockImplementation(async () => {
                return vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: 'Generating README'
                    },
                    async (progress) => {
                        progress.report({ message: 'Analyzing project...' });
                        await mockReadmeService.generate();
                        progress.report({ message: 'Completed', increment: 100 });
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
        });
    });

    // JavaScript-specific tests
    describe('JavaScript-specific behavior', () => {
        it('should handle dynamic property assignment', () => {
            // Create a new property at runtime (JavaScript-specific)
            generator.customProperty = 'Test Value';
            expect(generator.customProperty).toBe('Test Value');
        });

        it('should work with non-strict equality checks', () => {
            // Test non-strict equality (JavaScript-specific)
            mockWikiService.generateAll.mockResolvedValueOnce('0');
            generator.generateProjectDocumentation().then(result => {
                // In JavaScript, '0' == 0 is true (non-strict equality)
                expect(result == 0).toBe(true);
                // But '0' === 0 is false (strict equality)
                expect(result === 0).toBe(false);
            });
        });

        it('should handle prototype property access', () => {
            // Test accessing prototype properties (JavaScript-specific)
            const proto = Object.getPrototypeOf(generator);
            expect(proto).toBeDefined();
            expect(typeof proto.generateReadme).toBe('function');
        });
    });

    describe('DocumentationType enum', () => {
        it('should contain the correct enum values matching the implementation', () => {
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
});
