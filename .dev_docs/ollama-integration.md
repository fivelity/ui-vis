# Ollama Integration Guide with Vercel AI SDK

This guide provides detailed instructions for integrating Ollama with UI-Vis using Vercel's AI SDK, enabling local model execution for design-to-code conversion.

## Overview

Ollama provides a way to run powerful AI models locally on your own hardware. UI-Vis integrates with Ollama to allow users to leverage their local computing resources for design analysis and code generation, eliminating the need for external API calls while maintaining full control over data privacy.

## Setup Requirements

To use Ollama with UI-Vis, you'll need:

1. [Ollama](https://ollama.ai/) installed on your local machine or a server accessible via network
2. One or more models pulled into your Ollama instance
3. The Vercel AI SDK installed in your project

## Installation

### Installing Ollama

1. Download and install Ollama from [ollama.ai](https://ollama.ai/)
2. Pull models using the Ollama CLI:
   ```bash
   ollama pull llama3:8b
   ollama pull mistral:7b
   ollama pull mixtral:8x7b
   ```

### Environment Configuration

Add the following to your `.env.local` file:

```
OLLAMA_BASE_URL=http://localhost:11434
```

If running Ollama on a different machine:

```
OLLAMA_BASE_URL=http://your-ollama-server-ip:11434
```

### Required Packages

UI-Vis uses the following packages for Ollama integration:

```bash
# Install dependencies
npm install ai ollama-ai-provider
# or with pnpm
pnpm add ai ollama-ai-provider
```

## Implementation Details

### Client Initialization

Ollama client is initialized with the base URL pointing to your Ollama instance:

```typescript
import { createOllama } from 'ollama-ai-provider';

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434"
});
```

### Making API Calls

API calls to Ollama follow this pattern:

```typescript
const response = await ollama.chat.completions.create({
  model: "llama3:8b",  // Model must be pulled in your Ollama instance
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.7,
  max_tokens: 4000,
  top_p: 0.95,
  top_k: 40,
  repeat_penalty: 1.1,
  stream: false
});

const content = response.choices[0].message.content;
```

### Working with Images

To include images in your prompts with Ollama, you'll need to format them properly:

```typescript
import { formatImageForOllama } from '@/lib/ai/utils';

// Format image for Ollama
const formattedImage = await formatImageForOllama(imageFile);

// Include the image in the messages
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

// Make the API call with the formatted messages
const response = await ollama.chat.completions.create({
  model: "llama3:8b", 
  messages: messages,
  // Other parameters
});
```

### Streaming Responses

For a more interactive experience, you can use streaming:

```typescript
const stream = await ollama.chat.completions.create({
  model: "llama3:8b",
  messages: messages,
  temperature: 0.7,
  stream: true
});

for await (const chunk of stream) {
  // Process streaming chunks
  const content = chunk.choices[0]?.delta?.content || "";
  if (content) {
    // Update UI with new content
    process.stdout.write(content);
  }
}
```

## Recommended Models

UI-Vis works well with the following Ollama models:

| Model | Description | Minimum System Requirements |
|-------|-------------|----------------------|
| llama3:8b | Efficient model for most design tasks | 16GB RAM, modern CPU |
| llama3:latest | Latest Llama 3 model with optimal balance | 16GB RAM, modern CPU |
| mistral:7b | Fast model with good design understanding | 16GB RAM, modern CPU |
| mixtral:8x7b | More powerful model for complex designs | 32GB RAM, modern CPU |
| phi3:latest | Microsoft's efficient small model | 8GB RAM, modern CPU |

For vision-based models that can analyze images:

| Model | Description | Requirements |
|-------|-------------|--------------|
| llava:latest | Multimodal vision model | 16GB RAM, GPU recommended |
| bakllava:latest | Vision-enabled Llama model | 16GB RAM, GPU recommended |

## Performance Optimization

### Hardware Considerations

- **CPU Only**: Models will run but may be slow for complex tasks
- **Consumer GPU**: Significantly improves performance (8GB+ VRAM recommended)
- **Multiple Models**: Each active model consumes RAM, so ensure sufficient memory

### Software Optimizations

1. **Quantization**: Use quantized models (e.g., `llama3:8b-q4_0`) for faster inference with minimal quality loss
2. **Context Length**: Use appropriate context lengths for your use case
3. **Concurrency**: Limit concurrent requests to avoid memory issues

## Troubleshooting

### Common Issues

1. **Connection Refused**: 
   ```
   Error: connect ECONNREFUSED 127.0.0.1:11434
   ```
   Ensure Ollama is running and check the base URL in your environment variables.

2. **Model Not Found**:
   ```
   Error: failed to find model [model_name]
   ```
   Pull the model using `ollama pull [model_name]`.

3. **Out of Memory**:
   ```
   Error: failed to generate: failed to evaluate model
   ```
   Use a smaller model or increase your system's memory.

### Solutions

- Verify Ollama service is running: `ps aux | grep ollama`
- Check available models: `ollama list`
- Restart Ollama service if it becomes unresponsive
- Update to the latest Ollama version

## Best Practices

1. **Local Development**: Start with smaller models for faster iteration
2. **Production**: Consider a dedicated machine for Ollama or cloud deployment
3. **Memory Management**: Monitor system resources when running large models
4. **Security**: If exposing Ollama over network, implement proper authentication

## Resources

- [Ollama Documentation](https://github.com/ollama/ollama/tree/main/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Ollama Model Library](https://ollama.ai/library)
- [Ollama GitHub Repository](https://github.com/ollama/ollama)
