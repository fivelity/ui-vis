# AI Integration Documentation

This document outlines the AI integration architecture in the UI-Vis application, focusing on the integration with various AI providers including OpenAI, Together AI, LM Studio, and Ollama.

## Overview

UI-Vis leverages multiple AI SDKs to provide design analysis and code generation capabilities. The system is designed to be modular, allowing users to select different AI providers based on their needs and available credentials.

## Supported AI Providers

### 1. OpenAI

- **SDK**: Vercel AI SDK for OpenAI
- **Models**: GPT-4 Vision, GPT-4, GPT-3.5-Turbo
- **Features**: Image analysis, text processing, code generation
- **Requirements**: OpenAI API key

### 2. Together AI

- **SDK**: Vercel AI SDK for Together AI
- **Models**: Various multimodal models
- **Features**: Image analysis, text processing
- **Requirements**: Together AI API key

### 3. LM Studio

- **SDK**: Vercel AI SDK compatible REST API
- **Models**: Local models available through LM Studio
- **Features**: Text processing, code generation
- **Requirements**: Local LM Studio instance running
- **Note**: Great for offline or private use cases

### 4. Ollama

- **SDK**: Custom integration with Ollama API
- **Models**: Various local models via Ollama
- **Features**: Text processing, simple image processing
- **Requirements**: Local Ollama instance running
- **Note**: Excellent for local development without API costs

## Architecture

The AI integration consists of several key components:

### 1. Providers (`providers.ts`)

This module handles the initialization and configuration of various AI providers:

- Manages API keys and endpoints
- Provides error handling for missing credentials
- Creates properly configured client instances
- Validates environment variables using Zod

### 2. Utilities (`utils.ts`)

Contains helper functions for AI processing:

- Image conversion functions (file to base64)
- Format images for different provider APIs
- Create structured prompts for analysis and generation
- Handle common tasks shared across providers

### 3. Services (`services.ts`)

High-level API for the application to interact with AI capabilities:

- `analyzeDesign()`: Process design inputs (images and text)
- `generateProjectFiles()`: Turn analysis into code components
- `streamingAnalyzeDesign()`: Stream AI analysis in real-time
- Parses AI responses into structured file outputs

## Implementation Notes

### Image Processing

Images are processed differently depending on the provider:

1. **OpenAI**: Uses `{ type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } }`
2. **Together AI**: Similar to OpenAI but with provider-specific parameters
3. **LM Studio**: Format depends on the model capabilities
4. **Ollama**: Uses a simpler format with direct base64 strings

### Error Handling

The integration includes comprehensive error handling:

- Validation of required credentials before initializing clients
- Graceful fallbacks when certain features aren't available
- Clear error messages to guide users on fixing configuration issues
- Runtime error catching with detailed feedback

### Streaming Support

Real-time streaming is implemented where supported:

- Provides immediate feedback during long-running AI operations
- Updates the UI progressively as content is generated
- Handles connection issues gracefully

## Configuration

To use different AI providers, update the environment variables:

```
# OpenAI
OPENAI_API_KEY=your_openai_key
OPENAI_API_BASE_URL=https://api.openai.com/v1 # Optional

# Together AI
TOGETHER_API_KEY=your_together_key

# LM Studio
LM_STUDIO_BASE_URL=http://localhost:1234/v1 # Default for local LM Studio

# Ollama
OLLAMA_BASE_URL=http://localhost:11434/api # Default for local Ollama
```

## Usage Example

```typescript
import { analyzeDesign, generateProjectFiles } from "@/lib/ai/services";

// Configure the AI model
const modelConfig = {
  provider: "openai", // or "togetherai", "lmstudio", "ollama"
  model: "gpt-4-vision-preview", 
  temperature: 0.7,
  maxTokens: 4000
};

// Analyze design
const result = await analyzeDesign({
  imageFile: imageFileFromUpload,
  textDescription: "A modern dashboard with dark theme"
}, modelConfig);

// Generate project files from analysis
const files = await generateProjectFiles(result.analysis, modelConfig);
```

## Extending with New Providers

To add a new AI provider:

1. Add initialization function in `providers.ts`
2. Add image formatting utility in `utils.ts` if needed
3. Update the provider cases in `services.ts`
4. Add environment variable validation in the configuration

## Security Considerations

- API keys are handled securely and never exposed to clients
- All API calls are made server-side when possible
- Environment variables are validated before use
- Local models (LM Studio/Ollama) don't require API keys
