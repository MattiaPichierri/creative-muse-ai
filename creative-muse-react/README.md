# 🎨 Creative Muse AI - React Edition

A modern, full-featured React application for AI-powered creative idea generation with real LLM integration, typing animations, and multilingual support.

## 🚀 Features

### Core Functionality
- **🤖 Real LLM Integration**: Authentic AI idea generation using Transformers
- **⌨️ Typing Animation**: Immersive character-by-character idea streaming
- **🎲 Random Discovery**: Generate ideas without prompts for inspiration
- **🌐 Multilingual Support**: German, English, and Italian with full i18n
- **📱 PWA Ready**: Installable on desktop and mobile with offline support

### Technical Features
- **⚡ Modern React**: Built with React 18, TypeScript, and Vite
- **🎨 Beautiful UI**: Tailwind CSS with dark mode and animations
- **🔄 Smart Routing**: Dynamic routes with React Router (`/ideas/:id`)
- **💾 Data Persistence**: Local storage with backend synchronization
- **📊 Advanced Statistics**: Real-time analytics and usage tracking
- **🔒 Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Python web framework
- **Transformers** - Hugging Face ML library
- **SQLite** - Lightweight database
- **Uvicorn** - ASGI server

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing
- **PWA Plugin** - Progressive Web App features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ with pip
- Git

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd creative-muse-ai

# Setup backend (in separate terminal)
cd ai_core
python3 -m venv venv
source venv/bin/activate  # or venv/bin/activate.fish for fish shell
pip install fastapi uvicorn torch transformers accelerate tokenizers
python main_llm.py  # Starts on port 8001

# Setup frontend
cd creative-muse-react
npm install
npm run dev  # Starts on port 3000
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

## 📱 Usage

### Basic Workflow
1. **Enter a Prompt**: Describe your idea, problem, or inspiration
2. **Select Category**: Choose from 9 specialized categories
3. **Configure Options**: 
   - Enable/disable real AI (LLM vs mock)
   - Toggle typing animation
   - Adjust creativity level (1-10)
4. **Generate Ideas**: Click generate or discover random ideas
5. **Rate & Manage**: Rate ideas, view details, export data

### Advanced Features
- **Language Switching**: Click 🌐 to cycle through languages
- **Dark Mode**: Toggle with 🌙/☀️ button
- **Idea Details**: Click any idea to view full details at `/ideas/:id`
- **Export Options**: JSON and Markdown export formats
- **Search & Filter**: Find ideas by content, category, or rating

## 🏗️ Project Structure

```
creative-muse-react/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── Layout/       # Header, navigation
│   │   └── IdeaGenerator/ # Form, cards, animations
│   ├── pages/            # Route components
│   │   ├── Home.tsx      # Main generator page
│   │   ├── Ideas.tsx     # Ideas list with filtering
│   │   ├── IdeaDetail.tsx # Individual idea view
│   │   ├── Stats.tsx     # Analytics dashboard
│   │   └── About.tsx     # About page
│   ├── context/          # React context for state
│   ├── services/         # API and data services
│   ├── i18n/            # Internationalization
│   ├── types/           # TypeScript definitions
│   └── index.css        # Global styles
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json         # Dependencies
```

## 🌐 API Integration

### Endpoints
- `POST /api/v1/generate` - Generate idea with options
- `POST /api/v1/generate/stream` - Streaming generation for typing
- `POST /api/v1/random` - Generate random idea
- `GET /api/v1/ideas` - List all ideas with filtering
- `PUT /api/v1/ideas/:id/rating` - Rate an idea
- `GET /api/v1/stats` - Get usage statistics
- `GET /health` - Health check with LLM status

### Request Examples
```typescript
// Generate idea with LLM
const response = await fetch('/api/v1/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Innovative app for sustainable living",
    category: "business",
    creativity_level: 8,
    language: "en",
    use_llm: true
  })
});

// Generate random idea
const randomResponse = await fetch('/api/v1/random', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: "technology",
    language: "de"
  })
});
```

## 🎨 Customization

### Adding New Languages
1. Add language to `src/types/index.ts`:
```typescript
export type Language = 'de' | 'en' | 'it' | 'fr';
```

2. Add translations to `src/i18n/translations.ts`:
```typescript
export const translations: Record<Language, Translation> = {
  // ... existing languages
  fr: {
    app: { title: "🎨 Creative Muse AI", subtitle: "..." },
    // ... complete translation object
  }
};
```

3. Update language cycling in components

### Adding New Categories
1. Update `Category` type in `src/types/index.ts`
2. Add translations for new category
3. Update backend mock ideas in `ai_core/main_llm.py`

### Styling Customization
- Modify `tailwind.config.js` for theme changes
- Update CSS custom properties in `src/index.css`
- Customize component styles in individual files

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Environment Variables
Create `.env.local`:
```
VITE_API_URL=http://localhost:8001/api/v1
VITE_APP_TITLE=Creative Muse AI
```

### Backend Development
```bash
cd ai_core
source venv/bin/activate
python main_llm.py  # Development server with auto-reload
```

## 📦 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Docker)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY ai_core/ .
RUN pip install -r requirements.txt
CMD ["python", "main_llm.py"]
```

### PWA Installation
The app can be installed as a PWA:
1. Visit the app in a supported browser
2. Look for "Install" prompt or menu option
3. App will be available as standalone application

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow existing code style and patterns
- Add translations for new UI text
- Test on multiple devices and browsers
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** - Transformers library
- **React Team** - Amazing framework
- **Tailwind CSS** - Beautiful styling system
- **Framer Motion** - Smooth animations
- **Lucide** - Beautiful icons

## 🔮 Roadmap

### Planned Features
- [ ] User accounts and cloud sync
- [ ] Collaborative idea development
- [ ] Advanced AI model selection
- [ ] Voice input and output
- [ ] Idea templates and workflows
- [ ] Integration with external tools
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Server-side rendering (Next.js)
- [ ] Advanced caching strategies
- [ ] Real-time collaboration
- [ ] Offline-first architecture
- [ ] Performance optimizations
- [ ] Accessibility improvements

---

**Creative Muse AI** - Empowering creativity through AI 🎨✨
