"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileDown, Pencil, Undo } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

import ReviewForm from "@/modules/review/ReviewForm";
import { ProjectVersion, RevisionFeedback, GeneratedFile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Project detail page for viewing and interacting with a specific project
 */
export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [projectVersion, setProjectVersion] = useState<ProjectVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("files");

  // Load project version on mount
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
      
      // Find the version with the matching ID
      const foundVersion = processedVersions.find((v: ProjectVersion) => v.id === projectId);
      
      if (foundVersion) {
        setProjectVersion(foundVersion);
      } else {
        toast.error("Project not found");
        router.push("/project/history");
      }
    } catch (error) {
      console.error("Error loading project version:", error);
      toast.error("Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  // Handle file download
  const handleDownloadFile = (file: GeneratedFile) => {
    try {
      // Create a blob with the file content
      const blob = new Blob([file.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  // Handle download all files as zip
  const handleDownloadAll = () => {
    // In a real app, this would create a zip file
    toast.info("Downloading all files...");
    
    // For demo purposes, download each file individually
    if (projectVersion) {
      projectVersion.files.forEach(file => {
        handleDownloadFile(file);
      });
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = (feedback: RevisionFeedback) => {
    // In a real app, this would submit the feedback to an API
    console.log("Feedback submitted:", feedback);
    
    // For demo purposes, save the feedback to localStorage
    try {
      const storedFeedback = localStorage.getItem('projectFeedback');
      const parsedFeedback = storedFeedback ? JSON.parse(storedFeedback) : [];
      
      localStorage.setItem('projectFeedback', JSON.stringify([...parsedFeedback, feedback]));
      
      toast.success("Feedback submitted successfully");
      setActiveTab("files");
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
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
    <main className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/project/history">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="ml-4 text-lg font-semibold">
            {isLoading ? "Loading Project..." : projectVersion?.name || "Project Details"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAll}
              disabled={isLoading || !projectVersion}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download All
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("revise")}
              disabled={isLoading || !projectVersion}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Provide Feedback
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => router.push("/project/new")}
              disabled={isLoading}
            >
              <Undo className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <section className="container py-8 flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : projectVersion ? (
          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>{projectVersion.name}</CardTitle>
                  <CardDescription>
                    Created on {projectVersion.createdAt.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Project Input</h3>
                      <div className="rounded-md bg-black bg-opacity-5 p-4">
                        {projectVersion.input.imageFile && (
                          <p className="text-sm mb-2">
                            <span className="font-medium">Image:</span> Included
                          </p>
                        )}
                        {projectVersion.input.textDescription && (
                          <div className="text-sm">
                            <span className="font-medium">Description:</span>
                            <p className="mt-1">{projectVersion.input.textDescription}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">AI Model Configuration</h3>
                      <div className="rounded-md bg-black bg-opacity-5 p-4">
                        <p className="text-sm mb-2">
                          <span className="font-medium">Vision Model:</span> {projectVersion.settings.visionModel.provider} / {projectVersion.settings.visionModel.model}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Generation Model:</span> {projectVersion.settings.generationModel.provider} / {projectVersion.settings.generationModel.model}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="files">Project Files ({projectVersion.files.length})</TabsTrigger>
                <TabsTrigger value="revise">Revise & Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="files">
                <motion.div className="space-y-6" variants={containerVariants}>
                  {projectVersion.files.map((file, index) => (
                    <motion.div key={file.id} variants={itemVariants}>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{file.name}</CardTitle>
                            <CardDescription>{file.description}</CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(file)}
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-md bg-black bg-opacity-5 p-4 max-h-[300px] overflow-auto">
                            <pre className="text-sm whitespace-pre-wrap">
                              {file.content}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="revise">
                <motion.div variants={itemVariants}>
                  <ReviewForm
                    files={projectVersion.files}
                    projectVersion={projectVersion}
                    onFeedbackSubmit={handleFeedbackSubmit}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">Project not found</p>
            <Button asChild>
              <Link href="/project/history">Return to Projects</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
