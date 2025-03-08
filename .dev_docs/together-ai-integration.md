# TogetherAI Integration Guide with Vercel AI SDK

This guide provides detailed information on integrating TogetherAI with the UI-Vis project using Vercel's AI SDK.

## Overview

UI-Vis leverages TogetherAI's powerful open models through Vercel's AI SDK to provide cost-effective and high-quality UI generation capabilities. This integration is particularly valuable for users who want to access high-performance AI models while maintaining control over costs.

## Setup Requirements

To use TogetherAI with UI-Vis, you need:

1. A TogetherAI account and API key (obtain from [Together AI platform](https://together.ai))
2. The Vercel AI SDK and OpenAI compatibility package installed in your project

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```
TOGETHER_API_KEY=your_together_api_key
```

### Required Packages

UI-Vis uses the following packages for TogetherAI integration:

```bash
# Install dependencies
npm install ai @ai-sdk/openai @ai-sdk/togetherai
# or with pnpm
pnpm add ai @ai-sdk/openai @ai-sdk/togetherai
```

## Implementation Details

### Client Initialization

TogetherAI is initialized using the OpenAI compatibility layer from Vercel's AI SDK:

```typescript
import { createTogetherAI } from "@ai-sdk/togetherai";

const togetherAI = createTogetherAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1"
});
```

### Model Formatting

TogetherAI requires specific model name formats. UI-Vis handles this through a normalization function:

```typescript
// Example of normalized model names
const togetherModels = [
  'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-70B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'mistralai/Mixtral-8x7B-Instruct-v0.1'
];
```

### Making API Calls

API calls to TogetherAI follow this pattern:

```typescript
const response = await togetherAI.chat.completions.create({
  model: normalizedModel,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.7,
  max_tokens: 4000,
  top_p: 0.95,
  top_k: 40,
  repetition_penalty: 1.1,
  stream: false
});

const content = response.choices[0].message.content;
```

### Streaming Responses

For a more interactive experience, you can use streaming:

```typescript
const stream = await togetherAI.chat.completions.create({
  model: normalizedModel,
  messages: messages,
  temperature: 0.7,
  stream: true
});

for await (const chunk of stream) {
  // Process streaming chunks
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
```

## Recommended Models

UI-Vis works well with the following TogetherAI models:

| Model | Description | Use Case |
|-------|-------------|----------|
| Meta-Llama-3.1-8B-Instruct-Turbo | Fast, efficient model for simpler designs | Rapid prototyping, simple components |
| Meta-Llama-3.1-70B-Instruct | More powerful model for complex designs | Complex layouts, detailed components |
| Mistral-7B-Instruct-v0.3 | Balanced performance | General purpose UI generation |
| Mixtral-8x7B-Instruct-v0.1 | Strong performance for mixed tasks | Combined text and visual processing |

## Troubleshooting

### Common Issues

1. **Invalid API Key**: Ensure your TogetherAI API key is valid and properly set in the environment variables.
   ```
   Error: Missing or invalid API key for TogetherAI
   ```

2. **Model Not Found**: Ensure you're using a supported model name in the correct format.
   ```
   Error: Model [model_name] not found or not available
   ```

3. **Rate Limiting**: TogetherAI has rate limits based on your subscription.
   ```
   Error: Too many requests. Please try again later
   ```

### Solutions

- Verify API key is correctly set in `.env.local`
- Check model availability in TogetherAI dashboard
- Implement exponential backoff for rate limit handling

## Advanced Configuration

### Fine-tuning Parameters

Adjust these parameters to control output quality:

| Parameter | Range | Effect |
|-----------|-------|--------|
| temperature | 0-1 | Higher values increase randomness |
| top_p | 0-1 | Controls diversity |
| top_k | 1-100 | Limits token selection |
| repetition_penalty | 1-2 | Prevents repetition |

### Cost Optimization

To optimize costs when using TogetherAI:

1. Use smaller models for simpler tasks
2. Implement caching for repeated queries
3. Set appropriate max_tokens to avoid overgeneration
4. Use streaming for interactive experiences, non-streaming for batch processing

## Resources

- [TogetherAI Documentation](https://docs.together.ai/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [TogetherAI Model Catalog](https://together.ai/models)
