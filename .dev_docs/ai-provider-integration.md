# AI Provider Integration Guide

This comprehensive guide explains how to integrate and work with various AI providers in the UI-Vis project.

## Architecture Overview

UI-Vis uses a provider-agnostic approach to AI integration, allowing seamless switching between different AI services while maintaining consistent application behavior.

### Core Components

The AI integration architecture consists of these primary components:

1. **Provider Configuration** (`/src/lib/ai/models.ts`)
   - Central definition of available AI models
   - Provider-specific model mapping and normalization

2. **Provider Initialization** (`/src/lib/ai/providers.ts`)
   - Factory functions for creating provider clients
   - Credential validation and error handling
   - Environment variable management

3. **Service Layer** (`/src/lib/ai/services.ts`)
   - High-level functions for design analysis and code generation
   - Provider-agnostic interface for application features
   - Response normalization and error handling

4. **Utility Functions** (`/src/lib/ai/utils.ts`)
   - Provider-specific data formatting
   - Image processing for different AI services
   - Common helper functions

5. **UI Components** (`/src/components/ai/`)
   - Selection interfaces for models and providers
   - Configuration controls for AI parameters
   - Progress indicators and result displays

## Supported Providers

UI-Vis currently supports the following AI providers:

| Provider | Integration Type | Cost | Features |
|----------|------------------|------|----------|
| OpenAI | API | Pay-per-token | Text & Vision models, highest quality |
| TogetherAI | API | Pay-per-token (lower cost) | Open models, good performance/cost ratio |
| Ollama | Local | Free (local compute) | Privacy-focused, no data sharing |

For provider-specific integration details, see:
- [OpenAI Integration Guide](./openai-integration.md)
- [TogetherAI Integration Guide](./together-ai-integration.md)
- [Ollama Integration Guide](./ollama-integration.md)

## Implementing a New Provider

To add a new AI provider to UI-Vis, follow these steps:

### 1. Environment Configuration

Add provider-specific environment variables to `.env.local`:

```
NEW_PROVIDER_API_KEY=your_api_key
NEW_PROVIDER_BASE_URL=https://api.example.com
```

Update the environment schema in `src/lib/config/env.ts`:

```typescript
export const envSchema = z.object({
  // Existing variables
  NEW_PROVIDER_API_KEY: z.string().optional(),
  NEW_PROVIDER_BASE_URL: z.string().optional(),
});
```

### 2. Install Required Packages

```bash
npm install new-provider-sdk @ai-sdk/new-provider
# or with pnpm
pnpm add new-provider-sdk @ai-sdk/new-provider
```

### 3. Define Models

Add model definitions in `src/lib/ai/models.ts`:

```typescript
export const newProviderModels = [
  {
    name: "new-provider-model-1",
    displayName: "New Provider Model 1",
    description: "General purpose model for UI design analysis",
    contextWindow: 16000,
    inputTokenLimit: 4000,
    outputTokenLimit: 4000,
    imageSupportLevel: "full", // or "none", "basic"
  },
  // Additional models
];

// Add to allModels export
export const allModels = {
  openai: openAIModels,
  togetherai: togetherModels,
  ollama: ollamaModels,
  newprovider: newProviderModels
};
```

### 4. Create Provider Initialization

Add to `src/lib/ai/providers.ts`:

```typescript
import { createNewProvider } from "@ai-sdk/new-provider";

export function initializeNewProvider(config: AIModelConfig) {
  const apiKey = config.credentials?.apiKey || env.NEW_PROVIDER_API_KEY;
  
  if (!apiKey) {
    throw new Error("New Provider API key is required");
  }
  
  return createNewProvider({
    apiKey,
    // Additional provider-specific options
  });
}

// Update the initializeProvider function
export function initializeProvider(config: AIModelConfig) {
  switch (config.provider.toLowerCase()) {
    case "openai":
      return initializeOpenAI(config);
    case "togetherai":
      return initializeTogetherAI(config);
    case "ollama":
      return initializeOllama(config);
    case "newprovider":
      return initializeNewProvider(config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
```

