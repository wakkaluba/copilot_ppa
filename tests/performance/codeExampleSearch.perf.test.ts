import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import * as fs from 'fs';
import axios from 'axios';
import { CodeExampleSearch } from '../../src/codeExampleSearch';

/**
 * Performance test suite for the CodeExampleSearch class
 */
describe('CodeExampleSearch Performance Tests', () => {
  let sandbox: sinon.SinonSandbox;
  let mockContext: vscode.ExtensionContext;
  let codeExampleSearch: CodeExampleSearch;
  
  // Performance thresholds - adjust as needed
  const CACHE_RETRIEVAL_THRESHOLD_MS = 50;
  const SEARCH_THRESHOLD_MS = 1000;  // Searching will be mocked, but processing should be efficient
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Mock extension context
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: () => {},
        update: () => Promise.resolve(),
        keys: () => []
      },
      globalState: {
        get: () => {},
        update: () => Promise.resolve(),
        keys: () => [],
        setKeysForSync: () => {}
      },
      extensionPath: '/fake/extension/path',
      extensionUri: vscode.Uri.parse('file:///fake/extension/path'),
      asAbsolutePath: (p) => p,
      storagePath: '/fake/storage/path',
      storageUri: vscode.Uri.parse('file:///fake/storage/path'),
      globalStoragePath: '/fake/global/storage/path',
      globalStorageUri: vscode.Uri.parse('file:///fake/global/storage/path'),
      logPath: '/fake/log/path',
      logUri: vscode.Uri.parse('file:///fake/log/path')
    };
    
    // Mock file system operations
    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(fs, 'mkdirSync');
    
    // Create test instance
    codeExampleSearch = new CodeExampleSearch(mockContext);
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it('should retrieve cached results efficiently', async () => {
    // Set up cached data
    const mockCachedData = {
      timestamp: new Date().toISOString(),
      examples: [
        { id: '123', filename: 'test.js', content: 'console.log("test")', language: 'javascript', url: 'https://github.com', repository: 'test/repo', relevanceScore: 0.8 }
      ]
    };
    
    sandbox.stub(fs, 'readFileSync').returns(JSON.stringify(mockCachedData));
    
    // Measure execution time
    const start = performance.now();
    const results = await codeExampleSearch.searchExamples('test query', 'javascript');
    const executionTime = performance.now() - start;
    
    // Assert on results
    assert(Array.isArray(results), 'Should return an array of results');
    assert.strictEqual(results.length, 1, 'Should return one example');
    
    // Assert on performance
    assert(executionTime < CACHE_RETRIEVAL_THRESHOLD_MS, 
      `Cache retrieval should be fast (took ${executionTime.toFixed(2)}ms, threshold: ${CACHE_RETRIEVAL_THRESHOLD_MS}ms)`);
  });
  
  it('should search and filter results efficiently', async () => {
    // Mock cache miss
    sandbox.stub(fs, 'readFileSync').throws(new Error('File not found'));
    
    // Mock GitHub API response
    const mockGitHubSearchResponse = {
      status: 200,
      data: {
        items: Array(100).fill(null).map((_, i) => ({
          sha: `sha${i}`,
          name: `test${i}.js`,
          html_url: `https://github.com/test/repo/test${i}.js`,
          url: `https://api.github.com/repos/test/repo/contents/test${i}.js`,
          repository: { full_name: `test/repo${i}` }
        }))
      }
    };
    
    // Mock content responses - create 100 different examples
    const mockGitHubContentResponse = (url: string) => {
      const index = parseInt(url.match(/test(\d+)\.js/)?.[1] || '0', 10);
      return {
        status: 200,
        data: `// Example ${index}\nconsole.log("test ${index}");${Array(index).fill('\n// Extra content line').join('')}`
      };
    };
    
    const axiosGetStub = sandbox.stub(axios, 'get');
    axiosGetStub.onFirstCall().resolves(mockGitHubSearchResponse);
    
    // For each content request, return a different mock response
    axiosGetStub.callsFake((url) => {
      if (url.includes('api.github.com/search/code')) {
        return Promise.resolve(mockGitHubSearchResponse);
      } else {
        return Promise.resolve(mockGitHubContentResponse(url));
      }
    });
    
    // Mock file write to prevent actual disk writes
    sandbox.stub(fs, 'writeFileSync');
    
    // Measure execution time
    const start = performance.now();
    const results = await codeExampleSearch.searchExamples('test query', 'javascript');
    const executionTime = performance.now() - start;
    
    // Assert on results
    assert(Array.isArray(results), 'Should return an array of results');
    assert(results.length <= 10, 'Should return at most 10 examples');
    
    // Assert on performance
    assert(executionTime < SEARCH_THRESHOLD_MS, 
      `Search operation should complete within threshold (took ${executionTime.toFixed(2)}ms, threshold: ${SEARCH_THRESHOLD_MS}ms)`);
    
    // Verify the results are sorted by relevance
    for (let i = 0; i < results.length - 1; i++) {
      assert(results[i].relevanceScore >= results[i + 1].relevanceScore, 
        'Results should be sorted by relevance score in descending order');
    }
  });
  
  it('should measure HTML generation performance', async () => {
    // Create a sample set of examples
    const examples = Array(20).fill(null).map((_, i) => ({
      id: `id${i}`,
      filename: `example${i}.js`,
      content: `// Example ${i}\nconsole.log("test ${i}");\n${Array(50).fill('// More content').join('\n')}`,
      language: 'javascript',
      url: `https://github.com/test/repo/example${i}.js`,
      repository: `test/repo${i}`,
      relevanceScore: 1 - (i / 20)
    }));
    
    // Mock webview
    const mockWebview = {
      html: '',
      onDidReceiveMessage: sandbox.stub(),
      postMessage: sandbox.stub(),
      cspSource: 'mock-csp-source'
    };
    
    const mockWebviewPanel = {
      webview: mockWebview,
      onDidDispose: sandbox.stub()
    };
    
    sandbox.stub(vscode.window, 'createWebviewPanel').returns(mockWebviewPanel);
    
    // Measure execution time for HTML generation
    const start = performance.now();
    await codeExampleSearch.showExampleUI(examples);
    const executionTime = performance.now() - start;
    
    // Assert on HTML generation performance (should be done in under 100ms)
    assert(executionTime < 100, 
      `HTML generation should be fast (took ${executionTime.toFixed(2)}ms, threshold: 100ms)`);
      
    // Verify HTML content was generated
    assert(mockWebview.html.length > 0, 'HTML should be generated');
    assert(mockWebview.html.includes('example0.js'), 'HTML should include example filenames');
  });
});