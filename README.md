# UI-Vis: AI-Powered Design-to-Code Platform

<div align="center">
  <img src="public/ui-vis-logo.svg" alt="UI-Vis Logo" width="180" />
  <p><em>Transform UI designs into production-ready code with AI</em></p>
</div>

## 🌟 Overview

UI-Vis bridges the gap between design and development by using advanced AI to convert UI designs into accessible, standard-compliant code. Upload a design image or provide a text description, and UI-Vis will generate the corresponding code implementation with your preferred framework and styling approach.

### ✨ Key Features

- **Multi-input Design Analysis**: Process images, text descriptions, or URLs
- **Multiple AI Provider Support**: Use OpenAI, TogetherAI, or Ollama (local models)
- **Framework Selection**: Generate code for React, Vue, or vanilla HTML/CSS/JS
- **Styling Options**: Tailwind CSS, CSS Modules, or standard CSS
- **Responsive Implementation**: Mobile-first, adaptive layouts
- **Accessibility-Focused**: WCAG compliant code generation
- **Real-time Preview**: Visualize the generated UI instantly
- **Export Options**: Download complete projects or individual files
- **Custom Configuration**: Control complexity, styling, and interactivity

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm, yarn, or pnpm
- An API key for at least one supported AI provider (OpenAI, TogetherAI)
  - Alternatively, [Ollama](https://ollama.ai) for local model execution

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fivelity/ui-vis.git
   cd ui-vis
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
4. Edit `.env.local` to add your AI provider credentials:
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
   npm run dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔌 Configuration Options

### AI Providers

UI-Vis supports the following AI providers:

- **OpenAI**: Best quality with GPT-4 Vision for image analysis and GPT-4 for code generation
- **TogetherAI**: Cost-effective alternative using open models like Llama 3
- **Ollama**: Free, private option using locally-run models (requires separate installation)

For detailed setup instructions for each provider, see our provider-specific guides:
- [OpenAI Setup Guide](docs/openai-setup.md)
- [TogetherAI Setup Guide](.dev_docs/together-ai-integration.md)
- [Ollama Setup Guide](.dev_docs/ollama-integration.md)

### Framework Options

Generate code for your preferred tech stack:

- **React**: Components with hooks and modern patterns
- **Vue**: Vue 3 components with Composition API
- **Vanilla**: HTML, CSS, and JavaScript without framework dependencies
- **Next.js**: App Router components (experimental)

### Styling Approaches

Choose your preferred styling method:

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Modules**: Scoped CSS with class name isolation
- **Vanilla CSS**: Standard CSS with BEM naming convention
- **CSS-in-JS**: Styled components or Emotion (React/Next.js only)

## 📚 Documentation

### User Documentation
- [Project Overview](docs/project-overview.md)
- [User Guide](docs/user-guide.md)
- [Configuration Options](docs/configuration.md)
- [Troubleshooting](docs/troubleshooting.md)

### Developer Documentation
- [Architecture Overview](.dev_docs/architecture.md)
- [AI Integration Guide](.dev_docs/ai-provider-integration.md)
- [Component Standards](.dev_docs/component-standards.md)
- [Type System](.dev_docs/type-system.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🔮 Roadmap

- **Enhanced Component Recognition**: Improved accuracy for complex UI elements
- **Animation Support**: Generate animations and transitions
- **Design System Integration**: Import design tokens from Figma
- **Component Library Export**: Generate reusable component libraries
- **API Mocking**: Create mock APIs based on UI requirements
- **Collaborative Editing**: Real-time collaboration on projects
- **Mobile App Generation**: React Native and Flutter support

## 🤝 Contributing

Contributions are welcome! See our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the incredible framework
- Vercel AI SDK for simplified AI provider integration
- shadcn/ui for beautiful, accessible UI components
- All AI providers for their powerful models and APIs

---

<div align="center">
  <p>Made with ❤️ by the UI-Vis team</p>
  <p>
    <a href="https://twitter.com/uivisapp">Twitter</a> •
    <a href="https://github.com/fivelity/ui-vis">GitHub</a> •
    <a href="https://fivelity.com">Website</a>
  </p>
</div>
