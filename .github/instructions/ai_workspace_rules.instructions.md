---
applyTo: '**'
---
# AI Workspace Rules and Coding Standards

This document outlines coding standards, domain knowledge, and preferences that AI should follow when generating or modifying code in this workspace.

## General Guidelines

- Follow the principle of writing clean, readable, and maintainable code
- Aim for simplicity over complexity
- Implement DRY (Don't Repeat Yourself) principles
- Write self-documenting code with clear intent
- Consider performance implications of code changes
- Follow security best practices and avoid introducing vulnerabilities

## Naming Conventions

- Use descriptive, intention-revealing names
- Classes/Types: PascalCase (e.g., `UserAccount`)
- Functions/Methods: camelCase (e.g., `calculateTotal()`)
- Variables: camelCase (e.g., `userCount`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- Private class members: prefixed with underscore (e.g., `_privateField`)
- Boolean variables: use "is", "has", or "should" prefix (e.g., `isValid`, `hasPermission`)
- Avoid abbreviations unless they are well-known and clear (e.g., `url`, `id`)

## Code Style

- Indentation: Use spaces (not tabs), 2 spaces per level
- Line length: Maximum 100 characters
- Add appropriate whitespace for readability
- Limit function length to less than 30 lines where possible
- Place closing braces on their own line for blocks
- Use blank lines to separate logical sections of code
- Use parentheses to clarify operator precedence, even when not strictly needed

## Status Indicators
- ✅ Completed
- 🔄 In Progress
- ⏳ Pending
- 🚫 Skipped
- ❌ Rejected
- ⚠️ Warning
- ❗ Important
- 🧹 Maintenance
- 🧪 Testing

## Credentials and Secrets
- GitHub
  - url: https://github.com/wakkaluba
  - username: wakkaluba
  - password: Bl4ckB3rr!!

## special folders
### zzzbuild/
- Build scripts and automation
- Build artifacts like compiled code, Docker images, and distribution packages, vsix files, etc.
- "meta" files: important for building the project or environemnt but not necessarily direct part of the build environment.
- todo.md and other progress lists needed for coding and building the project.

### zzzdocs/
 - Project documentation and related files

### zzzrefactoring/
- Refactoring scripts and automation
- Refactoring artifacts
- Documentation and lists for documenting the status and progress of refactoring efforts.

### zzzscripts/
- Utility scripts and tools for development and automation
- Scripts for code generation, scaffolding, and project setup
- Helper scripts for testing and validation
- Scripts for managing dependencies and package versions
- Scripts for continuous integration and deployment
- Scripts for code analysis and quality assurance
- Scripts for code formatting and linting
- Scripts for performance testing and profiling
- Scripts for security testing and vulnerability scanning

## Documentation

- Include JSDoc/similar comments for public APIs, functions, and classes
- Document function parameters, return values, and thrown exceptions
- Explain "why" in comments, not "what" (code should be self-explanatory)
- Keep comments up-to-date with code changes
- Add TODO comments for incomplete implementations, with clear descriptions

## Error Handling

- Use try-catch blocks appropriately
- Never silently swallow exceptions
- Provide meaningful error messages
- Handle edge cases explicitly
- Return appropriate error codes/responses
- Use custom error types for domain-specific errors

## Testing

- Write unit tests for new functionality
- Ensure tests are isolated and do not depend on each other
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error conditions
- Maintain high test coverage for critical paths
- Ensure tests are run automatically on code changes
- Use a testing framework (e.g., Jest, Mocha) for automated testing
- Use test doubles (mocks/stubs) for testing dependencies
- Use code coverage tools to ensure tests cover the code
- Use a continuous integration tool (e.g., Jenkins, Travis CI) for automated testing
- Only test methods and behaviors that are actually implemented and exported

## Performance Considerations

- Avoid premature optimization
- Consider time and space complexity for algorithms
- Minimize DOM manipulations (for web applications)
- Avoid blocking the main thread with long-running operations
- Be mindful of memory leaks, especially in event listeners and closures

## Security Best Practices

- Validate all user inputs
- Sanitize data before displaying it to prevent XSS
- Use parameterized queries to prevent SQL injection
- Don't store sensitive information in client-side code
- Follow the principle of least privilege
- Implement proper authentication and authorization checks

## Version Control

- Write clear, descriptive commit messages
- Keep commits focused on a single logical change
- Reference issue numbers in commit messages where applicable
- Squash multiple commits that address the same issue

## Language-Specific Guidelines
### Common Rules
- don't pre-pend letters in front of methods and interfaces e.g.not `export interface IMessage` but `export interface Message`

### JavaScript/TypeScript
- Prefer `const` over `let`, avoid `var`
- Use modern ES6+ features where appropriate
- Explicitly type all TypeScript functions and variables
- Prefer type inference where it doesn't reduce clarity
- Use async/await over raw promises when possible
- Avoid using `any` type in TypeScript

### CSS/SCSS
- Use a consistent methodology (BEM, SMACSS, etc.)
- Prefer composable utility classes
- Avoid !important declarations
- Use variables for colors, spacing, and other repeated values
- Keep selector specificity as low as possible

### HTML
- Use semantic HTML elements
- Ensure accessibility (use appropriate ARIA attributes)
- Validate HTML structure
- Include proper meta tags

### Backend (if applicable)
- Follow RESTful API design principles
- Use appropriate status codes and response formats
- Handle authentication and authorization properly
- Implement proper logging and error tracking

## Tooling and Automation

- Always use the project's configured linter and formatter (e.g., ESLint, Prettier) before committing code
- Do not ignore linter errors unless justified and documented
- Use automated tools for dependency updates where possible
- run appropriate test suite to verify coverage improvements
- Use automated tools for code analysis (e.g., SonarQube, ESLint, Prettier)

## Dependency Management

- Prefer minimal, well-maintained dependencies
- Remove unused dependencies promptly
- Pin dependency versions where possible to avoid unexpected breakage
- Regularly audit dependencies for security vulnerabilities

## Code Review and Collaboration

- Be respectful and constructive in code reviews
- Respond to review comments in a timely manner
- Avoid merging your own pull requests without review unless urgent and justified
- Resolve all review comments before merging

## Deprecation and Removal

- Mark deprecated code clearly with comments and, if possible, with annotations
- Remove deprecated code after a reasonable transition period
- Update documentation and tests when removing or deprecating code

## Comments and Documentation

- Do not leave commented-out code in the codebase; remove unused code
- Use comments to explain "why", not "what"
- Keep documentation and code comments in sync with code changes

## Accessibility (UI Code)

- Ensure all interactive elements are keyboard accessible
- Use ARIA attributes where appropriate
- Test UI with screen readers when possible

## Internationalization/Localization

- Do not hardcode user-facing strings; use localization utilities if available
- Support multiple languages if the project requires it

## Best Practices

1. **Error Classification**
   - Use specific error types
   - Include error codes
   - Provide detailed messages
   - Preserve error context

2. **Recovery Strategies**
   - Implement automatic retries
   - Use circuit breakers
   - Provide fallback options
   - Handle offline scenarios

3. **Error Propagation**
   - Maintain error chains
   - Add context at each level
   - Use consistent error formats
   - Document error contracts

4. **Monitoring and Alerts**
   - Log all errors
   - Track error metrics
   - Set up alerts
   - Monitor error trends

5. **User Experience**
   - Show meaningful messages
   - Provide recovery options
   - Maintain system stability
   - Keep users informed
