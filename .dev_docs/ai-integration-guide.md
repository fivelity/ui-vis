# AI Integration Guide

This guide provides detailed information on how to work with the AI integration in UI-Vis, including best practices for extending or modifying the existing implementation.

## Provider Architecture

The AI integration is designed to be modular and extensible, supporting multiple AI providers through a common interface.

### Provider Structure

Each AI provider follows this implementation pattern:

1. **Initialization Function** in `providers.ts`
   - Takes configuration as input
   - Validates credentials
   - Returns a properly configured client

2. **Utility Functions** in `utils.ts`
   - Provider-specific formatting functions
   - Image processing utilities
   - Specialized prompt templates

3. **Service Integration** in `services.ts`
   - Provider-specific API calls
   - Response handling and parsing
   - Error management

## Adding a New Provider

To add support for a new AI provider:

1. **Add Environment Variables**
   ```typescript
   // In .env
   NEW_PROVIDER_API_KEY=your_api_key
   NEW_PROVIDER_BASE_URL=https://api.example.com
   ```

2. **Update Environment Schema**
   ```typescript
   // In env.ts or configuration file
   export const envSchema = z.object({
     // Existing providers
     NEW_PROVIDER_API_KEY: z.string().optional(),
     NEW_PROVIDER_BASE_URL: z.string().optional(),
   });
   ```

3. **Create Initialization Function**
   ```typescript
   // In providers.ts
   export function initializeNewProvider(config: AIModelConfig) {
     const apiKey = config.credentials?.apiKey || env.NEW_PROVIDER_API_KEY;
     const baseUrl = config.credentials?.baseUrl || env.NEW_PROVIDER_BASE_URL;
     
     if (!apiKey) {
       throw new Error("New Provider API key is required");
     }
     
     return new NewProviderClient({
       apiKey,
       baseURL: baseUrl,
     });
   }
   ```

4. **Add Image Formatting Function**
   ```typescript
   // In utils.ts
   export function formatImageForNewProvider(base64Image: string) {
     // Provider-specific format
     return {
       type: "image",
       data: base64Image
     };
   }
   ```

5. **Update Service Functions**
   ```typescript
   // In services.ts - Add to switch statements
   case "newprovider": {
     const newProvider = provider;
     const response = await newProvider.generateContent({
       model: modelConfig.model,
       messages,
       // Provider-specific parameters
     });
     // Process response
     break;
   }
   ```

6. **Add to Provider Selection UI**

## Optimizing Prompts

### Structure for Different Providers

Different providers may respond better to different prompt structures:

- **OpenAI** - Benefits from detailed, multi-step instructions
- **TogetherAI** - Works well with concise, focused prompts
- **LM Studio** - May need simpler language depending on model size
- **Ollama** - Often requires more explicit formatting guidance

### Provider-Specific Templates

Create dedicated prompt templates per provider:

```typescript
// In utils.ts
export function createAnalysisPromptForProvider(
  provider: string,
  description?: string
) {
  switch (provider) {
    case "openai":
      return `Analyze this UI design in detail...`;
    case "togetherai":
      return `Identify the following in this UI:...`;
    default:
      return `Analyze this design...`;
  }
}
```

## Error Handling

Implement comprehensive error handling for different failure modes:

1. **Authentication Errors**
   - Invalid API keys
   - Expired tokens
   - Missing credentials

2. **Quota/Rate Limiting**
   - Provider API limits
   - Usage quotas
   - Costs exceeding limits

3. **Model Errors**
   - Unsupported models
   - Provider-specific limitations
   - Content policy violations

4. **Network Errors**
   - Connection timeouts
   - Server errors
   - CORS issues with client-side calls

## Performance Optimization

### Caching Strategies

Implement caching to reduce API usage:

1. **In-Memory Caching**
   - For short-lived, frequent requests
   - Clear on page refresh

2. **Local Storage**
   - For user-specific preferences
   - For completed analyses to avoid reprocessing

3. **Request Deduplication**
   - Avoid redundant API calls
   - Use request fingerprinting

### Streaming Optimization

When using streaming responses:

1. **Progressive Rendering**
   - Update UI as chunks arrive
   - Provide user feedback

2. **Chunking Large Responses**
   - Break down large generations
   - Reassemble on client

## Security Considerations

1. **API Key Management**
   - Never expose API keys in client-side code
   - Use environment variables or a secure backend

2. **Content Filtering**
   - Validate user inputs
   - Filter sensitive information

3. **Rate Limiting**
   - Implement client-side rate limiting
   - Respect provider quotas

4. **Local Models**
   - Ensure network isolation for local models
   - Control model access
