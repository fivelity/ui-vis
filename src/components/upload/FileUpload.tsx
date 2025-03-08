"use client";

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileImage, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store';
import { getAnimationVariant, getHoverAnimation } from '@/lib/utils/animation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface FileUploadProps {
  /** Accept specific file types */
  accept?: Record<string, string[]>;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Whether to display the preview */
  showPreview?: boolean;
  /** Whether to show a progress indicator */
  isUploading?: boolean;
  /** Upload progress (0-100) */
  uploadProgress?: number;
  /** Whether the upload is complete */
  isComplete?: boolean;
  /** File successfully uploaded */
  onUpload?: (file: File) => void;
  /** File removed from dropzone */
  onRemove?: () => void;
  /** Error during file selection or upload */
  onError?: (error: string) => void;
  /** Custom class name */
  className?: string;
}

/**
 * FileUpload component with drag and drop functionality
 * Features:
 * - Drag and drop interface with visual feedback
 * - File type and size validation
 * - Progress indicator for upload status
 * - Accessibility support
 * - Animated transitions
 */
export function FileUpload({
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  showPreview = true,
  isUploading = false,
  uploadProgress = 0,
  isComplete = false,
  onUpload,
  onRemove,
  onError,
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const isReducedMotion = useUIStore(state => state.isReducedMotion);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles[0].errors.map((err: any) => err.message).join(', ');
      onError?.(errors);
      toast.error(`File upload error: ${errors}`);
      return;
    }

    // Only use the first file if we have a limit of 1
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Create a preview for image files
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
      
      onUpload?.(selectedFile);
    }
  }, [onUpload, onError]);

  // Configure react-dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
  } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled: isUploading,
    multiple: false,
    noClick: !!file, // Disable click when file is selected
    noKeyboard: !!file, // Disable keyboard when file is selected
  });

  // Remove file and preview when component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Handle removing the file
  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    onRemove?.();
  };

  // Animation variants
  const containerVariants = getAnimationVariant('fadeIn');
  const hoverAnimation = getHoverAnimation();

  // Class for styling the dropzone container
  const dropzoneClass = cn(
    'relative flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed p-6 transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    {
      'border-primary bg-primary/5': isDragAccept,
      'border-destructive bg-destructive/5': isDragReject,
      'border-primary/50 hover:border-primary': !isDragActive && !file,
      'border-muted bg-muted/20': !!file,
      'cursor-pointer': !file,
      'cursor-default': !!file,
    },
    className
  );

  return (
    <div className="w-full">
      <div
        {...getRootProps({
          className: dropzoneClass,
        })}
      >
        <input {...getInputProps()} aria-label="File upload" />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isReducedMotion ? 0 : 0.2 }}
              className="w-full flex flex-col items-center"
            >
              {/* Preview image */}
              {showPreview && preview && (
                <div className="relative mb-4 overflow-hidden rounded-md">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 max-w-full object-contain"
                  />
                </div>
              )}

              {/* File information */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <FileImage className="h-6 w-6 mr-2 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {!isUploading && !isComplete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {isComplete && (
                  <div className="text-green-500">
                    <Check className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Upload progress bar */}
              {isUploading && (
                <div className="w-full mt-4">
                  <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isReducedMotion ? 0 : 0.2 }}
              className="flex flex-col items-center justify-center text-center"
              {...hoverAnimation}
            >
              <Upload className="h-10 w-10 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-1">
                {isDragActive
                  ? isDragAccept
                    ? 'Drop the file here'
                    : 'This file type is not supported'
                  : 'Drag & drop or browse'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isDragReject
                  ? 'Please upload a valid image file'
                  : `Supports JPEG, PNG, GIF and WEBP up to ${maxSize / 1024 / 1024}MB`}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                aria-label="Browse files"
              >
                Browse files
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isDragReject && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mt-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>Please upload a valid image file</span>
        </motion.div>
      )}
    </div>
  );
}

export default FileUpload;
