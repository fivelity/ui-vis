"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';

export interface OptimizedImageProps {
  /** Source URL of the image */
  src: string;
  /** Alt text for the image */
  alt: string;
  /** Width of the image (in pixels or percentage) */
  width?: number | string;
  /** Height of the image (in pixels or percentage) */
  height?: number | string;
  /** Whether to lazy load the image */
  lazyLoad?: boolean;
  /** Whether to apply blur effect while loading */
  blurEffect?: boolean;
  /** CSS class to apply to the image wrapper */
  className?: string;
  /** CSS class to apply to the image itself */
  imageClassName?: string;
  /** Optional priority loading (disables lazy loading) */
  priority?: boolean;
  /** Optional object-fit property */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Optional callback when image successfully loads */
  onLoad?: () => void;
  /** Optional callback when image fails to load */
  onError?: () => void;
}

/**
 * OptimizedImage component for better image loading performance
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Blur-up loading effect
 * - Loading animation
 * - Error handling
 * - Accessibility support
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  lazyLoad = true,
  blurEffect = true,
  className,
  imageClassName,
  priority = false,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  
  // Set up intersection observer for lazy loading
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    // Skip intersection observer if priority is true
    skip: priority,
  });

  // Should the image be loaded now?
  const shouldLoad = priority || (!lazyLoad) || inView;
  
  // Handle image load event
  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error event
  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  // Reset states if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Determine the styles for the container based on width/height props
  const containerStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || 'auto',
    position: 'relative',
  };

  // Define the placeholder animation for loading state
  const placeholderVariants = {
    initial: { 
      opacity: 1 
    },
    loaded: { 
      opacity: 0,
      transition: { 
        duration: isReducedMotion ? 0 : 0.3,
        ease: 'easeOut'
      }
    }
  };

  // Define the image animation for loaded state
  const imageVariants = {
    initial: { 
      opacity: 0,
      filter: blurEffect ? 'blur(10px)' : 'none',
      scale: blurEffect ? 1.05 : 1
    },
    loaded: { 
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: { 
        duration: isReducedMotion ? 0 : blurEffect ? 0.5 : 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div 
      ref={ref}
      className={cn("overflow-hidden", className)} 
      style={containerStyle}
      role="img"
      aria-label={alt}
    >
      {/* Loading placeholder */}
      {shouldLoad && !isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-muted/30 animate-pulse"
          initial="initial"
          animate={isLoaded ? "loaded" : "initial"}
          variants={placeholderVariants}
        />
      )}

      {/* Actual image */}
      {shouldLoad && !hasError && (
        <motion.img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full transition-opacity", 
            imageClassName
          )}
          style={{ 
            objectFit,
            opacity: isLoaded ? 1 : 0 
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          initial="initial"
          animate={isLoaded ? "loaded" : "initial"}
          variants={imageVariants}
          loading={priority ? "eager" : "lazy"}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="flex items-center justify-center w-full h-full bg-muted/10 border border-muted">
          <span className="text-muted-foreground text-sm">
            Failed to load image
          </span>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
