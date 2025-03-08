"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, CheckCircle2, Copy, Download, RefreshCw } from "lucide-react";
import { AIModelConfig, AIProcessingResult, GeneratedFile } from "@/lib/types";
import { generateProjectFiles } from "@/lib/ai/services";
import { toast } from "sonner";

interface FileGeneratorProps {
  aiResult: AIProcessingResult;
  modelConfig: AIModelConfig;
  onGenerationComplete: (files: GeneratedFile[]) => void;
  onGenerationError: (error: Error) => void;
}

/**
 * FileGenerator component for generating project setup files based on AI analysis
 */
export function FileGenerator({
  aiResult,
  modelConfig,
  onGenerationComplete,
  onGenerationError,
}: FileGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Ready to generate files");
  const [error, setError] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[] | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // Run the file generation process
  const handleGenerateFiles = async () => {
    if (!aiResult.analysis) {
      toast.error("No analysis results available to generate files from");
      setError("No analysis results available to generate files from");
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(0);
      setError(null);
      setStatusMessage("Initializing file generation...");

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 1000);

      // Set status messages at intervals to show progress
      const statusUpdateInterval = setInterval(() => {
        const statusMessages = [
          "Analyzing design elements...",
          "Creating component structure...",
          "Generating TypeScript files...",
          "Adding styling with Tailwind CSS...",
          "Optimizing code for performance...",
          "Finalizing project files..."
        ];
        
        const randomIndex = Math.floor(Math.random() * statusMessages.length);
        setStatusMessage(statusMessages[randomIndex]);
      }, 3000);

      // Actual file generation process
      const files = await generateProjectFiles(aiResult.analysis, modelConfig);

      // Clear intervals
      clearInterval(progressInterval);
      clearInterval(statusUpdateInterval);

      // Set final progress
      setProgress(100);
      setStatusMessage("Generation complete!");
      setGeneratedFiles(files);
      onGenerationComplete(files);
      
    } catch (error) {
      console.error("File generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      setStatusMessage("Generation failed");
      setProgress(0);
      onGenerationError(new Error(errorMessage));
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to handle file download
  const handleDownloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`File ${file.name} downloaded successfully`);
  };

  // Animation variants for card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  // File content with syntax highlighting
  const renderFileContent = (file: GeneratedFile) => {
    return (
      <pre className="text-sm p-4 overflow-auto bg-muted rounded-md whitespace-pre-wrap" 
           aria-label={`Code content for ${file.name}`}>
        {file.content}
      </pre>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="w-full"
    >
      <Card>
        <CardHeader>
          <CardTitle>Project File Generator</CardTitle>
          <CardDescription>
            Generate project files based on AI analysis using {modelConfig.provider} / {modelConfig.model}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!generatedFiles ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{statusMessage}</span>
                  <span className="text-sm">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {isGenerating && (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 p-4 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Error occurred</h4>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              )}

              {!isGenerating && !error && (
                <div className="space-y-4">
                  <p className="text-sm">
                    Generate production-ready project files based on the AI analysis:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>TypeScript React components</li>
                    <li>Tailwind CSS styling</li>
                    <li>Accessible UI elements</li>
                    <li>Modern animation with Framer Motion</li>
                    <li>Next.js project structure</li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <Tabs defaultValue={generatedFiles[0].id} className="w-full">
                <TabsList className="grid grid-flow-col auto-cols-fr mb-4 overflow-auto">
                  {generatedFiles.map((file, index) => (
                    <TabsTrigger
                      key={file.id}
                      value={file.id}
                      onClick={() => setSelectedFileIndex(index)}
                      className="text-xs md:text-sm"
                      aria-label={`Select ${file.name}`}
                    >
                      {file.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {generatedFiles.map((file) => (
                  <TabsContent key={file.id} value={file.id} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-3">
                        <h3 className="text-md font-medium">{file.name}</h3>
                        {file.description && (
                          <p className="text-sm text-muted-foreground mt-1">{file.description}</p>
                        )}
                      </div>
                      
                      {renderFileContent(file)}
                    </motion.div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(file.content);
                          toast.success("File content copied to clipboard");
                        }}
                        className="text-xs"
                        aria-label={`Copy ${file.name} to clipboard`}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => handleDownloadFile(file)}
                        className="text-xs"
                        aria-label={`Download ${file.name}`}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              
              <div className="flex justify-center mt-4">
                <div className="bg-primary/10 text-primary flex items-center gap-2 px-3 py-1.5 rounded-md">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {generatedFiles.length} file{generatedFiles.length !== 1 ? 's' : ''} generated successfully
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          {!generatedFiles ? (
            <Button 
              onClick={handleGenerateFiles} 
              disabled={isGenerating || !aiResult.analysis}
              aria-label="Generate project files"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : error ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Generation
                </>
              ) : (
                "Generate Project Files"
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleGenerateFiles} 
              variant="outline"
              aria-label="Regenerate project files"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Files
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default FileGenerator;
