/**
 * Provider-specific optimized prompts for AI services
 */

/**
 * Get provider-specific analysis prompt template
 * @param provider AI provider name
 * @returns Optimized system prompt for design analysis
 */
export function getAnalysisSystemPrompt(provider: string): string {
  switch (provider.toLowerCase()) {
    case "openai":
      return `You are a senior UI/UX expert specializing in analyzing design mockups and converting them into structured Next.js implementations.
Focus on these key aspects:
1. Layout structure and component hierarchy
2. Visual design elements (colors, typography, spacing)
3. Interactive elements and user flows
4. Accessibility considerations
5. Responsive design patterns

Provide a comprehensive analysis that a developer could use to implement this design accurately using Next.js, React, TypeScript, and Tailwind CSS.`;

    case "togetherai":
      return `UI/UX expert analysis mode. Analyze the provided design and identify:
- Primary layout structure (grid, flexbox patterns)
- Color palette (provide exact colors when possible)
- Typography system (font families, sizes, weights)
- UI component patterns (describe functionality)
- Spacing and alignment system

Be concise yet thorough. Avoid explanations of your process.`;

    case "lmstudio":
      return `As a UI specialist, analyze this design image. 
Identify and describe:
- Main sections
- Components
- Colors
- Typography
- Spacing
- Interactions

Structure your response with clear sections.`;

    case "ollama":
      return `Provide a structured analysis of this UI design with the following sections:
# Layout
# Components
# Colors
# Typography
# Spacing
# Interactions

Be specific and detailed. Include exact measurements, color codes, and component descriptions when possible.`;

    default:
      return `Analyze this UI design and provide a detailed breakdown of its components, layout, styling, and interactivity. Be specific and thorough, focusing on details that would help implement this design in code.`;
  }
}

/**
 * Get provider-specific generation prompt template
 * @param provider AI provider name
 * @returns Optimized system prompt for code generation
 */
export function getGenerationSystemPrompt(provider: string): string {
  switch (provider.toLowerCase()) {
    case "openai":
      return `You are a senior developer who specializes in creating Next.js projects based on UI design analyses. 
Generate detailed, production-ready component files in Markdown format with file name as a header and code in a code block.
Each component should be fully functional and include:
- TypeScript with proper type definitions
- Tailwind CSS for styling
- Modern React patterns including hooks
- Framer Motion for animations
- Accessibility features (ARIA attributes, semantic HTML)
- Responsive design considerations

Format each file with:
# ComponentName.tsx
Description of the component's purpose and usage
\`\`\`tsx
// Code here
\`\`\``;

    case "togetherai":
      return `Next.js TypeScript developer mode. Generate complete, production-ready code files based on UI design analysis.
Each file must include:
- Full imports section
- TypeScript types for props
- Tailwind classes for styling
- Comments for complex logic
- Export statement

Use this format for each file:
# filename.tsx
\`\`\`tsx
// code
\`\`\``;

    case "lmstudio":
      return `Generate React component files for Next.js based on the design analysis.
Each file should:
- Use TypeScript
- Use Tailwind for styling
- Be properly structured
- Include necessary imports

Format as:
# Filename
\`\`\`tsx
// Code here
\`\`\``;

    case "ollama":
      return `Create Next.js component files based on this design analysis. For each component:

1. Use the format: # ComponentName.tsx followed by code block
2. Include imports, TypeScript types, and full implementation
3. Use Tailwind CSS for styling
4. Make components responsive and accessible

Example format:
# Button.tsx
\`\`\`tsx
// Code here
\`\`\``;

    default:
      return `Generate production-ready Next.js component files based on the design analysis. Use TypeScript, Tailwind CSS, and follow modern React best practices. Format each file with a markdown header containing the filename, followed by a code block with the implementation.`;
  }
}

/**
 * Get provider-specific parameters for optimal results
 * @param provider AI provider name
 * @param model Optional model name for more specific configurations
 * @returns Optimized parameters object
 */
