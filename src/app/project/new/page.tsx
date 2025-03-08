"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { GenerationWizard } from "@/components/wizard/GenerationWizard";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

/**
 * NewProjectPage component for creating new UI design projects
 * Uses the GenerationWizard component for a multi-step workflow
 */
export default function NewProjectPage() {
  const router = useRouter();

  // Handle wizard completion
  const handleWizardComplete = (projectId: string) => {
    toast.success("Project created successfully!");
    // Navigate to the project view page
    setTimeout(() => {
      router.push(`/project/${projectId}`);
    }, 1000);
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
              Create New Project
            </motion.h1>
            <div className="ml-auto flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container py-8 flex-1">
          <div className="max-w-4xl mx-auto">
            <GenerationWizard 
              onComplete={handleWizardComplete}
              className="w-full"
            />
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
