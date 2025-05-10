import * as vscode from 'vscode';
import { ILogger } from '../../../logging/ILogger';
import { TypeScriptAnalyzer } from '../analyzers/typescriptAnalyzer';

describe('TypeScriptAnalyzer', () => {
    let analyzer: TypeScriptAnalyzer;
    let mockLogger: jest.Mocked<ILogger>;

    beforeEach(() => {
        // Create mock implementations
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            log: jest.fn()
        } as unknown as jest.Mocked<ILogger>;

        analyzer = new TypeScriptAnalyzer(mockLogger);
    });

    test('analyzeCode identifies performance issues in TypeScript code', async () => {
        const typescriptCode = `
            interface User {
                id: number;
                name: string;
                email: string;
                preferences: {
                    theme: string;
                    notifications: boolean;
                    language: string;
                }
            }

            class UserProcessor {
                private users: User[] = [];

                // Inefficient array processing
                processUsers(): void {
                    for (let i = 0; i < this.users.length; i++) {
                        for (let j = 0; j < this.users.length; j++) {
                            if (this.users[i].id === this.users[j].id && i !== j) {
                                console.log('Duplicate user found');
                            }
                        }
                    }
                }

                // Type-related performance issue
                findUsersByName(name: string): User[] {
                    let results: any[] = [];
                    for (const user of this.users) {
                        if (user.name === name) {
                            results.push(user);
                        }
                    }
                    return results as User[]; // Type casting instead of proper typing
                }

                // Memory issue with large object
                getUserData(): { [key: string]: User } {
                    const result: { [key: string]: User } = {};
                    this.users.forEach(user => {
                        result[user.id.toString()] = { ...user }; // Creating many objects
                    });
                    return result;
                }
            }
        `;

        const mockDocument = {
            getText: jest.fn().mockReturnValue(typescriptCode),
            lineAt: jest.fn().mockImplementation(lineNum => ({
                text: typescriptCode.split('\n')[lineNum],
                lineNumber: lineNum
            })),
            lineCount: typescriptCode.split('\n').length
        } as unknown as vscode.TextDocument;

        const result = await analyzer.analyzeCode(mockDocument);

        // Verify that analysis produced results
        expect(result).toBeDefined();
        expect(result.issues.length).toBeGreaterThan(0);

        // Check that nested loops are detected
        const nestedLoopIssue = result.issues.find(issue =>
            issue.description.toLowerCase().includes('nested loop') ||
            issue.description.toLowerCase().includes('o(n²)'));
        expect(nestedLoopIssue).toBeDefined();

        // Check that type issues are detected
        const typeIssue = result.issues.find(issue =>
            issue.description.toLowerCase().includes('type') ||
            issue.description.toLowerCase().includes('casting'));
        expect(typeIssue).toBeDefined();
    });

    test('analyzeTypeIssues identifies TypeScript-specific type issues', () => {
        const codeWithTypeIssues = `
            // Any type usage
            function processData(data: any): any {
                return data.value * 2;
            }

            // Unnecessary type assertions
            function getUserName(user: { name: string }): string {
                return (user as any).name;
            }

            // Type widening issues
            function createArray() {
                let arr = []; // Implicitly any[]
                arr.push(1);
                arr.push('string'); // Mixed types
                return arr;
            }

            // Inefficient interface with optional properties
            interface Config {
                endpoint?: string;
                timeout?: number;
                retries?: number;
                headers?: { [key: string]: string };
                options?: {
                    cache?: boolean;
                    mode?: 'cors' | 'no-cors';
                }
            }
        `;

        const issues = analyzer.analyzeTypeIssues(codeWithTypeIssues);

        // Should detect various type-related issues
        expect(issues.length).toBeGreaterThan(0);

        // Check for 'any' type usage
        const anyTypeIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('any') ||
            issue.description.toLowerCase().includes('type safety'));
        expect(anyTypeIssue).toBeDefined();

        // Check for type assertion issues
        const assertionIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('assertion') ||
            issue.description.toLowerCase().includes('cast'));
        expect(assertionIssue).toBeDefined();

        // Check for type widening issues
        const wideningIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('widen') ||
            issue.description.toLowerCase().includes('implicit'));
        expect(wideningIssue).toBeDefined();
    });

    test('analyzeGenericUsage identifies issues with generics', () => {
        const codeWithGenericIssues = `
            // Missing constraints
            function firstItem<T>(items: T[]): T {
                return items[0];
            }

            // Overly complex generics
            function process<T, U, V, W>(items: T[], transformer: (item: T) => U, filter: (item: U) => V, mapper: (item: V) => W): W[] {
                return items
                    .map(transformer)
                    .filter(filter)
                    .map(mapper);
            }

            // Redundant generics
            function identity<T>(value: T): T {
                return value;
            }
            const result = identity<string>('hello');

            // Inefficient generic constraints
            interface HasLength {
                length: number;
            }
            function getLength<T extends HasLength>(obj: T): number {
                return obj.length;
            }
        `;

        const issues = analyzer.analyzeGenericUsage(codeWithGenericIssues);

        // Should detect various generic-related issues
        expect(issues.length).toBeGreaterThan(0);

        // Check for missing constraints
        const constraintIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('constraint') ||
            issue.description.toLowerCase().includes('bound'));
        expect(constraintIssue).toBeDefined();

        // Check for overly complex generics
        const complexityIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('complex') ||
            issue.description.toLowerCase().includes('readability'));
        expect(complexityIssue).toBeDefined();
    });

    test('analyzeClassStructure identifies issues with TypeScript classes', () => {
        const codeWithClassIssues = `
            // Class with too many properties
            class UserProfile {
                id: number;
                firstName: string;
                lastName: string;
                email: string;
                phone: string;
                address: string;
                city: string;
                state: string;
                zip: string;
                country: string;
                birthDate: Date;
                joinDate: Date;
                lastLogin: Date;
                preferences: { [key: string]: any };
                settings: { [key: string]: any };
                permissions: string[];
                roles: string[];
                status: 'active' | 'inactive';

                constructor(data: any) {
                    // Assign all properties from data
                    Object.assign(this, data);
                }

                // Method with side effects
                processUser(): void {
                    this.lastLogin = new Date();
                    // More logic...
                }
            }

            // Poor inheritance structure
            class BaseEntity {
                id: number;
                createdAt: Date;
                updatedAt: Date;

                save(): void {
                    // Save to database
                }
            }

            class Product extends BaseEntity {
                name: string;
                price: number;
                // More product properties

                // Override with completely different behavior
                save(): void {
                    // Different implementation
                }
            }
        `;

        const issues = analyzer.analyzeClassStructure(codeWithClassIssues);

        // Should detect various class-related issues
        expect(issues.length).toBeGreaterThan(0);

        // Check for large class issue
        const largeClassIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('too many') ||
            issue.description.toLowerCase().includes('large class'));
        expect(largeClassIssue).toBeDefined();

        // Check for inheritance issues
        const inheritanceIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('inherit') ||
            issue.description.toLowerCase().includes('extend'));
        expect(inheritanceIssue).toBeDefined();
    });

    test('analyzeAsyncAwait identifies issues with async/await patterns', () => {
        const codeWithAsyncIssues = `
            // Sequential async calls
            async function fetchUserData(userId: string): Promise<any> {
                const user = await fetchUser(userId);
                const posts = await fetchPosts(userId);
                const comments = await fetchComments(userId);
                return { user, posts, comments };
            }

            // Missing error handling
            async function processData(): Promise<void> {
                const data = await fetchData();
                processResult(data);
            }

            // Unnecessary async
            async function getName(user: { name: string }): Promise<string> {
                return user.name;
            }

            // Async in loops
            async function processItems(items: string[]): Promise<void> {
                for (const item of items) {
                    await processItem(item);
                }
            }

            // Placeholder for method definitions to avoid errors
            function fetchUser(id: string): Promise<any> { return Promise.resolve({}); }
            function fetchPosts(id: string): Promise<any> { return Promise.resolve([]); }
            function fetchComments(id: string): Promise<any> { return Promise.resolve([]); }
            function fetchData(): Promise<any> { return Promise.resolve({}); }
            function processResult(data: any): void {}
            function processItem(item: string): Promise<void> { return Promise.resolve(); }
        `;

        const issues = analyzer.analyzeAsyncAwait(codeWithAsyncIssues);

        // Should detect various async/await-related issues
        expect(issues.length).toBeGreaterThan(0);

        // Check for sequential calls issue
        const sequentialIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('sequential') ||
            issue.description.toLowerCase().includes('parallel'));
        expect(sequentialIssue).toBeDefined();

        // Check for error handling issue
        const errorHandlingIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('error') ||
            issue.description.toLowerCase().includes('exception'));
        expect(errorHandlingIssue).toBeDefined();

        // Check for unnecessary async issue
        const unnecessaryAsyncIssue = issues.find(issue =>
            issue.description.toLowerCase().includes('unnecessary') ||
            issue.description.toLowerCase().includes('needed'));
        expect(unnecessaryAsyncIssue).toBeDefined();
    });
});
