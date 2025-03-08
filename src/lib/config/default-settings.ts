/**
 * Default application settings for UI Vispro
 * Provides sensible defaults for AI models and generation parameters
 */

import { AppSettings, AIModelConfig } from '../types';
import env from './env';

// Default vision model configurations
export const defaultVisionModels: AIModelConfig[] = [
  {
    id: 'openai-vision',
    name: 'OpenAI GPT-4 Vision',
    provider: 'openai',
    modelId: 'gpt-4-vision-preview',
    capabilities: ['vision'],
  },
  {
    id: 'openai-gpt4-vision',
    name: 'OpenAI GPT-4 Turbo with Vision',
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    capabilities: ['vision'],
  },
  {
    id: 'ollama-llava',
    name: 'Ollama LLaVA',
    provider: 'ollama',
    modelId: 'llava',
    capabilities: ['vision'],
    endpoint: env.OLLAMA_BASE_URL,
  }
];

// Default generation model configurations
export const defaultGenerationModels: AIModelConfig[] = [
  {
    id: 'openai-gpt4',
    name: 'OpenAI GPT-4 Turbo',
    provider: 'openai',
    modelId: 'gpt-4-turbo',
    capabilities: ['text-to-markdown'],
  },
  {
    id: 'together-llama3',
    name: 'Together AI - Llama 3 70B',
    provider: 'togetherai',
    modelId: 'meta-llama/Llama-3-70b-chat-hf',
    capabilities: ['text-to-markdown'],
  },
  {
    id: 'ollama-mistral',
    name: 'Ollama Mistral',
    provider: 'ollama',
    modelId: 'mistral',
    capabilities: ['text-to-markdown'],
    endpoint: env.OLLAMA_BASE_URL,
  },
  {
    id: 'lmstudio-local',
    name: 'LM Studio Local Model',
    provider: 'lmstudio',
    modelId: 'local-model',
    capabilities: ['text-to-markdown'],
    endpoint: env.LMSTUDIO_BASE_URL,
  }
];

// Get default models based on environment settings
const getDefaultVisionModel = () => {
  const envDefault = env.DEFAULT_VISION_MODEL;
  const [provider, modelId] = envDefault.split('/');
  
  return defaultVisionModels.find(model => 
    model.provider === provider && model.modelId === modelId
  ) || defaultVisionModels[0];
};

const getDefaultGenerationModel = () => {
  const envDefault = env.DEFAULT_GENERATION_MODEL;
  const [provider, modelId] = envDefault.split('/');
  
  return defaultGenerationModels.find(model => 
    model.provider === provider && model.modelId === modelId
  ) || defaultGenerationModels[0];
};

// Default application settings
export const defaultSettings: AppSettings = {
  visionModel: getDefaultVisionModel(),
  generationModel: getDefaultGenerationModel(),
  preferredOutputFormat: 'markdown',
  maxTokens: 4000,
  temperature: 0.7,
};

export default defaultSettings;
