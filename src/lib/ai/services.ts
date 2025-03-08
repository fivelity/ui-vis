/**
 * AI Services for image interpretation and file generation
 * Handles the core AI functionality for analyzing images and generating project files
 */

import { AIModelConfig, AIProcessingResult, DesignInput, GeneratedFile } from '../types';
import { initializeProvider } from './providers';
import { getNormalizedModelName } from './models';
import { v4 as uuidv4 } from "uuid";
import {
  imageToBase64,
  formatImageForOpenAI,
  formatImageForTogetherAI,
  formatImageForLMStudio,
  formatImageForOllama,
} from "./utils";
import {
  getAnalysisSystemPrompt,
  getGenerationSystemPrompt,
  getOptimalParameters,
  createOptimizedAnalysisPrompt,
  createOptimizedGenerationPrompt
} from "./prompts";
import {
  getCachedAnalysis,
  cacheAnalysisResult,
  getCachedGeneration,
  cacheGeneratedFiles
} from "../cache/cacheService";
import {
  saveFilesToLocalStorage,
  getStoredProject,
  updateStoredProject
} from "../storage/fileStorage";

/**
 * Analyze design using AI based on image and/or text description
 * @param input - Design input containing image and/or text description
 * @param modelConfig - AI model configuration
 * @returns Promise resolving to AI processing result
 */
