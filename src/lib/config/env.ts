/**
 * Environment configuration for UI Vispro
 * Handles environment variables with validation and default values
 */

import { z } from 'zod';

/**
 * Helper function to validate API credentials when needed
 * @param providerName - Name of the provider to validate credentials for
 * @param apiKey - The API key to validate
 * @throws Error with helpful message if validation fails
 */
export const validateApiCredentials = (providerName: string, apiKey?: string): void => {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(`Missing API key for ${providerName}. Please check your environment variables.`);
  }
};

// Define environment variable schema with validation
const envSchema = z.object({
  // OpenAI Configuration
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  
  // TogetherAI Configuration
  TOGETHER_API_KEY: z.string().optional(),
  
  // Ollama Configuration
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  
  // LM Studio Configuration
  LMSTUDIO_BASE_URL: z.string().default('http://localhost:1234/v1'),
  
  // Default model selections
  DEFAULT_VISION_MODEL: z.string().default('openai/gpt-4-vision-preview'),
  DEFAULT_GENERATION_MODEL: z.string().default('openai/gpt-4-turbo'),
});

// Export the schema for external validation
export const ENV_SCHEMA = envSchema;

// Helper function to safely parse environment
export const parseEnv = () => {
  try {
    return ENV_SCHEMA.parse(process.env);
  } catch (error) {
    console.error('Environment validation error:', error);
    // Return a safe default with all optionals as undefined
    return ENV_SCHEMA.partial().parse({});
  }
};

// Process environment variables with defaults and validation
const processEnv = {
  OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  OPENAI_BASE_URL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
  TOGETHER_API_KEY: process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
  OLLAMA_BASE_URL: process.env.NEXT_PUBLIC_OLLAMA_BASE_URL,
  LMSTUDIO_BASE_URL: process.env.NEXT_PUBLIC_LMSTUDIO_BASE_URL,
  DEFAULT_VISION_MODEL: process.env.NEXT_PUBLIC_DEFAULT_VISION_MODEL,
  DEFAULT_GENERATION_MODEL: process.env.NEXT_PUBLIC_DEFAULT_GENERATION_MODEL,
};

// Parse and validate environment variables
export const env = parseEnv();

// Export validated environment configuration
export default env;
