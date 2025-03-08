# Component Standards

This document outlines the standards and best practices for building components in the UI-Vis application. Following these guidelines ensures consistency, accessibility, and maintainability.

## Component Structure

### Folder Structure

```
ComponentName/
├── index.ts          # Re-export component
├── ComponentName.tsx # Main component
└── ComponentName.css # Component styles (if needed)
```

### Component Template

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "./ComponentName.css";

interface ComponentNameProps {
  /** Description of the property */
  property: string;
  /** Optional flag with default */
  optional?: boolean;
  /** Callback function */
  onChange?: (value: string) => void;
}

/**
 * ComponentName provides [brief description of functionality]
 * 
 * @example
 * <ComponentName property="value" onChange={handleChange} />
 */
export function ComponentName({
  property,
  optional = false,
  onChange,
}: ComponentNameProps) {
  // State definitions
  const [state, setState] = useState(initialState);
  
  // Event handlers
  const handleEvent = () => {
    // Logic
    if (onChange) {
      onChange(newValue);
    }
  };
  
  // Animation variants
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  
  return (
    <motion.div
      className={cn("base-classes", optional && "conditional-class")}
      initial="hidden"
      animate="visible"
      variants={variants}
      aria-label="Descriptive label"
    >
      {/* Component content */}
    </motion.div>
  );
}

export default ComponentName;
```

## Accessibility Standards

All components must adhere to WCAG 2.1 AA standards:

1. **Proper Semantic HTML**
   - Use correct elements (`button` for actions, `a` for links)
   - Structure content with appropriate heading levels
   - Use landmarks (`main`, `nav`, `aside`) appropriately

2. **ARIA Attributes**
   - Add `aria-label` for unlabeled interactive elements
   - Use `aria-expanded` for disclosure components
   - Implement `aria-live` for dynamic content updates

3. **Keyboard Navigation**
   - Ensure all interactive elements are focusable
   - Implement logical tab order
   - Provide keyboard shortcuts for complex components

4. **Color Contrast**
   - Maintain minimum 4.5:1 contrast ratio for text
   - Don't rely solely on color to convey information
   - Support dark/light themes without contrast issues

5. **Reduced Motion**
   - Check `prefers-reduced-motion` media query
   - Provide non-animated alternatives
   - Limit motion for vestibular disorders

## Animation Guidelines

Use Framer Motion for consistent animations:

```tsx
// Import motion components
import { motion } from "framer-motion";

// Define variants 
const variants = {
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

// Apply to components
<motion.div
  initial="hidden"
  animate="visible"
  variants={variants}
>
  Content
</motion.div>
```

## State Management

1. **Component State**
   - Use React's built-in hooks for component-specific state
   - Prefer `useState` for simple state
   - Use `useReducer` for complex state logic

2. **Form State**
   - Implement controlled components
   - Use form libraries for complex forms
   - Validate inputs and provide feedback

3. **Performance Optimization**
   - Memoize expensive components with `React.memo`
   - Use `useCallback` for event handlers passed to children
   - Implement `useMemo` for expensive calculations

## Error Handling

1. **User Feedback**
   - Provide clear error messages
   - Use toast notifications for transient errors
   - Inline validation for form fields

2. **Error Boundaries**
   - Implement error boundaries for critical components
   - Provide fallback UI when errors occur
   - Log errors for debugging

## Testing Requirements

All components should have:

1. **Unit Tests**
   - Test component rendering
   - Verify props handling
   - Check state changes

2. **Interaction Tests**
   - Simulate user interactions
   - Verify callbacks and events
   - Test keyboard accessibility

3. **Snapshot Tests**
   - Ensure consistent rendering
   - Prevent unintended UI changes

## Documentation

Components should be documented with:

1. **JSDoc Comments**
   - Describe component purpose
   - Document props with types and descriptions
   - Provide usage examples

2. **Storybook Stories**
   - Create stories for primary use cases
   - Show different prop configurations
   - Document accessibility considerations

## Performance Guidelines

1. **Lazy Loading**
   - Implement dynamic imports for heavy components
   - Use suspense boundaries for loading states

2. **Optimized Rendering**
   - Avoid unnecessary re-renders
   - Use virtualization for long lists
   - Implement pagination for large datasets

3. **Asset Optimization**
   - Optimize images and assets
   - Implement responsive images
   - Use SVGs for icons and illustrations
