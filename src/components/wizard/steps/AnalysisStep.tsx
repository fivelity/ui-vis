"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, AlertCircle, ImageIcon, FileText, BrainCircuit, Zap, ArrowRight, TextIcon, Cog, RotateCw, CheckCircle } from 'lucide-react';
import { DesignInput, AIModelConfig, AIProcessingResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MotionSection, StaggerItem } from '@/components/animation/MotionSection';
import { ImmersiveCard } from '@/components/3d/ImmersiveCard';
import { getModelDisplayName } from '@/lib/ai/utils';
import { useUIStore } from '@/lib/store';

interface AnalysisStepProps {
  input: DesignInput | null;
  config: AIModelConfig | null;
  analysis: AIProcessingResult | null;
  progress: number;
  isProcessing: boolean;
}

export function AnalysisStep({
  input,
  config,
  analysis,
  progress,
  isProcessing
}: AnalysisStepProps) {
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasImage = input?.type === 'image';
  const hasText = input?.type === 'text';
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Map of element types to confidence levels (for visualization)
  const confidenceLevels = analysis?.confidence || {
    'layout': 0.92,
    'components': 0.85,
    'colors': 0.78,
    'typography': 0.88,
    'interactions': 0.72,
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 space-y-4">
        <h3 className="text-lg font-medium">Design Analysis</h3>
        
        {!analysis && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isProcessing 
                ? "Analyzing your design input with AI..." 
                : "Click 'Start Analysis' to begin processing your design input"
              }
            </p>
            
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Processing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Input summary */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Input Source</p>
          <Card className="overflow-hidden">
            <CardContent className="p-3 flex items-center gap-3">
              {input?.type === 'image' ? (
                <>
                  <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden border">
                    <img 
                      src={input.content} 
                      alt="Design input" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{input.filename || 'Image'}</p>
                    <p className="text-xs text-muted-foreground">Visual design input</p>
                  </div>
                  <ImageIcon className="ml-auto text-muted-foreground h-5 w-5" />
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden border bg-muted flex items-center justify-center">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Text Description</p>
                    <p className="text-xs text-muted-foreground">
                      {input?.content 
                        ? `${input.content.substring(0, 40)}${input.content.length > 40 ? '...' : ''}`
                        : 'No content provided'
                      }
                    </p>
                  </div>
                  <FileText className="ml-auto text-muted-foreground h-5 w-5" />
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Config summary */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Analysis Configuration</p>
          <Card className="overflow-hidden">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden border bg-primary/10 flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{config?.provider || 'AI Provider'}</p>
                <p className="text-xs text-muted-foreground">
                  Model: {getModelDisplayName(config?.provider || '', config?.model || '') || 'Not selected'} • 
                  Temperature: {config?.temperature ? config.temperature.toFixed(1) : '0.7'} • 
                  Max Tokens: {config?.maxTokens || '4000'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {analysis ? (
        <MotionSection preset="fadeIn" staggerItems>
          <div className="space-y-6">
            <StaggerItem>
              <div className="flex items-center gap-2 text-green-500 mb-4">
                <Check className="h-5 w-5" />
                <span className="font-medium">Analysis Complete</span>
              </div>
            </StaggerItem>
            
            <StaggerItem>
              <ImmersiveCard
                depth={0.05}
                intensity={0.4}
                className="p-4"
              >
                <h4 className="font-medium mb-4">Confidence Levels</h4>
                <div className="space-y-4">
                  {Object.entries(confidenceLevels).map(([element, confidence]) => (
                    <div key={element} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{element}</span>
                        <span className={cn(
                          confidence >= 0.8 ? 'text-green-500' : 
                          confidence >= 0.6 ? 'text-amber-500' : 
                          'text-red-500'
                        )}>
                          {Math.round(confidence * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            confidence >= 0.8 ? 'bg-green-500' : 
                            confidence >= 0.6 ? 'bg-amber-500' : 
                            'bg-red-500'
                          )}
                          style={{ width: `${confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ImmersiveCard>
            </StaggerItem>
            
            <StaggerItem>
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">Analysis Summary</h4>
                <p className="text-sm text-muted-foreground">
                  {analysis?.summary || 
                    "The AI has analyzed your design input and identified key UI components, layout structure, color scheme, and potential interactions. This analysis will be used to generate project files in the next step."}
                </p>
              </div>
            </StaggerItem>
          </div>
        </MotionSection>
      ) : isProcessing ? (
        <motion.div
          className="flex flex-col items-center justify-center p-12"
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
          <p className="text-center font-medium mb-1">Processing your design</p>
          <p className="text-center text-sm text-muted-foreground">
            This may take a minute...
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center p-12 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-center">Click "Start Analysis" to begin</p>
        </motion.div>
      )}
    </div>
  );
}

export default AnalysisStep;
