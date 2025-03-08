"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, Wand2, Zap, Stars, BrainCircuit } from 'lucide-react';
import { AIModelConfig } from '@/lib/types';
import { StaggerItem } from '@/components/animation/MotionSection';

interface ConfigStepProps {
  config: AIModelConfig | null;
  setConfig: (config: AIModelConfig) => void;
}

// Available AI providers
const providers = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    icon: <Stars className="h-5 w-5" />,
    description: 'Best for detailed UI generation with high accuracy',
    models: ['gpt-4-vision', 'gpt-4-turbo']
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    icon: <BrainCircuit className="h-5 w-5" />,
    description: 'Great for creative design interpretations',
    models: ['claude-3-opus', 'claude-3-sonnet']
  },
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    icon: <Wand2 className="h-5 w-5" />,
    description: 'Balanced option with good component recognition',
    models: ['gemini-pro-vision', 'gemini-pro']
  }
];

export function ConfigStep({ config, setConfig }: ConfigStepProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>(config?.provider || providers[0].id);
  const [selectedModel, setSelectedModel] = useState<string>(config?.model || providers[0].models[0]);
  const [creativity, setCreativity] = useState<number>(config?.creativity || 0.7);
  const [complexity, setComplexity] = useState<number>(config?.complexity || 0.5);
  
  // Handle provider selection
  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    // Reset model to first one from the new provider
    const providerModels = providers.find(p => p.id === providerId)?.models || [];
    setSelectedModel(providerModels[0]);
    
    // Update complete config
    updateConfig(providerId, providerModels[0], creativity, complexity);
  };
  
  // Handle model selection
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    updateConfig(selectedProvider, modelId, creativity, complexity);
  };
  
  // Handle creativity slider change
  const handleCreativityChange = (value: number[]) => {
    setCreativity(value[0]);
    updateConfig(selectedProvider, selectedModel, value[0], complexity);
  };
  
  // Handle complexity slider change
  const handleComplexityChange = (value: number[]) => {
    setComplexity(value[0]);
    updateConfig(selectedProvider, selectedModel, creativity, value[0]);
  };
  
  // Update full config
  const updateConfig = (provider: string, model: string, creativity: number, complexity: number) => {
    setConfig({
      provider,
      model,
      creativity,
      complexity
    });
  };
  
  // Get available models for selected provider
  const getAvailableModels = () => {
    return providers.find(p => p.id === selectedProvider)?.models || [];
  };
  
  return (
    <div className="space-y-6">
      <StaggerItem>
        <div className="space-y-2">
          <Label>AI Provider</Label>
          <RadioGroup 
            value={selectedProvider} 
            onValueChange={handleProviderChange}
            className="grid grid-cols-1 gap-3"
          >
            {providers.map((provider) => (
              <div key={provider.id}>
                <RadioGroupItem
                  value={provider.id}
                  id={`provider-${provider.id}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`provider-${provider.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      {provider.icon}
                    </div>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{provider.description}</div>
                    </div>
                  </div>
                  <Zap className={`h-5 w-5 ${selectedProvider === provider.id ? 'text-primary' : 'text-muted-foreground'}`} />
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </StaggerItem>
      
      <StaggerItem>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableModels().map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </StaggerItem>
      
      <StaggerItem>
        <Card className="border border-dashed">
          <CardContent className="pt-6 pb-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="creativity">Creativity</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(creativity * 100)}%</span>
                </div>
                <Slider
                  id="creativity"
                  value={[creativity]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleCreativityChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="complexity">Complexity</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(complexity * 100)}%</span>
                </div>
                <Slider
                  id="complexity"
                  value={[complexity]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleComplexityChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Simple</span>
                  <span>Complex</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
      
      <StaggerItem>
        <motion.div 
          className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            Higher creativity yields more innovative designs. Higher complexity includes more detailed elements and interactions.
          </div>
        </motion.div>
      </StaggerItem>
    </div>
  );
}

export default ConfigStep;
