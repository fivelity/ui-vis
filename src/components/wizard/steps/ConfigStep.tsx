import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProviderSelector } from '@/components/ai/ProviderSelector';
import { AIModelConfig } from '@/lib/types';
import { PROVIDER_MODELS, getAvailableModels } from '@/lib/ai/models';
import { getModelDisplayName } from '@/lib/ai/utils';

// Animation variants
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface ConfigStepProps {
  config: AIModelConfig | null;
  onConfigUpdate: (config: AIModelConfig) => void;
  className?: string;
}

export default function ConfigStep({ config, onConfigUpdate, className }: ConfigStepProps) {
  // Initialize with current config or defaults
  const initialProvider = config?.provider || 'openai';
  const [selectedProvider, setSelectedProvider] = useState<string>(initialProvider);
  
  // Get available models for selected provider
  const availableModels = getAvailableModels(selectedProvider);
  
  // Initialize with current model or first available model
  const [selectedModel, setSelectedModel] = useState<string>(
    config?.model || (availableModels.length > 0 ? availableModels[0] : '')
  );
  
  const [temperature, setTemperature] = useState<number>(config?.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState<number>(config?.maxTokens || 4000);
  
  // Update config when parameters change
  useEffect(() => {
    onConfigUpdate({
      provider: selectedProvider,
      model: selectedModel,
      temperature,
      maxTokens,
    });
  }, [selectedProvider, selectedModel, temperature, maxTokens, onConfigUpdate]);
  
  // Handle provider selection
  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    
    // Reset model when provider changes
    const models = getAvailableModels(provider);
    if (models.length > 0) {
      setSelectedModel(models[0]);
    } else {
      setSelectedModel('');
    }
  };
  
  // Handle model selection
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };
  
  // Get available models for selected provider
  const models = getAvailableModels(selectedProvider);
  
  return (
    <motion.div
      className={`space-y-6 ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider" className="text-base font-medium">AI Provider</Label>
              <ProviderSelector
                currentConfig={{ provider: selectedProvider, model: selectedModel }}
                onChange={(config) => {
                  handleProviderChange(config.provider);
                  if (config.model) {
                    handleModelChange(config.model);
                  }
                }}
                onSettingsOpen={() => {/* Handle settings */}}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model" className="text-base font-medium">Model</Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {getModelDisplayName(selectedProvider, model)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="temperature" className="text-base font-medium">Temperature</Label>
                <span className="text-sm text-muted-foreground">{temperature.toFixed(1)}</span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Lower values are more deterministic, higher values are more creative.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxTokens" className="text-base font-medium">Max Tokens</Label>
                <span className="text-sm text-muted-foreground">{maxTokens}</span>
              </div>
              <Slider
                id="maxTokens"
                min={1000}
                max={8000}
                step={100}
                value={[maxTokens]}
                onValueChange={(value) => setMaxTokens(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of tokens to generate. Higher values allow for more detailed responses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
