/**
 * Animation utilities that respect reduced motion preferences
 */
import { useUIStore } from "@/lib/store";
import { useMemo } from "react";

/**
 * Common animation variants for consistent usage across components
 */
export const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  },
  fadeInUp: {
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
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  },
  // Staggered children animation
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  staggerItem: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  },
  // Scale animation
  scale: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  },
  // For cards, buttons that can have hover effects
  hoverScale: {
    scale: 1.02,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    }
  }
};

// Minimal variant for reduced motion users
const reducedMotionVariant = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// Cached variants to prevent unnecessary object creation
const cachedVariants = new Map<string, any>();

/**
 * Get appropriate animation variants based on reduced motion preference
 * Uses memoization for improved performance
 * 
 * @param preferredVariant - The preferred animation variant
 * @returns The appropriate animation variant (or minimal for reduced motion)
 */
export function useAnimationVariant(preferredVariant: keyof typeof animationVariants) {
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  
  return useMemo(() => {
    if (isReducedMotion) {
      return reducedMotionVariant;
    }
    
    const cacheKey = `variant-${preferredVariant}`;
    if (!cachedVariants.has(cacheKey)) {
      cachedVariants.set(cacheKey, animationVariants[preferredVariant]);
    }
    
    return cachedVariants.get(cacheKey);
  }, [isReducedMotion, preferredVariant]);
}

/**
 * Non-hook version for use outside of components
 * @param preferredVariant - The preferred animation variant
 * @returns The appropriate animation variant (or minimal for reduced motion)
 */
export function getAnimationVariant(preferredVariant: keyof typeof animationVariants) {
  const isReducedMotion = useUIStore.getState().isReducedMotion;
  
  if (isReducedMotion) {
    return reducedMotionVariant;
  }
  
  const cacheKey = `variant-${preferredVariant}`;
  if (!cachedVariants.has(cacheKey)) {
    cachedVariants.set(cacheKey, animationVariants[preferredVariant]);
  }
  
  return cachedVariants.get(cacheKey);
}

// Cached hover animations
const cachedHoverAnimations = {
  none: {},
  scale: { whileHover: animationVariants.hoverScale }
};

/**
 * Get hover animation props respecting reduced motion preferences
 * Uses memoization to prevent unnecessary renders
 */
export function useHoverAnimation() {
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  
  return useMemo(() => {
    return isReducedMotion ? cachedHoverAnimations.none : cachedHoverAnimations.scale;
  }, [isReducedMotion]);
}

/**
 * Non-hook version for use outside of components
 */
export function getHoverAnimation() {
  const isReducedMotion = useUIStore.getState().isReducedMotion;
  return isReducedMotion ? cachedHoverAnimations.none : cachedHoverAnimations.scale;
}

/**
 * Calculate stagger delay for children based on index
 * @param index - Child index
 * @param baseDelay - Base delay before starting stagger
 * @param staggerDelay - Delay between each child
 * @returns Calculated delay value
 */
export function getStaggerDelay(index: number, baseDelay = 0.2, staggerDelay = 0.1) {
  return baseDelay + (index * staggerDelay);
}

/**
 * Generate transition props that respect reduced motion preferences
 * @param duration - Animation duration in seconds
 * @param type - Animation type (tween, spring, etc)
 * @param delay - Delay before animation starts
 * @returns Transition props object
 */
export function getTransition(duration = 0.5, type = "tween", delay = 0) {
  const isReducedMotion = useUIStore.getState().isReducedMotion;
  
  if (isReducedMotion) {
    return { 
      duration: 0.3,
      delay: 0
    };
  }
  
  return {
    type,
    duration,
    delay
  };
}
