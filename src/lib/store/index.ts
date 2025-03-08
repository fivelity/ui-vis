import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AIModelConfig, AIProcessingResult, DesignInput, GeneratedFile } from '../types';

/**
 * Helper function to safely check if we're in a browser environment
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * UI state for theme and accessibility preferences
 */
interface UIState {
  isDarkMode: boolean;
  isReducedMotion: boolean;
  setDarkMode: (isDark: boolean) => void;
  setReducedMotion: (isReduced: boolean) => void;
  checkReducedMotion: () => void;
  toggleDarkMode: () => void;
  toggleReducedMotion: () => void;
}

/**
 * Project state for managing current project and files
 */
interface ProjectState {
  currentProject: {
    id?: string;
    name?: string;
    files: GeneratedFile[];
    lastUpdated?: string;
  };
  projectHistory: Array<{
    id: string;
    name: string;
    lastUpdated: string;
    fileCount: number;
  }>;
  setCurrentProject: (project: { id?: string; name?: string; files: GeneratedFile[] }) => void;
  addOrUpdateFile: (file: GeneratedFile) => void;
  removeFile: (fileId: string) => void;
  addToHistory: (project: { id: string; name: string; fileCount: number }) => void;
  clearHistory: () => void;
}

/**
 * AI processing state for tracking inputs, configurations and results
 */
interface AIState {
  currentInput: DesignInput | null;
  currentConfig: AIModelConfig | null;
  currentAnalysis: AIProcessingResult | null;
  analysisProgress: number;
  generationProgress: number;
  confidenceLevels: Record<string, number>;
  isProcessing: boolean;
  setCurrentInput: (input: DesignInput | null) => void;
  setCurrentConfig: (config: AIModelConfig | null) => void;
  setCurrentAnalysis: (analysis: AIProcessingResult | null) => void;
  setAnalysisProgress: (progress: number) => void;
  setGenerationProgress: (progress: number) => void;
  setConfidenceLevels: (levels: Record<string, number>) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  reset: () => void;
}

/**
 * UI state store for theme and accessibility preferences
 * Uses localStorage persistence with manual hydration check
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      isReducedMotion: false,
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
      setReducedMotion: (isReduced) => set({ isReducedMotion: isReduced }),
      checkReducedMotion: () => {
        if (isBrowser() && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          set({ isReducedMotion: true });
        }
      },
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleReducedMotion: () => set((state) => ({ isReducedMotion: !state.isReducedMotion })),
    }),
    {
      name: 'ui-vis-ui-preferences',
      storage: createJSONStorage(() => {
        // Handle localStorage unavailability (private mode, etc.)
        try {
          if (!isBrowser()) {
            throw new Error('localStorage is not available in server environment');
          }
          return localStorage;
        } catch (error) {
          console.error('Failed to access localStorage:', error);
          return {
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null,
          };
        }
      }),
      // Manual hydration in ThemeProvider
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        isReducedMotion: state.isReducedMotion,
      }),
    }
  )
);

/**
 * Project state store for managing the current project and its files
 * Persists to localStorage with error handling
 */
export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      currentProject: {
        id: undefined,
        name: undefined,
        files: [],
        lastUpdated: undefined,
      },
      projectHistory: [],
      setCurrentProject: (project) => set({
        currentProject: {
          ...project,
          lastUpdated: new Date().toISOString(),
        }
      }),
      addOrUpdateFile: (file) => set((state) => {
        // Check if file already exists
        const fileExists = state.currentProject.files.some(f => f.id === file.id);
        
        let updatedFiles;
        if (fileExists) {
          // Update existing file
          updatedFiles = state.currentProject.files.map(f => {
            if (f.id === file.id) {
              return {
                ...f,
                ...file,
                lastUpdated: new Date().toISOString(),
              };
            }
            return f;
          });
        } else {
          // Add new file
          updatedFiles = [
            ...state.currentProject.files,
            {
              ...file,
              lastUpdated: new Date().toISOString(),
            }
          ];
        }
        
        return {
          currentProject: {
            ...state.currentProject,
            files: updatedFiles,
            lastUpdated: new Date().toISOString(),
          }
        };
      }),
      removeFile: (fileId) => set((state) => ({
        currentProject: {
          ...state.currentProject,
          files: state.currentProject.files.filter(f => f.id !== fileId),
          lastUpdated: new Date().toISOString(),
        }
      })),
      addToHistory: (project) => set((state) => {
        // Check if project already exists in history
        const exists = state.projectHistory.some(p => p.id === project.id);
        
        if (exists) {
          // Update existing project
          return {
            projectHistory: state.projectHistory.map(p => {
              if (p.id === project.id) {
                return {
                  ...project,
                  lastUpdated: new Date().toISOString(),
                };
              }
              return p;
            })
          };
        } else {
          // Add new project to history
          return {
            projectHistory: [
              ...state.projectHistory,
              {
                ...project,
                lastUpdated: new Date().toISOString(),
              }
            ]
          };
        }
      }),
      clearHistory: () => set({ projectHistory: [] }),
    }),
    {
      name: 'ui-vis-project-storage',
      storage: createJSONStorage(() => {
        try {
          if (!isBrowser()) {
            throw new Error('localStorage is not available in server environment');
          }
          return localStorage;
        } catch (error) {
          console.error('Failed to access localStorage:', error);
          return {
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null,
          };
        }
      }),
      partialize: (state) => ({ 
        currentProject: state.currentProject,
        projectHistory: state.projectHistory,
      }), 
    }
  )
);

/**
 * AI state store for tracking AI processing state
 * Not persisted between sessions
 */
export const useAIStore = create<AIState>()((set) => ({
  currentInput: null,
  currentConfig: null,
  currentAnalysis: null,
  analysisProgress: 0,
  generationProgress: 0,
  confidenceLevels: {},
  isProcessing: false,
  setCurrentInput: (input) => set({ currentInput: input }),
  setCurrentConfig: (config) => set({ currentConfig: config }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setAnalysisProgress: (progress) => set({ analysisProgress: progress }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setConfidenceLevels: (levels) => set({ confidenceLevels: levels }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  reset: () => set({
    currentInput: null,
    currentConfig: null,
    currentAnalysis: null,
    analysisProgress: 0,
    generationProgress: 0,
    confidenceLevels: {},
    isProcessing: false,
  }),
}));
