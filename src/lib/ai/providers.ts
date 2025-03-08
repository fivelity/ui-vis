/**
 * AI Provider configurations for different model types
 * Handles initialization and configuration for OpenAI, Together AI, Ollama, and LM Studio
 */

import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { LMStudioClient } from '@lmstudio/sdk';
import { createOllama } from 'ollama-ai-provider';
import { ENV_SCHEMA, validateApiCredentials } from '../config/env';
import { AIModelConfig } from '../types';

/**
 * Initialize OpenAI provider with proper credentials
 * @param config - AI model configuration
 * @returns Initialized OpenAI client
 */
export const initializeOpenAI = (config: AIModelConfig) => {
  try {
    const env = ENV_SCHEMA.parse(process.env);
    
    // Use provided credentials or fall back to env vars
    const apiKey = config.credentials?.apiKey || env.OPENAI_API_KEY;
    
    // Validate API key with improved error handling
    validateApiCredentials('OpenAI', apiKey);
    
    // Create client with authentication
    const openai = createOpenAI({
      apiKey,
      baseURL: config.credentials?.baseUrl || env.OPENAI_BASE_URL,
    });
    
    return openai;
  } catch (error) {
    console.error("OpenAI initialization error:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Initialize TogetherAI provider with proper credentials
 * @param config - AI model configuration
 * @returns Initialized TogetherAI client
 */
export const initializeTogetherAI = (config: AIModelConfig) => {
  try {
    const env = ENV_SCHEMA.parse(process.env);
    
    // Use provided credentials or fall back to env vars
    const apiKey = config.credentials?.apiKey || env.TOGETHER_API_KEY;
    
    // Validate API key with improved error handling
    validateApiCredentials('TogetherAI', apiKey);
    
    // Create client with authentication
    const togetherAI = createTogetherAI({
      apiKey,
    });
    
    return togetherAI;
  } catch (error) {
    console.error("TogetherAI initialization error:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Initialize LM Studio provider with proper credentials
 * @param config - AI model configuration
 * @returns Initialized LM Studio client
 */
export const initializeLMStudio = (config: AIModelConfig) => {
  try {
    const env = ENV_SCHEMA.parse(process.env);
    
    // Use provided credentials or fall back to env vars
    const baseUrl = config.credentials?.baseUrl || env.LMSTUDIO_BASE_URL;
    
    if (!baseUrl) {
      throw new Error("Missing LM Studio base URL");
    }
    
    // Create client with base URL
    const lmStudio = new LMStudioClient({
      baseURL: baseUrl,
      apiKey: config.credentials?.apiKey || "lm-studio", // LM Studio usually doesn't require an API key
    });
    
    return lmStudio;
  } catch (error) {
    console.error("LM Studio initialization error:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Initialize Ollama provider with proper credentials
 * @param config - AI model configuration
 * @returns Initialized Ollama provider
 */
export const initializeOllama = (config: AIModelConfig) => {
  try {
    const env = ENV_SCHEMA.parse(process.env);
    
    // Use provided credentials or fall back to env vars
    const baseUrl = config.credentials?.baseUrl || env.OLLAMA_BASE_URL || "http://localhost:11434";
    
    // Create client with proper configuration
    const ollama = createOllama({
      baseUrl,
    });
    
    return ollama;
  } catch (error) {
    console.error("Ollama initialization error:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Initialize AI provider based on configuration
 * @param config - AI model configuration
 * @returns Initialized AI provider
 * @throws Error if provider is not supported
 */
export const initializeProvider = (config: AIModelConfig) => {
  switch (config.provider.toLowerCase()) {
    case 'openai':
      return initializeOpenAI(config);
    case 'togetherai':
      return initializeTogetherAI(config);
    case 'lmstudio':
      return initializeLMStudio(config);
    case 'ollama':
      return initializeOllama(config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
};

/**
 * Check if necessary provider credentials are available
 * @param provider - Provider name
 * @returns Boolean indicating if credentials are available
 */
export const hasProviderCredentials = (provider: string): boolean => {
  try {
    const env = ENV_SCHEMA.parse(process.env);
    
    switch (provider.toLowerCase()) {
      case 'openai':
        return !!env.OPENAI_API_KEY;
      case 'togetherai':
        return !!env.TOGETHER_API_KEY;
      case 'lmstudio':
        return true; // LM Studio doesn't require API keys
      case 'ollama':
        return true; // Ollama is local, no API key required
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
};
