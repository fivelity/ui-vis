"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSettings, AIModelConfig } from "@/lib/types";
import { defaultSettings, defaultVisionModels, defaultGenerationModels } from "@/lib/config/default-settings";
import { hasValidCredentials } from "@/lib/ai/providers";
import { toast } from "sonner";

interface SettingsFormProps {
  initialSettings?: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

// Validation schema for settings form
const formSchema = z.object({
  visionModelId: z.string(),
  generationModelId: z.string(),
  preferredOutputFormat: z.enum(["markdown", "json"]),
  maxTokens: z.number().min(500).max(16000),
  temperature: z.number().min(0).max(2),
  customOpenAIKey: z.string().optional(),
  customTogetherAIKey: z.string().optional(),
  customOllamaEndpoint: z.string().optional(),
  customLMStudioEndpoint: z.string().optional(),
  useDefaultCredentials: z.boolean(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

/**
 * SettingsForm component for managing AI configuration and preferences
 */
export function SettingsForm({ initialSettings = defaultSettings, onSettingsChange }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState("models");
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [visionModels, setVisionModels] = useState(defaultVisionModels);
  const [generationModels, setGenerationModels] = useState(defaultGenerationModels);

  // Initialize form with default values
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visionModelId: initialSettings.visionModel.id,
      generationModelId: initialSettings.generationModel.id,
      preferredOutputFormat: initialSettings.preferredOutputFormat,
      maxTokens: initialSettings.maxTokens,
      temperature: initialSettings.temperature,
      customOpenAIKey: "",
      customTogetherAIKey: "",
      customOllamaEndpoint: "http://localhost:11434",
      customLMStudioEndpoint: "http://localhost:1234/v1",
      useDefaultCredentials: true,
    },
  });

  // Handle form submission
  const onSubmit = (data: SettingsFormValues) => {
    try {
      // Find selected models from the lists
      const selectedVisionModel = visionModels.find(model => model.id === data.visionModelId);
      const selectedGenerationModel = generationModels.find(model => model.id === data.generationModelId);

      if (!selectedVisionModel || !selectedGenerationModel) {
        throw new Error("Selected models not found");
      }

      // Create updated settings object
      const updatedSettings: AppSettings = {
        visionModel: {
          ...selectedVisionModel,
          apiKey: data.useDefaultCredentials ? undefined : getApiKeyForProvider(selectedVisionModel.provider, data),
          endpoint: data.useDefaultCredentials ? undefined : getEndpointForProvider(selectedVisionModel.provider, data),
        },
        generationModel: {
          ...selectedGenerationModel,
          apiKey: data.useDefaultCredentials ? undefined : getApiKeyForProvider(selectedGenerationModel.provider, data),
          endpoint: data.useDefaultCredentials ? undefined : getEndpointForProvider(selectedGenerationModel.provider, data),
        },
        preferredOutputFormat: data.preferredOutputFormat,
        maxTokens: data.maxTokens,
        temperature: data.temperature,
      };

      // Apply the updated settings
      onSettingsChange(updatedSettings);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Settings update error:", error);
      toast.error("Failed to update settings");
    }
  };

  // Helper function to get API key for a provider
  const getApiKeyForProvider = (provider: string, data: SettingsFormValues): string | undefined => {
    switch (provider) {
      case "openai":
        return data.customOpenAIKey || undefined;
      case "togetherai":
        return data.customTogetherAIKey || undefined;
      default:
        return undefined;
    }
  };

  // Helper function to get endpoint for a provider
  const getEndpointForProvider = (provider: string, data: SettingsFormValues): string | undefined => {
    switch (provider) {
      case "ollama":
        return data.customOllamaEndpoint || undefined;
      case "lmstudio":
        return data.customLMStudioEndpoint || undefined;
      default:
        return undefined;
    }
  };

  // Animation variants for Framer Motion
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
      className="w-full max-w-3xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Configure AI models and preferences for your project generations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="models" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="models">AI Models</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
                <TabsContent value="models" className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="visionModelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vision Model</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select vision model" />
                              </SelectTrigger>
                              <SelectContent>
                                {visionModels.map((model) => (
                                  <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Model used for analyzing UI design images
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="generationModelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Generation Model</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select generation model" />
                              </SelectTrigger>
                              <SelectContent>
                                {generationModels.map((model) => (
                                  <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Model used for generating project files
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="api-keys" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="useDefaultCredentials"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Use Default Credentials
                          </FormLabel>
                          <FormDescription>
                            Use the credentials from your environment variables
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {!form.watch("useDefaultCredentials") && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="customOpenAIKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>OpenAI API Key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="sk-..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your OpenAI API key for GPT-4 Vision
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customTogetherAIKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Together AI API Key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your Together AI API key
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customOllamaEndpoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ollama Endpoint</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="http://localhost:11434"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your local Ollama server endpoint
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customLMStudioEndpoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LM Studio Endpoint</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="http://localhost:1234/v1"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your local LM Studio server endpoint
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="preferredOutputFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Output Format</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select output format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="markdown">Markdown</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Format for generated project files
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature: {field.value}</FormLabel>
                          <FormControl>
                            <Input
                              type="range"
                              min={0}
                              max={2}
                              step={0.1}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              className="accent-primary"
                            />
                          </FormControl>
                          <FormDescription>
                            Controls randomness (0 = deterministic, 2 = creative)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxTokens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Tokens</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={500}
                              max={16000}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of tokens per generation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Reset
                  </Button>
                  <Button type="submit">Save Settings</Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default SettingsForm;
