"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectVersion } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface ProjectHistoryProps {
  versions: ProjectVersion[];
  onVersionSelect: (version: ProjectVersion) => void;
  onVersionDelete: (versionId: string) => void;
}

/**
 * ProjectHistory component for viewing and managing past project versions
 */
export function ProjectHistory({
  versions,
  onVersionSelect,
  onVersionDelete,
}: ProjectHistoryProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Handle version selection
  const handleVersionSelect = (version: ProjectVersion) => {
    setSelectedVersionId(version.id);
    onVersionSelect(version);
  };

  // Handle version deletion with confirmation
  const handleVersionDelete = (versionId: string) => {
    if (deleteConfirmId === versionId) {
      onVersionDelete(versionId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(versionId);
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  // Animation variants for Framer Motion
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Project History</CardTitle>
        <CardDescription>
          View and manage your previously generated projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No project versions found</p>
            <p className="text-sm mt-2">Generate your first project to see it here</p>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {versions.map((version) => (
              <motion.div
                key={version.id}
                variants={itemVariants}
                className={`p-4 rounded-lg border ${
                  selectedVersionId === version.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium">{version.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                    </p>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="px-2 py-0.5 bg-secondary rounded-full">
                        {version.files.length} files
                      </span>
                      <span className="px-2 py-0.5 bg-secondary rounded-full">
                        {version.input.imageFile ? "Image" : ""}
                        {version.input.imageFile && version.input.textDescription ? " + " : ""}
                        {version.input.textDescription ? "Text" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVersionSelect(version)}
                    >
                      Load
                    </Button>
                    <AnimatePresence>
                      {deleteConfirmId === version.id ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleVersionDelete(version.id)}
                          >
                            Confirm
                          </Button>
                        </motion.div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVersionDelete(version.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {version.input.textDescription && (
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {version.input.textDescription}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProjectHistory;
