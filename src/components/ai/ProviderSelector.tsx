"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Settings, Info } from "lucide-react";
import { AIModelConfig } from "@/lib/types";
import { PROVIDER_MODELS } from "@/lib/ai/models";

interface ProviderOption {
  id: string;
  name: string;
  models: string[];
  description: string;
  icon?: React.ReactNode;
}

// Use the centralized model definitions from models.ts
const providers: ProviderOption[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: PROVIDER_MODELS.openai,
    description: "Powerful vision models for detailed UI analysis and generation",
  },
  {
    id: "togetherai",
    name: "Together AI",
    models: PROVIDER_MODELS.togetherai,
    description: "Cost-effective open models with solid performance",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    models: PROVIDER_MODELS.lmstudio,
    description: "Run models locally with customizable settings",
  },
  {
    id: "ollama",
    name: "Ollama",
    models: PROVIDER_MODELS.ollama,
    description: "Local execution of various open-source models",
  },
];

interface ProviderSelectorProps {
  currentConfig: AIModelConfig;
  onChange: (config: AIModelConfig) => void;
  onSettingsOpen: () => void;
}

export function ProviderSelector({
  currentConfig,
  onChange,
  onSettingsOpen,
}: ProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption>(
    providers.find(p => p.id === currentConfig.provider) || providers[0]
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    currentConfig.model || providers[0].models[0]
  );

  // Update the selected provider when the currentConfig changes
  useEffect(() => {
    const provider = providers.find(p => p.id === currentConfig.provider);
    if (provider) {
      setSelectedProvider(provider);
      
      // Check if the current model belongs to the selected provider
      const modelExists = provider.models.includes(currentConfig.model);
      if (!modelExists && provider.models.length > 0) {
        // If not, select the first model of the provider
        setSelectedModel(provider.models[0]);
        onChange({
          ...currentConfig,
          model: provider.models[0]
        });
      } else {
        setSelectedModel(currentConfig.model);
      }
    }
  }, [currentConfig.provider]);

  const handleProviderChange = (provider: ProviderOption) => {
    setSelectedProvider(provider);
    setIsOpen(false);
    
    // Default to the first model when changing providers
    const newModel = provider.models[0];
    setSelectedModel(newModel);
    
    onChange({
      ...currentConfig,
      provider: provider.id,
      model: newModel
    });
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    onChange({
      ...currentConfig,
      model
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  const listVariants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="w-full mb-6 p-1"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">AI Provider</h3>
          <button 
            onClick={onSettingsOpen}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open AI provider settings"
          >
            <Settings size={18} className="text-gray-500" />
          </button>
        </div>
        
        {/* Provider selector dropdown */}
        <div className="relative">
          <button
            className={`flex w-full justify-between items-center px-3 py-2 text-left text-sm font-medium 
                       rounded-md border border-gray-300 dark:border-gray-700 
                       ${isOpen ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby="provider-label"
          >
            <span className="flex items-center">
              {selectedProvider.name}
            </span>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          <motion.ul
            className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1"
            role="listbox"
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            variants={listVariants}
          >
            {providers.map((provider) => (
              <li
                key={provider.id}
                className={`cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 
                          ${selectedProvider.id === provider.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                role="option"
                aria-selected={selectedProvider.id === provider.id}
                onClick={() => handleProviderChange(provider)}
              >
                <div className="flex justify-between items-center">
                  <span>{provider.name}</span>
                  {selectedProvider.id === provider.id && (
                    <Check size={16} className="text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{provider.description}</p>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Model selector */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Model</h3>
            <button 
              className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" 
              aria-label="Model information"
            >
              <Info size={14} className="mr-1" />
              <span>Info</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {selectedProvider.models.map((model) => (
              <button
                key={model}
                className={`px-3 py-2 text-sm rounded-md border transition-colors
                          ${selectedModel === model 
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                            : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'}`}
                onClick={() => handleModelChange(model)}
                aria-label={`Select ${model} model`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProviderSelector;