export function getOptimalParameters(provider: string, model?: string): Record<string, any> {
  switch (provider.toLowerCase()) {
    case "openai":
      if (model?.includes("gpt-4")) {
        return {
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 1,
          frequency_penalty: 0.2,
          presence_penalty: 0.1,
        };
      }
      return {
        temperature: 0.8,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.2,
      };

    case "togetherai":
      return {
        temperature: 0.75,
        max_tokens: 4000,
        top_p: 0.9,
        top_k: 40,
        repetition_penalty: 1.1,
      };

    case "lmstudio":
      return {
        temperature: 0.8,
        max_tokens: 2000,
        top_p: 0.95,
        top_k: 50,
        repetition_penalty: 1.05,
      };

    case "ollama":
      return {
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        repeat_penalty: 1.1,
      };

    default:
      return {
        temperature: 0.7,
        max_tokens: 3000,
      };
  }
}

/**
 * Create an optimized analysis prompt for specific provider
 * @param provider AI provider name
 * @param textDescription Optional text description of the design
 * @returns Provider-optimized prompt
 */
export function createOptimizedAnalysisPrompt(provider: string, textDescription?: string): string {
  const basePrompt = "Analyze this UI design in detail";
  
  switch (provider.toLowerCase()) {
    case "openai":
      return `${basePrompt}. ${textDescription ? `The design represents: ${textDescription}. ` : ''}
Provide a comprehensive breakdown including:
1. Overall layout structure
2. Component hierarchy
3. UI elements and their functionality
4. Color scheme and typography
5. Spacing and alignment patterns
6. Responsive design considerations`;

    case "togetherai":
      return `${basePrompt}: ${textDescription || 'Shown in the image'}. 
Extract the following:
- Layout grid system
- Component structure
- Color palette (with hex codes if visible)
- Typography styles
- UI patterns
- Interactive elements`;

    case "lmstudio":
      return `${basePrompt}.${textDescription ? ` Description: ${textDescription}.` : ''} 
List all visual elements, layout structure, colors, and components that would be needed to recreate this design in code.`;

    case "ollama":
      return `${basePrompt}.${textDescription ? ` Context: ${textDescription}.` : ''} 
Create a detailed inventory of all UI elements and their styling properties.`;

    default:
      return `${basePrompt}.${textDescription ? ` Description: ${textDescription}.` : ''}`;
  }
}

/**
 * Create an optimized generation prompt for specific provider
 * @param provider AI provider name
 * @param analysis Design analysis text
 * @returns Provider-optimized prompt
 */
export function createOptimizedGenerationPrompt(provider: string, analysis: string): string {
  const basePrompt = "Based on this UI design analysis:";
  
  switch (provider.toLowerCase()) {
    case "openai":
      return `${basePrompt}

${analysis}

Generate complete, production-ready Next.js component files that would implement this design. 
Use TypeScript, Tailwind CSS, and include Framer Motion animations where appropriate.
Focus on creating reusable, accessible components with proper types and props.
For each file, provide:
1. The filename as a markdown heading (e.g., # ComponentName.tsx)
2. A brief description of the component's purpose
3. The complete code in a code block

Start with the main page component and then create all necessary sub-components.`;

    case "togetherai":
      return `${basePrompt}

${analysis}

Create Next.js TypeScript files to implement this design. For each file:
- Use Tailwind CSS for styling
- Include proper TypeScript types
- Follow React best practices
- Format as "# filename.tsx" followed by code block`;

    case "lmstudio":
      return `${basePrompt}

${analysis}

Generate the necessary React components to implement this UI. Each component should:
- Be a complete TypeScript file
- Use Tailwind for styling
- Include proper props interface
- Have basic comments explaining functionality
- Format using markdown headers for filenames`;

    case "ollama":
      return `${basePrompt}

${analysis}

Create React components that implement this design using Next.js, TypeScript and Tailwind CSS.
Format each component with "# filename.tsx" and code in triple backticks.`;

    default:
      return `${basePrompt}

${analysis}

Generate the React components needed to implement this design using Next.js, TypeScript, and Tailwind CSS.`;
  }
}
