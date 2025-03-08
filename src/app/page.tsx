"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, History, Settings, ChevronRight } from "lucide-react";
import { GenerationWizard } from "@/components/wizard/GenerationWizard";
import { MotionSection, StaggerItem } from "@/components/animation/MotionSection";
import { ImmersiveCard } from "@/components/3d/ImmersiveCard";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useUIStore } from "@/lib/store";

/**
 * HomePage component - Entry point for the UI Vispro application
 */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("new");
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  
  // Close wizard handler
  const handleWizardComplete = (projectId: string) => {
    setShowWizard(false);
    // Here you would typically redirect to the project page
    console.log(`Project ${projectId} generated successfully`);
  };

  return (
    <ErrorBoundary>
      <main className="flex min-h-screen flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 font-semibold"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-6 w-6 text-primary"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 8a1 1 0 0 1 .4.2l5.4 5.4a1 1 0 0 1-.4 1.8H8.6a1 1 0 0 1-1-1.3L9 8.2a1 1 0 0 1 0-.2" />
                <path d="M15 8a1 1 0 0 0-.4.2l-5.4 5.4a1 1 0 0 0 .4 1.8h5.8a1 1 0 0 0 1-1.3L15 8.2a1 1 0 0 0 0-.2" />
              </svg>
              <span className="text-xl">UI Vispro</span>
            </motion.div>
            <div className="ml-auto flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link href="/settings" aria-label="Settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/project/history">
                  <History className="h-4 w-4 mr-2" /> Project History
                </Link>
              </Button>
              <Button onClick={() => setShowWizard(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create New Project
              </Button>
            </div>
          </div>
        </header>

        {showWizard ? (
          <div className="container py-8">
            <GenerationWizard 
              onComplete={handleWizardComplete} 
              className="max-w-3xl mx-auto"
            />
          </div>
        ) : (
          <>
            <MotionSection 
              className="container py-12 md:py-20"
              preset="fadeIn"
              staggerItems
            >
              <StaggerItem className="mx-auto max-w-[800px] text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  UI Vispro
                </h1>
                <p className="mt-4 text-xl text-muted-foreground">
                  Convert UI designs into detailed Next.js project files
                </p>
              </StaggerItem>

              <StaggerItem className="mx-auto max-w-3xl">
                <ImmersiveCard 
                  depth={0.08}
                  intensity={0.6}
                  className="relative overflow-hidden"
                >
                  <CardHeader className="text-center relative z-10">
                    <CardTitle>Generate Project Files</CardTitle>
                    <CardDescription>
                      Upload a UI design image and/or provide a text description
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <Tabs 
                      value={activeTab} 
                      onValueChange={setActiveTab} 
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="new">New Project</TabsTrigger>
                        <TabsTrigger value="history">Project History</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="new" className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-center text-sm text-muted-foreground"
                        >
                          Start a new generation project by uploading a UI design image or providing a text description
                        </motion.div>
                        
                        <motion.div 
                          className="flex flex-col gap-6 items-center justify-center p-4"
                          whileHover={!isReducedMotion ? { scale: 1.02 } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Button 
                            className="w-full sm:w-auto relative overflow-hidden" 
                            size="lg"
                            onClick={() => setShowWizard(true)}
                          >
                            {!isReducedMotion && (
                              <motion.span
                                className="absolute inset-0 bg-primary/20"
                                initial={{ x: "-100%" }}
                                animate={{ x: "200%" }}
                                transition={{ 
                                  repeat: Infinity, 
                                  duration: 2,
                                  ease: "linear",
                                  repeatDelay: 1
                                }}
                              />
                            )}
                            <Plus className="mr-2 h-4 w-4" /> 
                            Start New Project
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </motion.div>
                      </TabsContent>
                      
                      <TabsContent value="history" className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-center text-sm text-muted-foreground"
                        >
                          View and manage your previously generated projects
                        </motion.div>
                        
                        <div className="flex items-center justify-center p-4">
                          <Button 
                            variant="outline" 
                            className="w-full sm:w-auto"
                            asChild
                          >
                            <Link href="/project/history">
                              <History className="mr-2 h-4 w-4" /> View Project History
                            </Link>
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </ImmersiveCard>
              </StaggerItem>
            </MotionSection>

            <MotionSection 
              className="container py-12"
              preset="fadeInUp"
              threshold={0.2}
              delay={0.3}
              staggerItems
            >
              <StaggerItem className="max-w-3xl mx-auto mb-8 text-center">
                <h2 className="text-3xl font-bold">Key Features</h2>
                <p className="mt-2 text-muted-foreground">
                  Powerful AI-driven design to code conversion
                </p>
              </StaggerItem>
              
              <StaggerItem className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ImmersiveCard
                  depth={0.05}
                  intensity={0.4}
                  backgroundColor="#1e1e1e"
                >
                  <CardHeader>
                    <CardTitle>Image Analysis</CardTitle>
                    <CardDescription>
                      AI-powered vision model interprets design elements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Analyzes layout structures</li>
                      <li>Identifies UI components</li>
                      <li>Extracts color scheme</li>
                      <li>Detects typography styles</li>
                    </ul>
                  </CardContent>
                </ImmersiveCard>

                <ImmersiveCard
                  depth={0.05}
                  intensity={0.4}
                  backgroundColor="#1e1e1e"
                >
                  <CardHeader>
                    <CardTitle>Project Files</CardTitle>
                    <CardDescription>
                      Generate structured code for implementation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Project setup instructions</li>
                      <li>Folder structure guidance</li>
                      <li>Component development details</li>
                      <li>Styling specifications</li>
                    </ul>
                  </CardContent>
                </ImmersiveCard>

                <ImmersiveCard
                  depth={0.05}
                  intensity={0.4}
                  backgroundColor="#1e1e1e"
                  className="md:col-span-2 lg:col-span-1"
                >
                  <CardHeader>
                    <CardTitle>Advanced UI/UX</CardTitle>
                    <CardDescription>
                      Modern interactive features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Drag-and-drop interface</li>
                      <li>Multi-step generation workflow</li>
                      <li>AI confidence indicators</li>
                      <li>Immersive design system</li>
                    </ul>
                  </CardContent>
                </ImmersiveCard>
              </StaggerItem>
            </MotionSection>
          </>
        )}

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
