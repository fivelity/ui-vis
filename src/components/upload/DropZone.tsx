"use client";

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileImage, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFilesAccepted: (files: File[]) => void;
  onFilesRejected?: (fileRejections: any[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
  disabled?: boolean;
}

/**
 * DropZone component with visual feedback for file uploads
 */
export function DropZone({
  onFilesAccepted,
  onFilesRejected,
  maxFiles = 1,
  maxSize = 5242880, // 5MB default
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  className,
  disabled = false
}: DropZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const isReducedMotion = useUIStore(state => state.isReducedMotion);

  // Reset error when files or disabled state changes
  useEffect(() => {
    if (error && (files.length === 0 || !disabled)) {
      setError(null);
    }
  }, [files, disabled, error]);

  // Simulate progress for visual feedback
  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return newProgress;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [isUploading]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejectionError = rejectedFiles[0].errors[0];
      let errorMessage = 'Invalid file';
      
      if (rejectionError.code === 'file-too-large') {
        errorMessage = `File is too large. Max size is ${maxSize / 1048576}MB`;
      } else if (rejectionError.code === 'file-invalid-type') {
        errorMessage = 'Invalid file type. Only images are accepted';
      } else if (rejectionError.code === 'too-many-files') {
        errorMessage = `Too many files. Max ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`;
      }
      
      setError(errorMessage);
      if (onFilesRejected) onFilesRejected(rejectedFiles);
      return;
    }

    setFiles(acceptedFiles);
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Process files after visual feedback
    setTimeout(() => {
      onFilesAccepted(acceptedFiles);
    }, 500);
  }, [maxFiles, maxSize, onFilesAccepted, onFilesRejected]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    disabled,
    multiple: maxFiles > 1
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setUploadProgress(0);
    setIsUploading(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: isReducedMotion ? "tween" : "spring",
        stiffness: 100,
        damping: 15,
        duration: isReducedMotion ? 0.2 : undefined
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const getBorderColor = () => {
    if (isDragAccept) return 'border-green-500 ring-2 ring-green-500/20';
    if (isDragReject || error) return 'border-destructive ring-2 ring-destructive/20';
    if (isDragActive) return 'border-primary ring-2 ring-primary/20';
    return 'border-input';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors",
          "cursor-pointer hover:bg-accent/50",
          getBorderColor(),
          disabled && "opacity-60 cursor-not-allowed hover:bg-transparent",
          className
        )}
        aria-label="Drop zone for file upload"
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {files.length > 0 ? (
            <motion.div
              key="file-preview"
              className="flex flex-col items-center"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
            >
              <div className="mb-4 relative">
                {files[0].type.startsWith('image/') && (
                  <div className="relative w-32 h-32 rounded overflow-hidden border">
                    <img
                      src={URL.createObjectURL(files[0])}
                      alt="Uploaded file preview"
                      className="w-full h-full object-cover"
                      onLoad={() => URL.revokeObjectURL(URL.createObjectURL(files[0]))}
                    />
                  </div>
                )}
                {!files[0].type.startsWith('image/') && (
                  <FileImage className="w-32 h-32 text-muted-foreground" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(0);
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm font-medium mb-1">{files[0].name}</p>
              <p className="text-xs text-muted-foreground">
                {(files[0].size / 1024).toFixed(0)} KB
              </p>
              
              {isUploading && (
                <div className="w-full mt-4">
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              {uploadProgress === 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-4 flex items-center text-green-500"
                >
                  <Check className="mr-1 h-4 w-4" />
                  <span className="text-sm">Uploaded successfully</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload-prompt"
              className="flex flex-col items-center text-center"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
            >
              <div className="mb-4 p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {isDragActive ? 'Drop file here' : 'Upload file'}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                {maxFiles > 1 ? `Up to ${maxFiles} files` : 'Single file'} • Max {maxSize / 1048576}MB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={disabled}
              >
                Select File
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center text-destructive text-sm"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DropZone;
