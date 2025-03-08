"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Check, 
  AlertCircle, 
  FileCode, 
  FileJson, 
  FileText, 
  FileCss as FileStyleIcon, 
  FileJs 
} from 'lucide-react';
import { AIProcessingResult } from '@/lib/types';
import { MotionSection, StaggerItem } from '@/components/animation/MotionSection';
import { useUIStore } from '@/lib/store';

interface GenerationStepProps {
  analysis: AIProcessingResult | null;
  progress: number;
  isProcessing: boolean;
  generatedFiles: any[];
}

export function GenerationStep({
  analysis,
  progress,
  isProcessing,
  generatedFiles
}: GenerationStepProps) {
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  const [filesToGenerate, setFilesToGenerate] = useState<string[]>([]);
  const [generatedFileNames, setGeneratedFileNames] = useState<string[]>([]);
  
  // Simulate files to be generated based on analysis
  useEffect(() => {
    if (analysis) {
      // These would normally come from the analysis result
      setFilesToGenerate([
        'index.html',
        'styles.css',
        'main.js',
        'components.js',
        'package.json',
        'README.md'
      ]);
    }
  }, [analysis]);
  
  // Simulate the generation of files one by one as progress increases
  useEffect(() => {
    if (isProcessing && filesToGenerate.length > 0) {
      const thresholdPerFile = 100 / filesToGenerate.length;
      const filesCompleted = Math.floor(progress / thresholdPerFile);
      
      if (filesCompleted > generatedFileNames.length && filesCompleted <= filesToGenerate.length) {
        const newFiles = filesToGenerate.slice(0, filesCompleted);
        setGeneratedFileNames(newFiles);
      }
    } else if (generatedFiles.length > 0) {
      // When fully complete, show all files
      setGeneratedFileNames(generatedFiles.map(file => file.name || 'unnamed-file'));
    }
  }, [progress, filesToGenerate, generatedFileNames.length, isProcessing, generatedFiles]);
  
  // Get icon for file type
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'html':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'css':
        return <FileStyleIcon className="h-5 w-5 text-blue-500" />;
      case 'js':
        return <FileJs className="h-5 w-5 text-yellow-500" />;
      case 'json':
        return <FileJson className="h-5 w-5 text-green-500" />;
      case 'md':
        return <FileCode className="h-5 w-5 text-purple-500" />;
      default:
        return <FileCode className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 space-y-4">
        <h3 className="text-lg font-medium">File Generation</h3>
        
        {generatedFiles.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isProcessing 
                ? "Generating project files based on the analysis..." 
                : "Click 'Generate Files' to create project files based on the design analysis"
              }
            </p>
            
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Generating...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {generatedFiles.length > 0 ? (
        <MotionSection preset="fadeIn" staggerItems>
          <div className="space-y-6">
            <StaggerItem>
              <div className="flex items-center gap-2 text-green-500 mb-4">
                <Check className="h-5 w-5" />
                <span className="font-medium">Generation Complete</span>
              </div>
            </StaggerItem>
            
            <StaggerItem>
              <div className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted font-medium text-sm">
                  Generated Files ({generatedFiles.length})
                </div>
                <div className="divide-y">
                  {generatedFiles.map((file, index) => (
                    <div key={index} className="p-3 flex items-center gap-3">
                      {getFileIcon(file.name || 'unnamed-file')}
                      <div>
                        <p className="text-sm font-medium">{file.name || 'unnamed-file'}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.type || 'Unknown type'} • {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
            
            <StaggerItem>
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">Generation Summary</h4>
                <p className="text-sm text-muted-foreground">
                  All files have been generated successfully. You can now preview and download the complete project in the next step.
                </p>
              </div>
            </StaggerItem>
          </div>
        </MotionSection>
      ) : isProcessing ? (
        <div className="space-y-6">
          <motion.div
            className="flex flex-col items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative mb-6">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <p className="text-center font-medium mb-1">Generating Files</p>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Creating project structure and components...
            </p>
          </motion.div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>File Generation Progress</span>
                  <span>{generatedFileNames.length}/{filesToGenerate.length} files</span>
                </div>
                
                <div className="space-y-3 mt-4">
                  {filesToGenerate.map((filename, index) => {
                    const isGenerated = generatedFileNames.includes(filename);
                    const isGenerating = !isGenerated && index === generatedFileNames.length;
                    
                    return (
                      <div 
                        key={filename}
                        className="flex items-center gap-3 p-2 rounded-md transition-colors"
                        style={{
                          backgroundColor: isGenerating ? 'rgba(var(--primary), 0.1)' : undefined
                        }}
                      >
                        {getFileIcon(filename)}
                        <span className="text-sm flex-1">{filename}</span>
                        <AnimatePresence mode="wait">
                          {isGenerated ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="h-5 w-5 text-green-500" />
                            </motion.div>
                          ) : isGenerating ? (
                            <motion.div
                              key="spinner"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <Loader2 className="h-5 w-5 text-primary animate-spin" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="waiting"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.5 }}
                              exit={{ opacity: 0 }}
                            >
                              <div className="h-5 w-5 rounded-full border-2 border-muted" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center p-12 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-center">Click "Generate Files" to begin</p>
        </motion.div>
      )}
    </div>
  );
}

export default GenerationStep;
