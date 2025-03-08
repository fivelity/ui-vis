/**
 * Performance optimization utilities for React components and data processing
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce function for limiting how often a function can be called
 * @param func The function to debounce
 * @param wait Wait time in milliseconds
 * @param immediate Whether to call the function immediately
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Hook version of debounce for use with state or callbacks
 * @param value The value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Throttle function for limiting how often a function can be called
 * @param func The function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let lastContext: any = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(lastContext, lastArgs);
          lastArgs = null;
          lastContext = null;
        }
      }, limit);
    } else {
      lastArgs = args;
      lastContext = context;
    }
  };
}

/**
 * Hook for windowing large lists (virtual scrolling)
 * Only renders the items currently in view plus a buffer
 * @param totalItems Total number of items in the list
 * @param itemHeight Height of each item in pixels
 * @param visibleItems Number of items visible at once
 * @param buffer Number of items to render above/below the visible area
 * @returns Object with start index, end index, scrollTop position
 */
export function useVirtualization(
  totalItems: number,
  itemHeight: number,
  visibleItems: number,
  buffer = 5
) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop);
    }
  }, []);
  
  // Calculate which items should be rendered
  const startIndex = Math.max(0, Math.floor(scrollPosition / itemHeight) - buffer);
  const endIndex = Math.min(
    totalItems - 1,
    Math.floor((scrollPosition + (itemHeight * visibleItems)) / itemHeight) + buffer
  );
  
  // Calculate the total container height
  const totalHeight = totalItems * itemHeight;
  
  // Calculate offset for the rendered items
  const offsetY = startIndex * itemHeight;
  
  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => {
        currentRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);
  
  return {
    containerRef,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  };
}

/**
 * Hook for memoizing expensive computations
 * @param factory Factory function that creates the value
 * @param deps Dependencies that should trigger recalculation
 * @returns Memoized value
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ value: T; deps: React.DependencyList }>({
    value: undefined as unknown as T,
    deps: []
  });
  
  const depsChanged = !deps.every(
    (dep, i) => Object.is(dep, ref.current.deps[i])
  );
  
  if (depsChanged || ref.current.value === undefined) {
    ref.current.value = factory();
    ref.current.deps = deps;
  }
  
  return ref.current.value;
}

/**
 * Chunks array processing for better performance
 * Prevents UI blocking with large arrays by processing in chunks
 * @param items Array of items to process
 * @param processItem Function to process each item
 * @param chunkSize Number of items to process in each chunk
 * @param interval Time in ms between processing chunks
 * @returns Promise that resolves when processing is complete
 */
export function processArrayInChunks<T, R>(
  items: T[],
  processItem: (item: T, index: number) => R,
  chunkSize = 50,
  interval = 16
): Promise<R[]> {
  return new Promise((resolve) => {
    const result: R[] = [];
    const totalItems = items.length;
    let currentIndex = 0;
    
    function processNextChunk() {
      const endIndex = Math.min(currentIndex + chunkSize, totalItems);
      
      for (let i = currentIndex; i < endIndex; i++) {
        result[i] = processItem(items[i], i);
      }
      
      currentIndex = endIndex;
      
      if (currentIndex < totalItems) {
        setTimeout(processNextChunk, interval);
      } else {
        resolve(result);
      }
    }
    
    processNextChunk();
  });
}

/**
 * RAF throttled callback for smooth animations
 * @param callback Function to call on animation frame
 * @returns Throttled function
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  let requestId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  const throttled = function(this: any, ...args: Parameters<T>) {
    lastArgs = args;
    
    if (requestId === null) {
      requestId = requestAnimationFrame(() => {
        if (lastArgs) {
          callback.apply(this, lastArgs);
        }
        requestId = null;
      });
    }
  };
  
  throttled.cancel = () => {
    if (requestId !== null) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }
  };
  
  return throttled;
}
