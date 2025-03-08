# UI-Vis Development Guide

This guide provides detailed instructions for setting up and contributing to the UI-Vis development environment.

## Development Environment Setup

### Prerequisites

- Node.js 18.17.0 or higher
- Git
- npm, yarn, or pnpm (pnpm recommended)
- Code editor (VS Code recommended with recommended extensions)
- API keys for AI providers you want to test with

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/fivelity/ui-vis.git
   cd ui-vis
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Add your API keys to `.env.local`:
   ```
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # TogetherAI
   TOGETHER_API_KEY=your_together_api_key
   
   # Ollama (for local models)
   OLLAMA_BASE_URL=http://localhost:11434
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the application.

### VS Code Setup

We recommend using VS Code with the following extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostCSS Language Support
- Import Cost
- Error Lens

Our workspace settings include:
- Format on save enabled
- ESLint auto-fix on save
- TypeScript strict mode

## Project Structure

```
ui-vis/
├── .dev_docs/            # Developer documentation
├── .github/              # GitHub workflows and templates
├── docs/                 # User documentation
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── ai/           # AI-specific components
│   │   ├── animation/    # Animation components
│   │   ├── ui/           # UI components (shadcn/ui)
│   │   └── wizard/       # Generation wizard components
│   ├── lib/              # Shared utilities and logic
│   │   ├── ai/           # AI provider integration
│   │   ├── config/       # Application configuration
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # General utilities
│   ├── styles/           # Global styles
│   └── types/            # TypeScript type definitions
├── .env.example          # Example environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Key Development Areas

### AI Provider Integration

The AI integration is located in `src/lib/ai/` and includes:

- `providers.ts`: Provider client initialization
- `services.ts`: High-level AI service functions
- `utils.ts`: Helper functions for AI integration
- `models.ts`: Model definitions and provider configuration

When adding or modifying AI providers, ensure you:
1. Update model definitions in `models.ts`
2. Implement provider-specific initialization in `providers.ts`
3. Add handling in service functions in `services.ts`
4. Implement any required utility functions in `utils.ts`

See [AI Provider Integration Guide](.dev_docs/ai-provider-integration.md) for detailed instructions.

### Component Development

UI-Vis follows a component-driven development approach:

1. Each component should be focused on a single responsibility
2. Components should be typed with TypeScript
3. Use shadcn/ui components as building blocks
4. Follow our [Component Standards](.dev_docs/component-standards.md)

When creating new components:
- Use the established folder structure
- Include proper TypeScript typing
- Add appropriate tests
- Ensure accessibility compliance

### Animation Development

UI-Vis uses Framer Motion for animations:

- Respect user preferences for reduced motion
- Keep animations subtle and purposeful
- Use shared animation variants for consistency
- Implement performant animations that don't impact core functionality

Example of proper animation implementation:

```tsx
import { motion } from 'framer-motion';
import { useUIStore } from '@/lib/store';

function AnimatedComponent() {
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };
  
  return (
    <motion.div
      variants={variants}
      initial={isReducedMotion ? "visible" : "hidden"}
      animate="visible"
    >
      Content
    </motion.div>
  );
}
```

## Development Workflow

### Feature Development Process

1. **Issue Selection**: Pick an issue from the GitHub Issues board or create a new one
2. **Branch Creation**: Create a feature branch using the naming convention: `feature/issue-number-short-description`
3. **Development**: Implement the feature following our coding standards
4. **Testing**: Add appropriate tests and ensure all existing tests pass
5. **Documentation**: Update or add documentation as needed
6. **Pull Request**: Create a PR with a clear description of changes

### Code Review Process

All code contributions go through the following review process:

1. Automated checks: TypeScript compilation, ESLint, tests
2. Peer review by at least one team member
3. Final approval by a maintainer

### Commit Guidelines

Follow conventional commits pattern for consistency:

```
type(scope): subject

body

footer
```

Types include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting changes
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or fixing tests
- `chore`: Maintenance tasks

Example:
```
feat(ai): add support for Together AI provider

Implements client initialization and API calls for Together AI.
Updates model selection UI to show Together AI models.

Closes #123
```

## Testing

UI-Vis uses the following testing tools:

- Jest for unit and integration tests
- React Testing Library for component tests
- Playwright for end-to-end tests

### Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run component tests
pnpm test:component

# Run e2e tests
pnpm test:e2e
```

### Writing Tests

When writing tests:
- Focus on behavior, not implementation details
- Use meaningful test descriptions
- Mock external services appropriately
- Test edge cases and error scenarios

Example component test:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProviderSelector } from './ProviderSelector';

describe('ProviderSelector', () => {
  it('should display all available providers', () => {
    render(<ProviderSelector providers={mockProviders} onChange={() => {}} />);
    
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('TogetherAI')).toBeInTheDocument();
    expect(screen.getByText('Ollama')).toBeInTheDocument();
  });
  
  it('should call onChange when a provider is selected', () => {
    const handleChange = jest.fn();
    render(<ProviderSelector providers={mockProviders} onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('TogetherAI'));
    
    expect(handleChange).toHaveBeenCalledWith('togetherai');
  });
});
```

## Performance Optimization

Keep these performance considerations in mind:

1. **Bundle Size**: Monitor import size and use dynamic imports for large dependencies
2. **Rendering Optimization**: Use React.memo, useMemo, and useCallback appropriately
3. **Image Optimization**: Use Next.js Image component with proper sizing
4. **API Calls**: Implement caching and debouncing for expensive operations
5. **Animation Performance**: Use hardware-accelerated properties for animations

Use the built-in performance monitoring tools:
- Lighthouse in Chrome DevTools
- Next.js Analytics
- Web Vitals reporting

## Accessibility Standards

All UI-Vis components must meet WCAG 2.1 AA standards:

- Proper heading structure
- Sufficient color contrast
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Reduced motion support

Use the accessibility tools in Chrome DevTools and automated checks with axe-core during development.

## Additional Resources

- [Architecture Overview](.dev_docs/architecture.md): Overall system architecture
- [Type System](.dev_docs/type-system.md): TypeScript usage and patterns
- [AI Integration Guide](.dev_docs/ai-provider-integration.md): Detailed AI provider setup
- [Component Standards](.dev_docs/component-standards.md): UI component guidelines

## Getting Help

If you need assistance while contributing:
- Check existing documentation
- Ask in the #development channel in Discord
- Reach out to maintainers
- Open a discussion on GitHub

---

Thank you for contributing to UI-Vis! Your efforts help make design-to-code conversion more accessible to developers everywhere.
