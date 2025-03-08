# Type System

This document outlines the type system used in UI-Vis, providing details on the core types, interfaces, and best practices for type safety.

## Core Types

The application uses TypeScript for strong type checking, with central type definitions located in `src/lib/types/index.ts`.

### AI Model Configuration

```typescript
interface AIModelConfig {
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  credentials?: {
    apiKey?: string;
    baseUrl?: string;
  };
}
```

### Design Input

```typescript
interface DesignInput {
  imageFile?: File;
  textDescription?: string;
}
```

### AI Processing Result

```typescript
interface AIProcessingResult {
  analysis: string;
  metadata: {
    model: string;
    provider: string;
    timestamp: string;
  };
}
```

### Generated File

```typescript
interface GeneratedFile {
  id: string;
  name: string;
  description: string;
  content: string;
  language: string;
}
```

## Type Safety Best Practices

### Use Explicit Return Types

Always specify return types for functions:

```typescript
// Good
function processData(input: string): ProcessedData {
  // Implementation
}

// Avoid
function processData(input: string) {
  // Implementation
}
```

### Prefer Interfaces for Public APIs

Use interfaces for types that are exposed as part of your module's public API:

```typescript
// Public API
export interface UserConfig {
  theme: 'light' | 'dark';
  fontSize: number;
}

// Internal implementation
type InternalState = {
  isProcessing: boolean;
  error?: string;
};
```

### Use Discriminated Unions for State Management

```typescript
type RequestState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success', data: T }
  | { status: 'error', error: Error };
```

### Type Guards

Implement type guards to narrow types at runtime:

```typescript
function isGeneratedFile(value: unknown): value is GeneratedFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'content' in value
  );
}
```

### Generic Components

Use generics for reusable components:

```typescript
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
}

function Select<T>({ options, value, onChange, getLabel }: SelectProps<T>) {
  // Implementation
}
```

## Runtime Type Validation

UI-Vis uses Zod for runtime type validation:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

type User = z.infer<typeof UserSchema>;

function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}
```

## Environment Variable Validation

```typescript
const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_API_BASE_URL: z.string().url().optional(),
  // Other environment variables
});

// Validate and export environment variables
export const env = envSchema.parse(process.env);
```

## Props Pattern

For React components, use a consistent props pattern:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
```

## Avoiding Type Issues

### Avoid `any`

Never use `any` in the codebase. Use `unknown` for truly unknown values, then narrow with type guards:

```typescript
// Bad
function processData(data: any) {
  return data.property; // No type safety
}

// Good
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'property' in data) {
    return data.property;
  }
  throw new Error('Invalid data format');
}
```

### Non-null Assertion

Avoid non-null assertions (`!`). Use optional chaining and nullish coalescing:

```typescript
// Bad
const value = maybeNull!.property;

// Good
const value = maybeNull?.property ?? defaultValue;
```

### Type Assertion

Use type assertions sparingly and only when you're certain:

```typescript
// Only when you're absolutely sure
const element = document.getElementById('root') as HTMLDivElement;
```

## Testing Types

Use the TypeScript compiler to test types:

```typescript
// @ts-expect-error - This should fail type checking
const wrongType: string = 42;

// This should pass type checking
const correctType: string = "valid";
```

## Common Type Utilities

Leverage TypeScript's utility types:

```typescript
// Make all properties optional
type PartialConfig = Partial<Config>;

// Make all properties required
type RequiredConfig = Required<Config>;

// Extract properties
type ThemeProps = Pick<Config, 'theme' | 'darkMode'>;

// Remove properties
type ConfigWithoutAuth = Omit<Config, 'apiKey' | 'token'>;

// Make properties readonly
type ImmutableConfig = Readonly<Config>;
```

## Extending the Type System

When extending the type system:

1. Add new types to `src/lib/types/index.ts`
2. Update related interfaces
3. Ensure backward compatibility
4. Add JSDoc comments for new types
5. Consider adding Zod schemas for runtime validation
