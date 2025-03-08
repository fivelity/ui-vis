"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { DesignInput, AIModelConfig, AIProcessingResult } from "@/lib/types";
import { analyzeDesign, streamingAnalyzeDesign } from "@/lib/ai/services";

interface AIProcessorProps {
  input: DesignInput;
  modelConfig: AIModelConfig;
  onProcessingComplete: (result: AIProcessingResult) => void;
  onProcessingError: (error: Error) => void;
}

/**
 * AIProcessor component responsible for handling the AI processing of design inputs
 */
export function AIProcessor({
  input,
  modelConfig,
  onProcessingComplete,
  onProcessingError,
}: AIProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Ready to analyze design");
  const [streamedOutput, setStreamedOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIProcessingResult | null>(null);
  const [isUsingStreaming, setIsUsingStreaming] = useState(false);

  // Handler for starting the AI processing
  const handleStartProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setStreamedOutput("");
    setResult(null);

    try {
      // Validate input
      if (!input.imageFile && !input.textDescription) {
        throw new Error("Please provide an image or text description");
      }

      // Show what's being processed
      let processingMessage = "Processing";
      if (input.imageFile && input.textDescription) {
        processingMessage += " image and text description";
      } else if (input.imageFile) {
        processingMessage += " image";
      } else if (input.textDescription) {
        processingMessage += " text description";
      }
      setStatusMessage(processingMessage);

      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 1000);

      // Use streaming API if enabled
      if (isUsingStreaming) {
        try {
          // Get streaming generator
          const streamGenerator = streamingAnalyzeDesign(input, modelConfig);
          
          // Process stream chunks
          let fullOutput = "";
          for await (const chunk of streamGenerator) {
            fullOutput += chunk;
            setStreamedOutput(fullOutput);
            
            // Update progress based on expected output length
            const estimatedProgress = Math.min(
              90, 
              (fullOutput.length / 2000) * 100 // Assuming average output is around 2000 chars
            );
            setProgress(estimatedProgress);
          }
          
          // Create result object from streamed content
          const analysisResult: AIProcessingResult = {
            analysis: fullOutput,
            metadata: {
              model: modelConfig.model,
              provider: modelConfig.provider,
              timestamp: new Date().toISOString(),
            }
          };
          
          setResult(analysisResult);
          setProgress(100);
          setStatusMessage("Analysis complete");
          onProcessingComplete(analysisResult);
        } catch (streamError) {
          const errorMessage = streamError instanceof Error 
            ? streamError.message 
            : "An error occurred during streaming analysis";
          
          setError(errorMessage);
          setStatusMessage("Analysis failed");
          onProcessingError(new Error(errorMessage));
        }
      } else {
        // Use standard non-streaming API
        const analysisResult = await analyzeDesign(input, modelConfig);
        setResult(analysisResult);
        setProgress(100);
        setStatusMessage("Analysis complete");
        onProcessingComplete(analysisResult);
      }

      // Clear the progress interval
      clearInterval(progressInterval);
    } catch (error) {
      console.error("Error processing design:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      setStatusMessage("Analysis failed");
      setProgress(0);
      onProcessingError(new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-start processing when component mounts
  useEffect(() => {
    handleStartProcessing();
  }, []);

  // Animation variants for the card
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="w-full"
    >
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
          <CardDescription>
            Analyzing your design using {modelConfig.provider} / {modelConfig.model}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">{statusMessage}</span>
              <span className="text-sm">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {isProcessing && (
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

          {streamedOutput && (
            <div className="rounded-md border bg-muted/50 p-4 max-h-[300px] overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">{streamedOutput}</pre>
            </div>
          )}

          {result && !streamedOutput && (
            <div className="rounded-md border bg-muted/50 p-4 max-h-[300px] overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">{result.analysis}</pre>
            </div>
          )}

          {result && (
            <div className="flex justify-center">
              <div className="bg-primary/10 text-primary flex items-center gap-2 px-3 py-1.5 rounded-md">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Analysis complete</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="use-streaming"
              checked={isUsingStreaming}
              onChange={(e) => setIsUsingStreaming(e.target.checked)}
              disabled={isProcessing}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="use-streaming" className="text-sm">
              Use streaming (see results in real-time)
            </label>
          </div>
          <Button
            onClick={handleStartProcessing}
            disabled={isProcessing || (result && !error)}
          >
            {isProcessing ? "Processing..." : error ? "Retry Analysis" : "Start Analysis"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default AIProcessor;
