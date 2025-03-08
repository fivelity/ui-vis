/**
 * Utility functions for AI processing
 */

/**
 * Convert an image file to base64
 * @param file - The image file to convert
 * @returns Promise resolving to base64 string
 */
export const imageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Format an image for OpenAI API
 * @param base64Image - Base64 encoded image
 * @returns Formatted image object for OpenAI
 */
export const formatImageForOpenAI = (base64Image: string) => {
  return {
    type: "image_url",
    image_url: {
      url: `data:image/jpeg;base64,${base64Image}`,
    },
  };
};

/**
 * Format an image for Together AI API
 * @param base64Image - Base64 encoded image
 * @returns Formatted image object for Together AI
 */
export const formatImageForTogetherAI = (base64Image: string) => {
  return {
    type: "image_url",
    image_url: `data:image/jpeg;base64,${base64Image}`,
  };
};

/**
 * Format an image for LM Studio API
 * @param base64Image - Base64 encoded image
 * @returns Formatted image object for LM Studio
 */
export const formatImageForLMStudio = (base64Image: string) => {
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: "image/jpeg",
      data: base64Image,
    },
  };
};

/**
 * Format an image for Ollama API
 * @param base64Image - Base64 encoded image
 * @returns Formatted image object for Ollama
 */
export const formatImageForOllama = (base64Image: string) => {
  return {
    data: base64Image,
    mimeType: "image/jpeg",
  };
};

/**
 * Get the maximum token context for a model
 * @param provider - The AI provider
 * @param model - The model name
 * @returns Maximum token context
 */
export const getMaxTokenContext = (provider: string, model: string): number => {
  // Common model context lengths
  const contextLengths: Record<string, number> = {
    // OpenAI
    "gpt-4o": 128000,
    "gpt-4o-mini": 128000,
    "gpt-4-turbo": 128000,
    "gpt-4": 8192,
    "gpt-3.5-turbo": 16385,
    // Claude
    "claude-3-opus": 200000,
    "claude-3-sonnet": 200000,
    "claude-3-haiku": 200000,
    // Together AI
    "llama-3-70b-instruct": 8192,
    "llama-3-8b-instruct": 8192,
    "mixtral-8x7b-instruct": 32768,
    "mistral-medium": 32768,
    // Default for unknown models
    "default": 4096,
  };

  // Check if model is in the known list
  const modelName = model.toLowerCase();
  for (const [knownModel, contextLength] of Object.entries(contextLengths)) {
    if (modelName.includes(knownModel.toLowerCase())) {
      return contextLength;
    }
  }

  // Return default context length
  return contextLengths.default;
};

/**
 * Creates a structured prompt for analyzing UI design
 * @param imageDescription - Optional text description of the UI design
 * @returns Structured prompt for the AI model
 */
export const createAnalysisPrompt = (imageDescription?: string): string => {
  const basePrompt = `
  Analyze this UI design and identify its key components, layout structure, and design patterns.
  
  Provide the following information:
  
  1. Overall layout structure (e.g., grid, flexbox, columns, rows)
  2. Main components identified (navigation, cards, forms, etc.)
  3. Color scheme and typography observations
  4. Responsive design considerations
  5. Component hierarchy and relationships
  6. Suggested structure for a Next.js implementation
  
  For the Next.js implementation, include recommended:
  - Component breakdown (which parts should be separate components)
  - Directory structure
  - Key libraries/dependencies
  - Styling approach (Tailwind, CSS Modules, etc.)
  `;

  if (imageDescription) {
    return `
    ${basePrompt}
    
    Additional context provided by the user:
    "${imageDescription}"
    
    Please incorporate this description into your analysis.
    `;
  }

  return basePrompt;
};

/**
 * Creates a structured prompt for generating project files based on analysis
 * @param analysis - The AI analysis result
 * @returns Structured prompt for the AI model
 */
export const createGenerationPrompt = (analysis: string): string => {
  return `
  Based on the following UI design analysis, generate the necessary project files for a Next.js implementation:
  
  ${analysis}
  
  Please create Markdown files for each component or significant file needed, including:
  
  1. Component structure
  2. Props and interfaces
  3. Styling with Tailwind CSS
  4. Any necessary imports
  5. Brief explanation of the component's purpose and functionality
  
  Format each file as a separate markdown block with a title and code section.
  For example:
  
  # Component: Header.tsx
  \`\`\`tsx
  // Code goes here
  \`\`\`
  
  # Component: Card.tsx
  \`\`\`tsx
  // Code goes here
  \`\`\`
  
  Focus on creating a clean, maintainable, and accessible implementation using modern React best practices.
  `;
};