### 5. Add Utility Functions

Update `src/lib/ai/utils.ts` with provider-specific utilities:

```typescript
export async function formatImageForNewProvider(imageFile: File) {
  const base64Image = await fileToBase64(imageFile);
  
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: "image/jpeg",
      data: base64Image.split(",")[1]
    }
  };
}

export function getModelDisplayName(provider: string, modelName: string) {
  // Add case for new provider
  if (provider.toLowerCase() === "newprovider") {
    const model = newProviderModels.find(m => m.name === modelName);
    return model?.displayName || modelName;
  }
  
  // Existing providers...
}
```

### 6. Update Service Functions

Update `src/lib/ai/services.ts` to handle the new provider:

```typescript
export async function analyzeDesign(
  input: DesignInput,
  modelConfig: AIModelConfig
) {
  try {
    const provider = initializeProvider(modelConfig);
    
    // Provider-specific handling
    switch (modelConfig.provider.toLowerCase()) {
      // Existing providers...
      case "newprovider": {
        // Handle new provider
        const newProvider = provider as NewProvider;
        
        // Format messages
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: /* provider-specific format */ }
        ];
        
        // Make API call
        const response = await newProvider.chat.completions.create({
          model: modelConfig.model,
          messages,
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.maxTokens,
          // Provider-specific options
        });
        
        // Process response
        return {
          analysis: response.choices[0].message.content,
          // Other fields
        };
      }
    }
  } catch (error) {
    // Error handling
  }
}
```

### 7. Update UI Components

Update `src/components/ai/ProviderSelector.tsx` to include the new provider:

```typescript
import { newProviderModels } from "@/lib/ai/models";

const providers = [
  {
    id: "openai",
    name: "OpenAI",
    models: openAIModels,
    description: "Advanced AI models from OpenAI"
  },
  // Existing providers...
  {
    id: "newprovider",
    name: "New Provider",
    models: newProviderModels,
    description: "Description of new provider"
  }
];
```

## Advanced Integration Topics

### Handling Streaming Responses

For providers that support streaming:

```typescript
const stream = await provider.chat.completions.create({
  model: modelConfig.model,
  messages,
  temperature: modelConfig.temperature,
  stream: true
});

let accumulatedResponse = '';
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  accumulatedResponse += content;
  // Update UI with streamed content
}
```

### Image Processing

For multimodal models that support image analysis:

```typescript
// Format image based on provider requirements
const formattedImage = await formatImageForProvider(imageFile, provider);

// Include in messages
const messages = [
  { role: "system", content: systemPrompt },
  { 
    role: "user", 
    content: [
      { type: "text", text: userPrompt },
      formattedImage
    ]
  }
];
```

### Custom Model Parameters

Different providers may support different parameters:

```typescript
// OpenAI-specific parameters
const openAIParams = {
  temperature: config.temperature,
  max_tokens: config.maxTokens,
  top_p: 0.95,
  frequency_penalty: 0.5,
  presence_penalty: 0.5,
};

// TogetherAI-specific parameters
const togetherParams = {
  temperature: config.temperature,
  max_tokens: config.maxTokens,
  top_p: 0.95,
  top_k: 40,
  repetition_penalty: 1.1,
};
```

## Best Practices

### Security

- Never hardcode API keys in the codebase
- Implement proper error handling to avoid leaking sensitive information
- Validate user inputs before sending to AI providers

### Performance

- Implement caching for repeated requests
- Use appropriate token limits to minimize costs
- Consider using smaller models for initial analysis and larger models for final generation

### Reliability

- Implement retries with exponential backoff for API failures
- Provide fallback options when a provider is unavailable
- Monitor API usage and implement rate limiting as needed

### Testing

- Create mock responses for unit testing
- Test with various input types (images, text, complex layouts)
- Verify output quality across different providers

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [TogetherAI Documentation](https://docs.together.ai/)
- [Ollama Documentation](https://github.com/ollama/ollama/tree/main/docs)
