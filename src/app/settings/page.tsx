"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Moon, Sun, Monitor, Accessibility } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTheme } from "next-themes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { MotionSection, StaggerItem } from "@/components/animation/MotionSection";
import { useUIStore } from "@/lib/store";

import SettingsForm from "@/modules/settings/SettingsForm";
import { AppSettings } from "@/lib/types";
import { defaultSettings } from "@/lib/config/default-settings";

/**
 * Settings page for configuring the application
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");
  
  // UI state from Zustand
  const { isReducedMotion, isDarkMode, setReducedMotion, setDarkMode } = useUIStore();
  
  // Theme provider integration
  const { setTheme, theme } = useTheme();

  // Load settings on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from a database or API
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings, using defaults");
      // Fallback to default settings
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle settings update
  const handleSettingsUpdate = async (updatedSettings: AppSettings) => {
    setIsSaving(true);
    try {
      // In a real app, this would save to a database or API
      localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle theme change
  const handleThemeChange = (value: string) => {
    setTheme(value);
  };
  
  // Handle reduced motion change
  const handleReducedMotionChange = (checked: boolean) => {
    setReducedMotion(checked);
  };

  return (
    <ErrorBoundary>
      <main className="flex min-h-screen flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-16 items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <motion.h1 
              className="ml-4 text-lg font-semibold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Settings
            </motion.h1>
            <div className="ml-auto flex items-center gap-4">
              <Button 
                onClick={() => handleSettingsUpdate(settings)}
                disabled={isSaving || isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </header>

        <div className="container py-8 flex-1">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <motion.div 
                  className="h-10 w-10 rounded-full border-t-2 border-b-2 border-primary"
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
              </div>
            ) : (
              <Tabs 
                defaultValue={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="aiSettings">AI Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="appearance">
                  <MotionSection preset="fadeIn" staggerItems>
                    <StaggerItem>
                      <Card>
                        <CardHeader>
                          <CardTitle>Theme</CardTitle>
                          <CardDescription>
                            Customize how the application looks
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium leading-none mb-3">Color Theme</h3>
                            <RadioGroup 
                              defaultValue={theme}
                              onValueChange={handleThemeChange}
                              className="grid grid-cols-3 gap-4"
                            >
                              <div>
                                <RadioGroupItem value="light" id="light" className="sr-only peer" />
                                <Label
                                  htmlFor="light"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <Sun className="mb-3 h-6 w-6" />
                                  Light
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem value="dark" id="dark" className="sr-only peer" />
                                <Label
                                  htmlFor="dark"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <Moon className="mb-3 h-6 w-6" />
                                  Dark
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem value="system" id="system" className="sr-only peer" />
                                <Label
                                  htmlFor="system"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <Monitor className="mb-3 h-6 w-6" />
                                  System
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium leading-none mb-3">Accessibility</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-1">
                                <Label htmlFor="reducedMotion" className="font-medium">
                                  Reduced Motion
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Minimize animations throughout the application
                                </p>
                              </div>
                              <Switch 
                                id="reducedMotion" 
                                checked={isReducedMotion}
                                onCheckedChange={handleReducedMotionChange}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  </MotionSection>
                </TabsContent>
                
                <TabsContent value="aiSettings">
                  <MotionSection preset="fadeIn">
                    <SettingsForm
                      initialSettings={settings}
                      onSettingsChange={setSettings}
                      onSubmit={handleSettingsUpdate}
                    />
                  </MotionSection>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        <footer className="mt-auto border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 text-center md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} UI Vispro. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </ErrorBoundary>
  );
}