export async function analyzeDesign(
  input: DesignInput,
  modelConfig: AIModelConfig
): Promise<AIProcessingResult> {
  try {
    // Check if we have valid input
    if (!input.imageFile && !input.textDescription) {
      throw new Error("No input provided. Please provide an image or text description.");
    }

    // Check cache first to avoid redundant API calls
    const cachedResult = getCachedAnalysis(
      { 
        imageHash: input.imageFile ? await imageToBase64(input.imageFile) : null,
        text: input.textDescription
      },
      modelConfig.provider,
      modelConfig.model
    );
    
    // Return cached result if available
    if (cachedResult) {
      console.log("Using cached analysis result");
      return cachedResult;
    }

    // Initialize the appropriate AI provider
    const provider = initializeProvider(modelConfig);
    
    // Create messages array
    const messages: any[] = [];
    
    // Create the system prompt optimized for the provider
    const systemPrompt = getAnalysisSystemPrompt(modelConfig.provider);
    messages.push({ role: "system", content: systemPrompt });
    
    // Create user message content
    const userMessage: any = { role: "user" };
    
    // If we have an image, process it based on provider
    if (input.imageFile) {
      const base64Image = await imageToBase64(input.imageFile);
      
      // Format content array based on provider
      let content: any[] = [];
      
      switch (modelConfig.provider.toLowerCase()) {
        case "openai": {
          content = [
            { type: "text", text: createOptimizedAnalysisPrompt(modelConfig.provider, input.textDescription) },
            formatImageForOpenAI(base64Image)
          ];
          break;
        }
        case "togetherai": {
          content = [
            { type: "text", text: createOptimizedAnalysisPrompt(modelConfig.provider, input.textDescription) },
            formatImageForTogetherAI(base64Image)
          ];
          break;
        }
        case "lmstudio": {
          content = [
            { type: "text", text: createOptimizedAnalysisPrompt(modelConfig.provider, input.textDescription) },
            formatImageForLMStudio(base64Image)
          ];
          break;
        }
        case "ollama": {
          // Ollama API expects a different format
          userMessage.content = createOptimizedAnalysisPrompt(modelConfig.provider, input.textDescription);
          userMessage.images = [formatImageForOllama(base64Image)];
          break;
        }
        default:
          throw new Error(`Provider ${modelConfig.provider} does not support image input`);
      }
      
      // If content array is populated (not Ollama), set it
      if (content.length > 0) {
        userMessage.content = content;
      }
    } else if (input.textDescription) {
      // Text-only input
      userMessage.content = createOptimizedAnalysisPrompt(modelConfig.provider, input.textDescription);
    }
    
    // Add user message to messages array
    messages.push(userMessage);
    
    // Get optimized parameters for this provider/model
    const optimizedParams = getOptimalParameters(modelConfig.provider, modelConfig.model);
    
    // Call the AI provider based on type
    let analysisText = "";
    
    switch (modelConfig.provider.toLowerCase()) {
      case "openai": {
        const openai = provider;
        const response = await openai.chat.completions.create({
          model: modelConfig.model,
          messages,
          temperature: modelConfig.temperature || optimizedParams.temperature,
          max_tokens: modelConfig.maxTokens || optimizedParams.max_tokens,
          top_p: optimizedParams.top_p,
          frequency_penalty: optimizedParams.frequency_penalty,
          presence_penalty: optimizedParams.presence_penalty,
          stream: false
        });
        analysisText = response.choices[0].message.content || "";
        break;
      }
      case "togetherai": {
        const togetherAI = provider;
        const normalizedModel = getNormalizedModelName(modelConfig.provider, modelConfig.model);
        const response = await togetherAI.chat.completions.create({
          model: normalizedModel,
          messages,
          temperature: modelConfig.temperature || optimizedParams.temperature,
          max_tokens: modelConfig.maxTokens || optimizedParams.max_tokens,
          top_p: optimizedParams.top_p,
          top_k: optimizedParams.top_k,
          repetition_penalty: optimizedParams.repetition_penalty,
          stream: false
        });
        analysisText = response.choices[0].message.content || "";
        break;
      }
      case "lmstudio": {
        const lmStudio = provider;
        const response = await lmStudio.chat.completions.create({
          model: modelConfig.model,
          messages,
          temperature: modelConfig.temperature || optimizedParams.temperature,
          max_tokens: modelConfig.maxTokens || optimizedParams.max_tokens,
          top_p: optimizedParams.top_p,
          top_k: optimizedParams.top_k,
          repetition_penalty: optimizedParams.repetition_penalty,
          stream: false
        });
        analysisText = response.choices[0].message.content || "";
        break;
      }
      case "ollama": {
        const ollama = provider;
        const response = await ollama.chat.completions.create({
          model: modelConfig.model,
          messages,
          temperature: modelConfig.temperature || optimizedParams.temperature,
          max_tokens: modelConfig.maxTokens || optimizedParams.max_tokens,
          top_p: optimizedParams.top_p,
          repeat_penalty: optimizedParams.repeat_penalty,
          stream: false
        });
        analysisText = response.choices[0].message.content || "";
        break;
      }
      default:
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
    }
    
    const result = {
      analysis: analysisText,
      metadata: {
        model: modelConfig.model,
        provider: modelConfig.provider,
        timestamp: new Date().toISOString(),
        id: uuidv4() // Add unique ID for tracking
      }
    };
    
    // Cache the result to avoid redundant API calls in the future
    cacheAnalysisResult(
      { 
        imageHash: input.imageFile ? await imageToBase64(input.imageFile) : null,
        text: input.textDescription
      },
      modelConfig.provider,
      modelConfig.model,
      result
    );
    
    return result;
    
  } catch (error) {
    // Improved error logging with better details
    if (error instanceof Error) {
      console.error("Error analyzing design:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw new Error(`Failed to analyze design: ${error.message}`);
    } else {
      console.error("Error analyzing design:", error);
      throw new Error("Failed to analyze design: Unknown error");
    }
  }
}

/**
 * Generate project files based on AI analysis
 * @param analysis - Analysis result from AI
 * @param modelConfig - AI model configuration
 * @param projectName - Optional project name for storage
 * @param description - Optional project description for storage
 * @returns Promise resolving to array of generated files
 */
export async function generateProjectFiles(
  analysis: string,
  modelConfig: AIModelConfig,
  projectName?: string,
  description?: string
): Promise<GeneratedFile[]> {
  try {
    // Check cache first for already generated files
    const cachedFiles = getCachedGeneration(
      analysis,
      modelConfig.provider,
      modelConfig.model
    );
    
    // Return cached files if available
    if (cachedFiles) {
      console.log("Using cached generated files");
      
      // If project name is provided, save to local storage even if using cached files
      if (projectName) {
        saveFilesToLocalStorage(
          cachedFiles,
          projectName,
          description,
          {
            provider: modelConfig.provider,
            model: modelConfig.model
          }
        );
      }
      
      return cachedFiles;
    }
    
    // Initialize provider
    const provider = initializeProvider(modelConfig);
    
    // Create messages array
    const messages: any[] = [];
    
    // Create system prompt
    const systemPrompt = getGenerationSystemPrompt(modelConfig.provider);
    messages.push({ role: "system", content: systemPrompt });
    
    // Create user message with analysis
    const optimizedPrompt = createOptimizedGenerationPrompt(modelConfig.provider, analysis);
    messages.push({ role: "user", content: optimizedPrompt });
    
    // Get optimized parameters
    const optimizedParams = getOptimalParameters(modelConfig.provider, modelConfig.model);
    
    // Call AI provider
    let generationText = "";
    
    switch (modelConfig.provider.toLowerCase()) {
      case "openai": {
        const openai = provider;
        const response = await openai.chat.completions.create({
          model: modelConfig.model,
          messages,
          temperature: modelConfig.temperature || optimizedParams.temperature,
          max_tokens: modelConfig.maxTokens || optimizedParams.max_tokens,
          top_p: optimizedParams.top_p,
          frequency_penalty: optimizedParams.frequency_penalty,
          presence_penalty: optimizedParams.presence_penalty,
          stream: false
        });
        generationText = response.choices[0].message.content || "";
        break;
      }
      case "togetherai": {
        const togetherAI = provider;
        const normalizedModel = getNormalizedModelName(modelConfig.provider, modelConfig.model);
        const response = await togetherAI.chat.completions.create({
          model: normalizedModel,
          messages,
          temperature: modelConfig.temperature || optimizedParams.temperature,
          max_tokens: modelConfig.maxTokens || optimizedParams.max_tokens,
          top_p: optimizedParams.top_p,
          top_k: optimizedParams.top_k,
          repetition_penalty: optimizedParams.repetition_penalty,
          stream: false
        });
        generationText = response.choices[0].message.content || "";
        break;
      }
      case "lmstudio": {
        const lmStudio = provider;
        const response = await lmStudio.chat.completions.create({
          model: modelConfig.model,
          messages,
          temperature: modelConfig.temperature || optimizedParams.temperature,
          max_tokens: modelConfig.maxTokens || optimizedParams.max_tokens,
          top_p: optimizedParams.top_p,
          top_k: optimizedParams.top_k,
          repetition_penalty: optimizedParams.repetition_penalty,
          stream: false
        });
        generationText = response.choices[0].message.content || "";
        break;
      }
      case "ollama": {
        const ollama = provider;
        const response = await ollama.chat.completions.create({
          model: modelConfig.model,
          messages,
          temperature: modelConfig.temperature || optimizedParams.temperature,
          max_tokens: modelConfig.maxTokens || optimizedParams.max_tokens,
          top_p: optimizedParams.top_p,
          repeat_penalty: optimizedParams.repeat_penalty,
          stream: false
        });
        generationText = response.choices[0].message.content || "";
        break;
      }
      default:
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
    }
    
    // Parse generated files
    const files = parseGeneratedFiles(generationText);
    
    // Cache the generated files
    cacheGeneratedFiles(
      analysis,
      modelConfig.provider,
      modelConfig.model,
      files
    );
    
    // If project name is provided, save to local storage
    if (projectName) {
      saveFilesToLocalStorage(
        files,
        projectName,
        description,
        {
          provider: modelConfig.provider,
          model: modelConfig.model
        }
      );
    }
    
    return files;
  } catch (error) {
    console.error("Error generating files:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate files: ${error.message}`);
    }
    throw new Error("Failed to generate files: Unknown error");
  }
}

/**
 * Process streaming AI response for real-time updates
 */
export async function* streamingAnalyzeDesign(
  input: DesignInput,
  modelConfig: AIModelConfig
): AsyncGenerator<string> {
  try {
    // Check if we have valid input
    if (!input.imageFile && !input.textDescription) {
      throw new Error("No input provided. Please provide an image or text description.");
    }

    // Initialize the appropriate AI provider
    const provider = initializeProvider(modelConfig);
    
    // Create messages array similar to analyzeDesign but setup for streaming
    const messages: any[] = [];
    
    // System prompt optimized for provider
    const systemPrompt = getAnalysisSystemPrompt(modelConfig.provider);
    messages.push({ 
      role: "system", 
      content: systemPrompt
    });
    
    // Create user message content
    const userMessage: any = { role: "user" };
    
    if (input.imageFile) {
      const base64Image = await imageToBase64(input.imageFile);
      
      // Provider-specific image formatting (simplified for streaming example)
      // In a full implementation, replicate the logic from analyzeDesign
      
      // For now just using OpenAI format for simplicity 
      userMessage.content = [
        { type: "text", text: createOptimizedAnalysisPrompt(modelConfig.provider, input.textDescription) },
        formatImageForOpenAI(base64Image)
      ];
    } else if (input.textDescription) {
      userMessage.content = createOptimizedAnalysisPrompt(modelConfig.provider, input.textDescription);
    }
    
    messages.push(userMessage);
    
    // Get optimized parameters
    const optimizedParams = getOptimalParameters(modelConfig.provider, modelConfig.model);
    
    // Initial yield to show starting message
    yield "Starting analysis...\n\n";
    
    // Check if provider supports streaming
    // Currently only implementing OpenAI streaming for demonstration
    if (modelConfig.provider.toLowerCase() === "openai") {
      try {
        const openai = provider;
        const stream = await openai.chat.completions.create({
          model: modelConfig.model,
          messages,
          temperature: modelConfig.temperature || optimizedParams.temperature,
          max_tokens: modelConfig.maxTokens || optimizedParams.max_tokens,
          top_p: optimizedParams.top_p,
          frequency_penalty: optimizedParams.frequency_penalty,
          presence_penalty: optimizedParams.presence_penalty,
          stream: true
        });
        
        for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
            yield chunk.choices[0].delta.content;
          }
        }
      } catch (error) {
        yield `Streaming error: ${error instanceof Error ? error.message : "Unknown error"}`;
        
        // Fall back to non-streaming API
        const result = await analyzeDesign(input, modelConfig);
        yield result.analysis;
      }
    } else {
      // For providers that don't support streaming or haven't been implemented yet
      // fall back to the non-streaming version
      const result = await analyzeDesign(input, modelConfig);
      yield result.analysis;
    }
    
  } catch (error) {
    console.error("Error in streaming analyze design:", error);
    if (error instanceof Error) {
      yield `Error: ${error.message}`;
    } else {
      yield "An unknown error occurred during streaming analysis";
    }
  }
}

