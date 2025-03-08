"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneratedFile, RevisionFeedback, ProjectVersion } from "@/lib/types";
import { toast } from "sonner";

interface ReviewFormProps {
  files: GeneratedFile[];
  projectVersion: ProjectVersion;
  onFeedbackSubmit: (feedback: RevisionFeedback) => void;
}

/**
 * ReviewForm component for collecting user feedback on generated files
 */
export function ReviewForm({ files, projectVersion, onFeedbackSubmit }: ReviewFormProps) {
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [fileSpecificFeedback, setFileSpecificFeedback] = useState<{ [key: string]: string }>({});
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle feedback submission
  const handleSubmit = () => {
    if (!generalFeedback.trim()) {
      toast.error("Please provide some general feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      // Collect file-specific feedback that has content
      const fileFeedback = Object.entries(fileSpecificFeedback)
        .filter(([_, feedback]) => feedback.trim().length > 0)
        .map(([id, feedback]) => ({ id, feedback }));

      // Create feedback object
      const feedback: RevisionFeedback = {
        versionId: projectVersion.id,
        feedback: generalFeedback,
        files: fileFeedback.length > 0 ? fileFeedback : undefined
      };

      // Submit feedback
      onFeedbackSubmit(feedback);
      toast.success("Feedback submitted successfully");
      
      // Reset form
      setGeneralFeedback("");
      setFileSpecificFeedback({});
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle change in file-specific feedback
  const handleFileSpecificFeedbackChange = (fileId: string, value: string) => {
    setFileSpecificFeedback(prev => ({
      ...prev,
      [fileId]: value
    }));
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
      className="w-full"
    >
      <Card>
        <CardHeader>
          <CardTitle>Review & Feedback</CardTitle>
          <CardDescription>
            Provide feedback to improve the generated files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="general-feedback">General Feedback</Label>
            <Textarea
              id="general-feedback"
              placeholder="What do you like or what would you like to improve about the generated files?"
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-4">
            <Label>File-Specific Feedback</Label>
            <Tabs defaultValue={files[0].id} className="w-full">
              <TabsList className="grid grid-flow-col auto-cols-fr mb-4 overflow-auto">
                {files.map((file, index) => (
                  <TabsTrigger
                    key={file.id}
                    value={file.id}
                    onClick={() => setSelectedFileIndex(index)}
                    className="text-xs md:text-sm"
                  >
                    {file.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {files.map((file) => (
                <TabsContent key={file.id} value={file.id} className="space-y-4">
                  <div className="rounded-md bg-black bg-opacity-5 p-4 max-h-[300px] overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                      {file.content}
                    </pre>
                  </div>
                  
                  <Textarea
                    placeholder={`Specific feedback for ${file.name}...`}
                    value={fileSpecificFeedback[file.id] || ""}
                    onChange={(e) => handleFileSpecificFeedbackChange(file.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setGeneralFeedback("");
              setFileSpecificFeedback({});
            }}
          >
            Clear
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !generalFeedback.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default ReviewForm;
