"use client";

import React, { useEffect, ReactNode } from 'react';
import { motion, useAnimation, MotionProps, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export type AnimationPreset = 
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'zoomIn'
  | 'slideIn'
  | 'popIn'
  | 'none';

interface MotionSectionProps extends Omit<MotionProps, 'animate' | 'initial' | 'variants'> {
  children: ReactNode;
  className?: string;
  preset?: AnimationPreset;
  delay?: number;
  duration?: number;
  threshold?: number;
  staggerChildren?: number;
  triggerOnce?: boolean;
  as?: React.ElementType;
  staggerItems?: boolean;
  customVariants?: Variants;
}

const presets: Record<AnimationPreset, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  },
  slideIn: {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0 }
  },
  popIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', bounce: 0.4 }
    }
  },
  none: {
    hidden: {},
    visible: {}
  }
};

/**
 * MotionSection component with scroll-triggered animations
 * Animates when element comes into view using IntersectionObserver
 * Respects reduced motion preferences
 */
export function MotionSection({
  children,
  className,
  preset = 'fadeInUp',
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  staggerChildren = 0.1,
  triggerOnce = true,
  as = 'div',
  staggerItems = false,
  customVariants,
  ...props
}: MotionSectionProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce,
    threshold,
  });
  
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  
  // Start animation when element comes into view
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!triggerOnce) {
      controls.start('hidden');
    }
  }, [controls, inView, triggerOnce]);
  
  // Get selected variant preset or custom variants
  const selectedVariants = customVariants || presets[preset];
  
  // Apply transition settings
  const variants = {
    hidden: selectedVariants.hidden,
    visible: {
      ...selectedVariants.visible,
      transition: {
        duration: isReducedMotion ? 0 : duration,
        delay: isReducedMotion ? 0 : delay,
        staggerChildren: isReducedMotion ? 0 : staggerChildren,
        when: staggerItems ? 'beforeChildren' : 'afterChildren',
      },
    },
  };
  
  // Child variant for staggering
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { duration: isReducedMotion ? 0 : 0.3 }
    }
  };
  
  const MotionComponent = motion[as as keyof typeof motion] || motion.div;
  
  return (
    <MotionComponent
      ref={ref}
      className={cn(className)}
      initial={isReducedMotion ? 'visible' : 'hidden'}
      animate={controls}
      variants={variants}
      {...props}
    >
      {staggerItems
        ? React.Children.map(children, (child, i) => (
            <motion.div 
              key={i}
              variants={childVariants}
              style={{ display: 'contents' }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </MotionComponent>
  );
}

/**
 * StaggerItem component for use inside MotionSection
 * Designed to work with a parent MotionSection that has staggerItems prop
 */
export function StaggerItem({ 
  children,
  className,
  ...props
}: { 
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { duration: isReducedMotion ? 0 : 0.3 }
    }
  };
  
  return (
    <motion.div 
      className={className}
      variants={itemVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default MotionSection;
