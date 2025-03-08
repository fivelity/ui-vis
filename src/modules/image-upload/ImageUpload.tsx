"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage?: File;
}

/**
 * ImageUpload component for handling UI image uploads
 */
export function ImageUpload({ onImageSelect, selectedImage }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle selected file and create preview
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    // Create image preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelect(file);

    // Clean up previous URL to avoid memory leaks
    return () => URL.revokeObjectURL(url);
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Animation variants for Framer Motion
  const dragVariants = {
    inactive: {
      borderColor: "rgba(100, 100, 100, 0.3)",
      backgroundColor: "rgba(0, 0, 0, 0.02)",
    },
    active: {
      borderColor: "rgba(66, 153, 225, 0.8)",
      backgroundColor: "rgba(66, 153, 225, 0.1)",
      scale: 1.01,
    },
  };

  // Handle clicks on the upload area
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clear the selected image
  const handleClearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageSelect(null as unknown as File);
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {previewUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative rounded-lg overflow-hidden"
          >
            <Card>
              <CardContent className="p-4 flex flex-col space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                  <Image
                    src={previewUrl}
                    alt="Uploaded UI design"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {selectedImage?.name}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearImage}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            className="cursor-pointer relative h-52 rounded-lg border-2 border-dashed border-gray-300 flex flex-col justify-center items-center p-4"
            variants={dragVariants}
            animate={dragActive ? "active" : "inactive"}
            transition={{ duration: 0.2 }}
          >
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handleInputChange}
            />
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-muted-foreground mb-2"
              >
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                <path d="M16 5h6" />
                <path d="M21 10V5h-5" />
                <path d="M16 16h.01" />
                <path d="M11 16h.01" />
                <path d="M16 11h.01" />
                <path d="M11 11h.01" />
                <path d="M11 6h.01" />
              </svg>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                Drag and drop your UI design image here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to select an image
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ImageUpload;
