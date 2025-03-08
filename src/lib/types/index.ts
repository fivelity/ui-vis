/**
 * Core type definitions for UI Vispro Image-to-Project Files Generator
 */

// Input types for the UI generation
export interface DesignInput {
  imageFile?: File;
  textDescription?: string;
}

// AI model configuration types
export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'togetherai' | 'ollama' | 'lmstudio' | string;
  modelId: string;
  capabilities: ('vision' | 'text-to-markdown' | 'all')[];
  apiKey?: string;
  endpoint?: string;
}

// Settings for the application
export interface AppSettings {
  visionModel: AIModelConfig;
  generationModel: AIModelConfig;
  preferredOutputFormat: 'markdown' | 'json';
  maxTokens: number;
  temperature: number;
}

// Generated file types
export interface GeneratedFile {
  id: string;
  name: string;
  content: string;
  path: string;
  type: 'markdown' | 'json';
}

// Project version for tracking revisions
export interface ProjectVersion {
  id: string;
  name: string;
  createdAt: Date;
  input: DesignInput;
  settings: AppSettings;
  files: GeneratedFile[];
  feedback?: string;
}

// User feedback for revisions
export interface RevisionFeedback {
  versionId: string;
  feedback: string;
  files?: { id: string; feedback: string }[];
}

// AI processing result
export interface AIProcessingResult {
  visionAnalysis?: string;
  generatedFiles: GeneratedFile[];
  metadata?: Record<string, any>;
}
