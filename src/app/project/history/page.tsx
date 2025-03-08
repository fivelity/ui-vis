"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import ProjectHistory from "@/modules/version-control/ProjectHistory";
import { ProjectVersion } from "@/lib/types";

/**
 * Project History page for viewing and managing past projects
 */
export default function HistoryPage() {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load project versions on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from a database
      const storedVersions = localStorage.getItem('projectVersions');
      const parsedVersions = storedVersions ? JSON.parse(storedVersions) : [];
      
      // Convert date strings back to Date objects
      const processedVersions = parsedVersions.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }));
      
      setVersions(processedVersions);
    } catch (error) {
      console.error("Error loading project versions:", error);
      toast.error("Failed to load project history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle version selection
  const handleVersionSelect = (version: ProjectVersion) => {
    // In a real app, this would navigate to a detailed view of the version
    toast.info(`Selected project: ${version.name}`);
    
    // For demo purposes, we'll just log the selected version
    console.log("Selected version:", version);
  };

  // Handle version deletion
  const handleVersionDelete = (versionId: string) => {
    try {
      // Filter out the version to delete
      const updatedVersions = versions.filter(v => v.id !== versionId);
      
      // Update state and localStorage
      setVersions(updatedVersions);
      localStorage.setItem('projectVersions', JSON.stringify(updatedVersions));
      
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project version:", error);
      toast.error("Failed to delete project");
    }
  };

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Project History</h1>
          <div className="ml-auto flex items-center gap-4">
            <Button asChild>
              <Link href="/project/new">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <motion.section
        className="container py-12 flex-1"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ProjectHistory
              versions={versions}
              onVersionSelect={handleVersionSelect}
              onVersionDelete={handleVersionDelete}
            />
          )}

          {!isLoading && versions.length === 0 && (
            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/project/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Link>
              </Button>
            </div>
          )}
        </div>
      </motion.section>
    </main>
  );
}
