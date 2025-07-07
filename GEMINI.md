# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fantasia** is undergoing transformation from a children's storytelling application to an adult-oriented erotic content platform. The project generates personalized stories with voice narration and interactive elements, now targeting mature audiences with sophisticated adult themes.

**Current Version**: 1.1.4  
**Main Branch**: master  
**Project Type**: Single Page Application (SPA)  
**Target Audience**: Adults (18+)  
**Content Focus**: Adult erotic literature and interactive experiences  
**Language**: English (migrating from Spanish)

## Technology Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling with custom configuration
- **shadcn/ui** component library (extensive Radix UI components)
- **Framer Motion** for animations and transitions
- **Zustand** for state management
- **React Router DOM** for navigation
- **React Hook Form** with Zod validation
- **TanStack Query** for server state management

### Backend & Services
- **Supabase** as Backend-as-a-Service (BaaS)
  - Authentication and user management
  - PostgreSQL database with Row Level Security (RLS)
  - Edge Functions for serverless compute
  - File storage for audio and images
- **OpenAI** for AI-powered story generation and TTS
- **Google Generative AI** (Gemini) for story generation
- **Stripe** for payment processing and subscriptions
- **ElevenLabs** for voice synthesis (via API)

### Development Tools
- **TypeScript** with strict configuration
- **ESLint** with React and TypeScript rules
- **PostCSS** with Tailwind CSS
- **PM2** for production deployment
- **Bun** as package manager (with npm fallback)

## Project Structure

```
FantasIA/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components (~49 files)
│   │   └── [various].tsx    # App-specific components
│   ├── pages/               # Route-based page components
│   ├── services/            # API integration layer
│   │   ├── ai/             # AI service wrappers
│   │   └── [various].ts    # Database and third-party services
│   ├── store/              # Zustand state management
│   │   ├── character/      # Character management
│   │   ├── stories/        # Story-related state
│   │   ├── user/           # User profile and auth
│   │   └── core/           # Store utilities
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── config/             # App configuration
├── supabase/
│   ├── functions/          # Edge Functions
│   ├── migrations/         # Database migrations
│   └── sql-functions/      # Database functions
├── docs/                   # Project documentation
└── public/                 # Static assets
```

## Key Features

### Story Generation
- **Personalized Adult Stories**: AI-generated erotic tales based on character preferences, kinks, and interests
- **Chapter System**: Multi-chapter stories with continuation options
- **Multiple Genres**: Romance, BDSM, fantasy, contemporary, etc.
- **Character Customization**: Name, profession, personality, physical attributes, preferences

### Audio Features
- **Text-to-Speech**: Professional voice narration using OpenAI TTS with sensual voices
- **Multiple Voices**: Different personality-matched voices for adult content
- **Audio Player**: Custom audio player with progress tracking
- **Voice Preview**: Sample voices before selection

### Image Generation
- **AI-Generated Images**: DALL-E 3 integration for story illustrations (adult content)
- **Multiple Image Types**: Cover, scenes, character portraits
- **Automatic Generation**: Asynchronous image creation for stories

### Adult Content Features
- **Content Warnings**: Appropriate warnings for different types of adult content
- **Age Verification**: Robust age verification system
- **Customizable Content**: User preferences for content intensity and themes
- **Privacy Controls**: Enhanced privacy features for adult content

### User Management
- **Authentication**: Supabase Auth with email/password
- **Profiles**: User preferences and adult content settings
- **Subscriptions**: Stripe-powered payment system
- **Usage Tracking**: Story and voice credit limits

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:prod

# Preview production build
npm run start:prod
```

### Key Commands
- `npm run dev` - Start development server (localhost:8080)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and start production server

### Environment Setup
Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_ELEVENLABS_API_KEY` - ElevenLabs API key

## Architecture Patterns

### State Management
- **Zustand stores** for global state
- **Store separation** by domain (user, character, stories, etc.)
- **Persistence** with localStorage for offline support
- **Sync queue** for offline-first data handling

### Service Layer
- **Abstraction layer** between UI and backend
- **Edge Function wrappers** for AI services
- **Direct database access** with RLS security
- **Error handling** with standardized response format

### Component Architecture
- **Atomic design** with reusable components
- **Page-based routing** with React Router
- **Custom hooks** for shared logic
- **TypeScript** for type safety

## Database Schema

### Main Tables
- `profiles` - User profiles and preferences
- `characters` - Custom story characters
- `stories` - Generated stories with metadata
- `story_chapters` - Individual story chapters
- `audio_files` - Generated audio recordings
- `challenges` - Educational challenges
- `user_voices` - Voice preferences

### Security
- **Row Level Security (RLS)** on all tables
- **User-based access control**
- **Secure API key management** in Edge Functions

### SQL Documentation
For detailed SQL schema and RLS policies, consult:
- `/docs/supabase_tables.sql` - Complete table definitions and structure
- `/docs/supabase_RLS.sql` - Row Level Security policies and permissions

