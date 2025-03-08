/**
 * AI Models Configuration
 * Contains mappings and information about supported AI models
 */

/**
 * Available models for each provider
 */
export const PROVIDER_MODELS = {
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4-vision-preview',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
  ],
  togetherai: [
    'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    'meta-llama/Meta-Llama-3.1-70B-Instruct',
    'meta-llama/Llama-3-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'togethercomputer/StripedHyena-Nous-7B',
    'google/gemma-7b-it',
  ],
  ollama: [
    'llama3:8b',
    'llama3:latest',
    'llama2:7b',
    'mistral:7b',
    'mixtral:8x7b',
    'gemma:7b',
    'phi3:latest',
  ],
  lmstudio: [
    'local-model',
  ]
};

/**
 * Normalize model name based on provider
 * Some providers require specific model name formats
 * @param provider - The AI provider
 * @param model - The model name
 * @returns Normalized model name
 */
export const getNormalizedModelName = (provider: string, model: string): string => {
  // If it's a valid model name directly from our list, use it
  if (PROVIDER_MODELS[provider.toLowerCase()]?.includes(model)) {
    return model;
  }
  
  // Handle TogetherAI model name format requirements
  if (provider.toLowerCase() === 'togetherai') {
    // Convert simple model names to their TogetherAI format
    const modelMap = {
      'llama3-8b': 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      'llama3-70b': 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.3',
      'mixtral-8x7b': 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'gemma-7b': 'google/gemma-7b-it',
    };
    
    return modelMap[model.toLowerCase()] || model;
  }
  
  // For other providers, use the model name as is
  return model;
};

/**
 * Get available models for a provider
 * @param provider - The AI provider
 * @returns Array of available models
 */
export const getAvailableModels = (provider: string): string[] => {
  return PROVIDER_MODELS[provider.toLowerCase()] || [];
};

/**
 * Check if a model is available for a provider
 * @param provider - The AI provider
 * @param model - The model name
 * @returns Boolean indicating if the model is available
 */
export const isModelAvailable = (provider: string, model: string): boolean => {
  const normalizedModel = getNormalizedModelName(provider, model);
  return PROVIDER_MODELS[provider.toLowerCase()]?.includes(normalizedModel) || false;
};
