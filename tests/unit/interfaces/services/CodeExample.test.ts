/**
 * Tests for the CodeExample interface
 */
import { CodeExample } from '../../../../src/services/codeExamples/codeExampleService';

describe('CodeExample interface', () => {
  it('should create a valid code example object', () => {
    const example: CodeExample = {
      title: 'Example Title',
      description: 'This is an example code snippet',
      language: 'typescript',
      code: 'const answer = 42;',
      source: {
        name: 'example-repo',
        url: 'https://github.com/example/repo'
      }
    };

    expect(example).toBeDefined();
    expect(example.title).toBe('Example Title');
    expect(example.description).toBe('This is an example code snippet');
    expect(example.language).toBe('typescript');
    expect(example.code).toBe('const answer = 42;');
    expect(example.source.name).toBe('example-repo');
    expect(example.source.url).toBe('https://github.com/example/repo');
  });

  it('should accept an optional stars property', () => {
    const example: CodeExample = {
      title: 'Popular Example',
      description: 'Popular code example with many stars',
      language: 'javascript',
      code: 'const popularCode = true;',
      source: {
        name: 'popular-repo',
        url: 'https://github.com/popular/repo'
      },
      stars: 5000
    };

    expect(example).toBeDefined();
    expect(example.stars).toBe(5000);
  });

  it('should create code examples in different programming languages', () => {
    const pythonExample: CodeExample = createMockCodeExample({
      language: 'python',
      code: 'def hello_world():\n    print("Hello, World!")'
    });

    const javaExample: CodeExample = createMockCodeExample({
      language: 'java',
      code: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
    });

    const goExample: CodeExample = createMockCodeExample({
      language: 'go',
      code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}'
    });

    expect(pythonExample.language).toBe('python');
    expect(javaExample.language).toBe('java');
    expect(goExample.language).toBe('go');
  });

  it('should handle examples with different sources', () => {
    const githubExample: CodeExample = createMockCodeExample({
      source: {
        name: 'github-repo',
        url: 'https://github.com/example/repo'
      }
    });

    const gitlabExample: CodeExample = createMockCodeExample({
      source: {
        name: 'gitlab-project',
        url: 'https://gitlab.com/example/project'
      }
    });

    const npmExample: CodeExample = createMockCodeExample({
      source: {
        name: 'npm-package',
        url: 'https://www.npmjs.com/package/example'
      }
    });

    expect(githubExample.source.url).toContain('github.com');
    expect(gitlabExample.source.url).toContain('gitlab.com');
    expect(npmExample.source.url).toContain('npmjs.com');
  });
});

/**
 * Mock factory function for code examples
 */
export function createMockCodeExample(overrides?: Partial<CodeExample>): CodeExample {
  const defaultExample: CodeExample = {
    title: 'Example Code',
    description: 'This is an example code snippet',
    language: 'typescript',
    code: 'function example() {\n  return "Hello, world!";\n}',
    source: {
      name: 'example-repo',
      url: 'https://github.com/example/repo'
    }
  };

  return { ...defaultExample, ...overrides };
}