## Testing

**Note**: Currently no test framework is configured. The project uses:
- Manual testing in development
- TypeScript for compile-time validation
- ESLint for code quality
- Production monitoring for runtime issues

## Deployment

### Production Setup
- **PM2** for process management
- **Nginx** reverse proxy (not included in repo)
- **Environment variables** for configuration
- **Supabase Edge Functions** for serverless compute

### PM2 Configuration
```javascript
// ecosystem.config.cjs
{
  name: "cuenta-cuentos",
  script: "npm",
  args: "run start:prod",
  env: {
    NODE_ENV: "production",
    PORT: "8080"
  }
}
```

## Development Guidelines

### Transformation Rules
1. **Think First**: Read codebase for relevant files, write plan to tasks/todo.md
2. **Check Before Working**: Always verify plan with user before implementation
3. **High-Level Updates**: Give brief explanations of changes made
4. **Simple Changes**: Make every task as simple as possible, minimal code impact
5. **Review Documentation**: Add review section to todo.md with change summary

### Project Transformation Context
- **Content Migration**: Transform from children's stories to adult erotic content
- **Language Migration**: Gradually change from Spanish to English (new features in English)
- **Architecture Migration**: Replace Zustand local store with direct Supabase queries
- **Simplicity Focus**: Avoid massive or complex changes, every change should be incremental

### Code Style
- **TypeScript strict mode** enabled
- **ESLint** configuration with React rules
- **Consistent naming** (camelCase for JS, snake_case for DB)
- **Component organization** by feature/domain
- **English-first approach** for new functions and components

### Best Practices
- **Prefer editing** existing files over creating new ones
- **Use absolute imports** with `@/` alias
- **Handle errors** gracefully with user feedback
- **Implement loading states** for async operations
- **Follow Tailwind CSS** utility-first approach
- **Direct Supabase integration** for new features (avoid Zustand dependency)

### State Management Migration
- **Legacy**: Zustand stores with localStorage persistence
- **Target**: Direct Supabase queries with real-time subscriptions
- **Approach**: Gradual migration, maintain existing patterns during transition
- **New Features**: Extract data directly from Supabase, don't use local stores

## API Integration

### Edge Functions
- `generate-story` - AI adult story generation with mature themes
- `story-continuation` - Story continuation options for adult narratives
- `challenge` - Interactive adult content challenges
- `generate-audio` - Text-to-speech conversion with sensual voices
- `upload-story-image` - Adult content image generation and storage
- Stripe functions for payment processing

### External APIs
- **OpenAI** - GPT models and TTS
- **Google Generative AI** - Gemini models
- **Stripe** - Payment processing
- **ElevenLabs** - Voice synthesis

## Common Issues & Solutions

### Authentication
- **Race conditions** handled with auth guards
- **Session management** through Supabase client
- **Redirect handling** for auth callbacks

### Performance
- **Lazy loading** for route components
- **Image optimization** with proper formats
- **Audio streaming** for large files
- **State persistence** to avoid refetching

### Offline Support
- **Sync queue** for failed operations
- **localStorage persistence** for critical data
- **Network detection** for connectivity changes

## Transformation Roadmap

### Phase 1: Content Migration (Current)
- **Story Generation**: Update prompts for adult content
- **Character System**: Adapt for adult themes and preferences
- **Content Warnings**: Implement age verification and content warnings
- **Language**: Begin Spanish to English migration

### Phase 2: Architecture Migration
- **State Management**: Replace Zustand with direct Supabase queries
- **Real-time Features**: Implement Supabase real-time subscriptions
- **Database Optimization**: Optimize for adult content storage and retrieval

### Phase 3: Enhanced Features
- **Advanced Personalization**: AI-driven content customization
- **Community Features**: User-generated content and sharing
- **Enhanced Privacy**: Advanced privacy controls for adult platform

### Current Technical Debt
- **Spanish Language Content**: Systematic translation needed
- **Zustand Dependencies**: Local storage elimination required
- **Component Localization**: Adult content UI adaptations needed

## Implementation Guidelines

### Adult Content Considerations
- **Content Moderation**: Implement appropriate content filtering
- **Privacy First**: Enhanced privacy features for sensitive content
- **Age Verification**: Robust verification system
- **Content Warnings**: Clear labeling of content types and intensity

### Migration Strategy
- **Incremental Changes**: Small, focused updates
- **Backward Compatibility**: Maintain existing functionality during transition
- **Testing**: Manual testing for each change
- **Documentation**: Update docs as changes are implemented

---

**Last Updated**: January 2025  
**Version**: 1.1.4  
**Transformation Status**: Phase 1 - Content Migration  
**Maintainer**: Development Team

For detailed implementation guides, see the `/docs` directory and `/tasks/todo.md`.