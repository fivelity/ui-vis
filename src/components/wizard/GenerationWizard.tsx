"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useUIStore, useAIStore } from '@/lib/store';
import { DropZone } from '@/components/upload/DropZone';
import { analyzeDesign, generateProjectFiles } from '@/lib/ai/services';
import { DesignInput, AIModelConfig } from '@/lib/types';

// Step components
import InputStep from './steps/InputStep';
import ConfigStep from './steps/ConfigStep';
import AnalysisStep from './steps/AnalysisStep';
import GenerationStep from './steps/GenerationStep';
import ResultsStep from './steps/ResultsStep';

// Define wizard steps
const steps = [
  { id: 'input', title: 'Input' },
  { id: 'config', title: 'Configuration' },
  { id: 'analysis', title: 'Analysis' },
  { id: 'generation', title: 'Generation' },
  { id: 'results', title: 'Results' }
];

interface GenerationWizardProps {
  onComplete?: (projectId: string) => void;
  className?: string;
}

export function GenerationWizard({ onComplete, className }: GenerationWizardProps) {
  // Get state from global stores
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  const {
    currentInput,
    currentConfig,
    currentAnalysis,
    analysisProgress,
    generationProgress,
    isProcessing,
    setCurrentInput,
    setCurrentConfig,
    setCurrentAnalysis,
    setAnalysisProgress,
    setGenerationProgress,
    setIsProcessing
  } = useAIStore();

  // Local wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Clear error when step changes
  useEffect(() => {
    setError(null);
  }, [currentStep]);

  // Handle next step logic
  const handleNext = async () => {
    setError(null);

    try {
      // Validate current step before proceeding
      if (currentStep === 0 && !currentInput) {
        setError('Please provide an image or text description');
        return;
      }

      if (currentStep === 1 && !currentConfig) {
        setError('Please select an AI configuration');
        return;
      }

      // Process analysis step
      if (currentStep === 2 && currentInput && currentConfig && !currentAnalysis) {
        setIsProcessing(true);
        
        // Start progress simulation
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 5;
          if (progress > 95) {
            progress = 95;
            clearInterval(interval);
          }
          setAnalysisProgress(progress);
        }, 300);
        
        try {
          const result = await analyzeDesign(currentInput, currentConfig);
          setCurrentAnalysis(result);
          setAnalysisProgress(100);
          clearInterval(interval);
        } catch (err) {
          clearInterval(interval);
          console.error("Generation wizard caught error:", err);
          
          // Provide more detailed error information to the user
          let errorMessage = 'Failed to analyze design';
          
          if (err instanceof Error) {
            errorMessage = `Error: ${err.message}`;
            
            // Check for specific error conditions
            if (err.message.includes('API key')) {
              errorMessage = `Missing or invalid API key for ${currentConfig?.provider}. Please check your environment variables.`;
            } else if (err.message.includes('network') || err.message.includes('connection')) {
              errorMessage = `Network error connecting to ${currentConfig?.provider}. Please check your internet connection.`;
            }
          }
          
          setError(errorMessage);
          setAnalysisProgress(0);
          setIsProcessing(false);
          return;
        }
        
        setIsProcessing(false);
      }

      // Process generation step
      if (currentStep === 3 && currentAnalysis && !generatedFiles.length) {
        setIsProcessing(true);
        
        // Start progress simulation
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 5;
          if (progress > 95) {
            progress = 95;
            clearInterval(interval);
          }
          setGenerationProgress(progress);
        }, 300);
        
        try {
          const files = await generateProjectFiles(
            currentAnalysis.analysis,
            currentConfig!,
            projectName || `UI Project ${new Date().toLocaleDateString()}`,
            projectDescription || 'Generated from UI Vis'
          );
          
          setGeneratedFiles(files);
          setGenerationProgress(100);
          clearInterval(interval);
        } catch (err) {
          clearInterval(interval);
          setError(err instanceof Error ? err.message : 'Failed to generate files');
          setGenerationProgress(0);
          setIsProcessing(false);
          return;
        }
        
        setIsProcessing(false);
      }

      // Move to next step
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else if (onComplete && generatedFiles.length > 0) {
        // Handle wizard completion
        onComplete(generatedFiles[0]?.id || 'unknown');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  // Handle going back to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Dynamic button text based on current step
  const getNextButtonText = () => {
    if (currentStep === steps.length - 1) return 'Finish';
    if (currentStep === 2 && !currentAnalysis) return 'Start Analysis';
    if (currentStep === 3 && !generatedFiles.length) return 'Generate Files';
    return 'Next';
  };

  // Check if next is disabled
  const isNextDisabled = () => {
    if (isProcessing) return true;
    if (currentStep === 0 && !currentInput) return true;
    if (currentStep === 1 && !currentConfig) return true;
    if (currentStep === 2 && !currentAnalysis && !isProcessing) return false;
    if (currentStep === 3 && !generatedFiles.length && !isProcessing) return false;
    return false;
  };

  // Animation variants
  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  // Get current step component
  const getStepComponent = () => {
    switch (steps[currentStep].id) {
      case 'input':
        return (
          <InputStep 
            input={currentInput}
            setInput={setCurrentInput}
            projectName={projectName}
            setProjectName={setProjectName}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
          />
        );
      case 'config':
        return (
          <ConfigStep 
            config={currentConfig}
            setConfig={setCurrentConfig}
          />
        );
      case 'analysis':
        return (
          <AnalysisStep 
            input={currentInput}
            config={currentConfig}
            analysis={currentAnalysis}
            progress={analysisProgress}
            isProcessing={isProcessing}
          />
        );
      case 'generation':
        return (
          <GenerationStep 
            analysis={currentAnalysis}
            progress={generationProgress}
            isProcessing={isProcessing}
            generatedFiles={generatedFiles}
          />
        );
      case 'results':
        return (
          <ResultsStep 
            generatedFiles={generatedFiles}
            projectName={projectName}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Generate Project Files</CardTitle>
        
        {/* Progress indicator */}
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`transition-colors duration-200 ${
                  currentStep >= index ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-primary"
              initial={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={isReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 100, damping: 15 }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        {/* Step content with animation */}
        <AnimatePresence mode="wait" initial={false} custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={!isReducedMotion ? pageVariants : undefined}
            initial="enter"
            animate="center"
            exit="exit"
            transition={isReducedMotion ? { duration: 0.15 } : { 
              type: 'spring', 
              stiffness: 300, 
              damping: 30 
            }}
          >
            {getStepComponent()}
          </motion.div>
        </AnimatePresence>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-destructive text-sm mt-4 p-2 border border-destructive/30 rounded bg-destructive/10"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isProcessing}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={isNextDisabled()}
        >
          {getNextButtonText()}
          {currentStep < steps.length - 1 ? (
            <ChevronRight className="ml-1 h-4 w-4" />
          ) : (
            <Check className="ml-1 h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default GenerationWizard;
