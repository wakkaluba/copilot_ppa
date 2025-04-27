"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockCodeExample = createMockCodeExample;
describe('CodeExample interface', function () {
    it('should create a valid code example object', function () {
        var example = {
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
    it('should accept an optional stars property', function () {
        var example = {
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
    it('should create code examples in different programming languages', function () {
        var pythonExample = createMockCodeExample({
            language: 'python',
            code: 'def hello_world():\n    print("Hello, World!")'
        });
        var javaExample = createMockCodeExample({
            language: 'java',
            code: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
        });
        var goExample = createMockCodeExample({
            language: 'go',
            code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}'
        });
        expect(pythonExample.language).toBe('python');
        expect(javaExample.language).toBe('java');
        expect(goExample.language).toBe('go');
    });
    it('should handle examples with different sources', function () {
        var githubExample = createMockCodeExample({
            source: {
                name: 'github-repo',
                url: 'https://github.com/example/repo'
            }
        });
        var gitlabExample = createMockCodeExample({
            source: {
                name: 'gitlab-project',
                url: 'https://gitlab.com/example/project'
            }
        });
        var npmExample = createMockCodeExample({
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
function createMockCodeExample(overrides) {
    var defaultExample = {
        title: 'Example Code',
        description: 'This is an example code snippet',
        language: 'typescript',
        code: 'function example() {\n  return "Hello, world!";\n}',
        source: {
            name: 'example-repo',
            url: 'https://github.com/example/repo'
        }
    };
    return __assign(__assign({}, defaultExample), overrides);
}