/**
 * Process revision request based on user feedback
 * @param originalFiles The original generated files
 * @param feedback User feedback for revisions
 * @param modelConfig The AI model configuration to use
 */
export async function processRevision(
  originalFiles: GeneratedFile[],
  feedback: string,
  modelConfig: AIModelConfig
): Promise<GeneratedFile[]> {
  try {
    const provider = initializeProvider(modelConfig);
    
    // Construct the system prompt for revision
    const systemPrompt = `You are a senior developer who specializes in creating Next.js projects based on UI design analyses. 
    Revise previously generated project files based on user feedback.
    Maintain the same file structure but update the content according to the feedback.`;
    
    // Prepare the original files content to send to the model
    const originalContent = originalFiles
      .map(file => `# ${file.name}\n\n${file.content}`)
      .join('\n\n---\n\n');
    
    // Send the request to the AI model
    const result = await provider.chat.completions.create({
      model: modelConfig.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Original files:\n\n${originalContent}\n\nUser feedback: ${feedback}\n\nPlease provide revised versions of these files.` }
      ],
      temperature: modelConfig.temperature || 0.7,
      max_tokens: modelConfig.maxTokens || 4000,
      stream: false
    });
    
    // Parse the generated content into separate files
    const revisedFiles = parseGeneratedFiles(result.choices[0].message.content || "");
    
    // Preserve IDs and paths from original files
    return revisedFiles.map(file => {
      const originalFile = originalFiles.find(of => of.name === file.name);
      return {
        ...file,
        id: originalFile?.id || file.id,
        path: originalFile?.path || file.path
      };
    });
  } catch (error) {
    console.error('Error processing revision:', error);
    throw error;
  }
}

/**
 * Converts a File object to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Parses the generated content into separate files
 * Expects markdown with file headers like "# filename.md"
 */
function parseGeneratedContent(content: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  
  // Default files if parsing fails
  const defaultFiles = [
    'project-setup.md',
    'folder-structure.md',
    'components.md',
    'styling.md',
    'implementation-plan.md'
  ];
  
  // Try to extract files from content using regex
  const filePattern = /^#\s+([\w-]+\.md)\s*$/gm;
  const matches = [...content.matchAll(filePattern)];
  
  if (matches.length > 0) {
    // Use the matches to split content into files
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const filename = match[1];
      const startIndex = match.index! + match[0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
      
      const fileContent = content.substring(startIndex, endIndex).trim();
      
      files.push({
        id: crypto.randomUUID(),
        name: filename,
        content: fileContent,
        path: `/generated/${filename}`,
        type: 'markdown'
      });
    }
  } else {
    // If no matches found, split content evenly among default files
    const contentPerFile = Math.ceil(content.length / defaultFiles.length);
    
    defaultFiles.forEach((filename, index) => {
      const startIndex = index * contentPerFile;
      const endIndex = Math.min(startIndex + contentPerFile, content.length);
      const fileContent = content.substring(startIndex, endIndex).trim();
      
      files.push({
        id: crypto.randomUUID(),
        name: filename,
        content: fileContent,
        path: `/generated/${filename}`,
        type: 'markdown'
      });
    });
  }
  
  return files;
}
