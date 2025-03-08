/**
 * Cache service for AI responses to reduce API usage and improve performance
 */

import { AIProcessingResult, GeneratedFile } from "@/lib/types";

// Cache expiration in milliseconds (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// In-memory cache for analysis results
const analysisCache = new Map<string, {
  result: AIProcessingResult;
  timestamp: number;
}>();

// In-memory cache for generated files
const generationCache = new Map<string, {
  files: GeneratedFile[];
  timestamp: number;
}>();

/**
 * Create a cache key from the input parameters
 * @param input The input object to hash
 * @returns A string hash to use as cache key
 */
function createCacheKey(input: any): string {
  // Convert the input object to a stable string representation
  const stableString = JSON.stringify(input, Object.keys(input).sort());
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < stableString.length; i++) {
    const char = stableString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(36);
}

/**
 * Get cached analysis result if available and not expired
 * @param input The request input
 * @param provider The AI provider
 * @param model The model name
 * @returns Cached result or null if not found or expired
 */
export function getCachedAnalysis(
  input: any,
  provider: string,
  model: string
): AIProcessingResult | null {
  // Create a cache key from the input and model info
  const cacheKey = createCacheKey({
    input,
    provider,
    model
  });
  
  const cached = analysisCache.get(cacheKey);
  
  // Return null if not found or expired
  if (!cached || Date.now() - cached.timestamp > CACHE_EXPIRATION) {
    return null;
  }
  
  return cached.result;
}

/**
 * Store analysis result in cache
 * @param input The request input
 * @param provider The AI provider
 * @param model The model name
 * @param result The analysis result to cache
 */
export function cacheAnalysisResult(
  input: any,
  provider: string,
  model: string,
  result: AIProcessingResult
): void {
  // Create a cache key from the input and model info
  const cacheKey = createCacheKey({
    input,
    provider,
    model
  });
  
  // Store in cache with current timestamp
  analysisCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
  
  // Clean up expired cache entries
  cleanupCache();
}

/**
 * Get cached generated files if available and not expired
 * @param analysis The analysis text
 * @param provider The AI provider
 * @param model The model name
 * @returns Cached files or null if not found or expired
 */
export function getCachedGeneration(
  analysis: string,
  provider: string,
  model: string
): GeneratedFile[] | null {
  // Create a cache key from the analysis and model info
  const cacheKey = createCacheKey({
    analysis,
    provider,
    model
  });
  
  const cached = generationCache.get(cacheKey);
  
  // Return null if not found or expired
  if (!cached || Date.now() - cached.timestamp > CACHE_EXPIRATION) {
    return null;
  }
  
  return cached.files;
}

/**
 * Store generated files in cache
 * @param analysis The analysis text
 * @param provider The AI provider
 * @param model The model name
 * @param files The generated files to cache
 */
export function cacheGeneratedFiles(
  analysis: string,
  provider: string,
  model: string,
  files: GeneratedFile[]
): void {
  // Create a cache key from the analysis and model info
  const cacheKey = createCacheKey({
    analysis,
    provider,
    model
  });
  
  // Store in cache with current timestamp
  generationCache.set(cacheKey, {
    files,
    timestamp: Date.now()
  });
  
  // Clean up expired cache entries
  cleanupCache();
}

/**
 * Clean up expired cache entries
 */
function cleanupCache(): void {
  const now = Date.now();
  
  // Clean up analysis cache
  for (const [key, value] of analysisCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRATION) {
      analysisCache.delete(key);
    }
  }
  
  // Clean up generation cache
  for (const [key, value] of generationCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRATION) {
      generationCache.delete(key);
    }
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  analysisCache.clear();
  generationCache.clear();
}

/**
 * Get cache statistics
 * @returns Object with cache statistics
 */
export function getCacheStats(): {
  analysisEntries: number;
  generationEntries: number;
  totalEntries: number;
} {
  return {
    analysisEntries: analysisCache.size,
    generationEntries: generationCache.size,
    totalEntries: analysisCache.size + generationCache.size
  };
}
