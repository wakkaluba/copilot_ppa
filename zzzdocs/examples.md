# Example Prompts and Use Cases

## Code Generation

### Generate a Basic Function
**Prompt:** "Create a function that calculates the factorial of a number"
```typescript
function factorial(n: number): number {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
```

### Object-Oriented Design
**Prompt:** "Create a TypeScript class for managing a shopping cart"
```typescript
class ShoppingCart {
    private items: Array<{id: string; price: number; quantity: number}>;
    constructor() {
        this.items = [];
    }
    addItem(id: string, price: number, quantity: number = 1) { /*...*/}
    removeItem(id: string) { /*...*/}
    getTotal(): number { /*...*/}
}
```

## Code Review

### Style and Best Practices
**Prompt:** "Review this code for TypeScript best practices"
```typescript
// Input Code
function getData(callback) {
    var data = fetchData();
    callback(data);
}

// Review Suggestions
// 1. Add type declarations
// 2. Use async/await pattern
// 3. Replace var with const/let
```

## Documentation Generation

### API Documentation
**Prompt:** "Generate JSDoc documentation for this interface"
```typescript
/**
 * Represents a configuration for LLM providers
 * @interface LLMConfig
 * @property {string} endpoint - The API endpoint URL
 * @property {string} model - The model identifier
 * @property {number} temperature - Response randomness (0-1)
 */
interface LLMConfig {
    endpoint: string;
    model: string;
    temperature: number;
}
```

## Refactoring Examples

### Code Modernization
**Prompt:** "Modernize this code using current TypeScript features"
```typescript
// Before
function getUser(id, callback) {
    $.ajax({
        url: '/api/users/' + id,
        success: callback
    });
}

// After
async function getUser(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
}
```

## Testing Scenarios

### Unit Test Generation
**Prompt:** "Generate unit tests for a user authentication function"
```typescript
describe('UserAuth', () => {
    it('should authenticate valid credentials', async () => {
        const result = await authenticate('user', 'pass');
        expect(result.success).toBe(true);
    });

    it('should reject invalid credentials', async () => {
        const result = await authenticate('user', 'wrong');
        expect(result.success).toBe(false);
    });
});
```

## Advanced Use Cases

### Project Setup
**Prompt:** "Set up a new TypeScript project with ESLint and Jest"
```json
// package.json configuration
{
    "scripts": {
        "test": "jest",
        "lint": "eslint src/**/*.ts"
    },
    "devDependencies": {
        "@types/jest": "^27.0.0",
        "@typescript-eslint/eslint-plugin": "^5.0.0"
    }
}
```

### Error Handling
**Prompt:** "Implement error handling for API requests"
```typescript
/**
 * Makes a safe API request and returns the result or throws a ServiceError.
 */
async function safeApiRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw new ServiceError('API request failed', error);
  }
}
```
